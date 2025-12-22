// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title HPIV Vault (Hybrid Parametric Insurance Vault)
 * @dev Vault ERC-4626 avec logique de "Soft Default" et Tranches de Risque (Junior/Senior).
 * Gère les dépôts, le KYC, l'oracle météo et la distribution des pertes en cascade.
 */
contract HPIVVault is ERC4626, AccessControl {
    using Math for uint256;

    // --- RÔLES DE SÉCURITÉ ---
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant INSURER_ROLE = keccak256("INSURER_ROLE");

    // --- CONFIGURATION DU VAULT (IMMUTABLE) ---
    uint256 public immutable MAX_VAULT_CAPACITY;       // Ex: 40,000,000 USDC
    uint256 public immutable INSURER_FIRST_LOSS_CAPITAL; // Ex: 4,000,000 USDC (Tranche Junior)
    uint256 public immutable MAX_COVERAGE_AMOUNT;      // Ex: 20,000,000 USDC (Sinistre Max)
    uint256 public immutable MATURITY_DATE;            // Timestamp de fin (ex: 18 Janvier)
    uint256 public constant LOCK_WINDOW = 5 days;      // Blocage avant maturité

    // --- ÉTAT DU SYSTÈME ---
    bool public isCatastropheTriggered;                // TRUE si l'Oracle valide le sinistre
    uint256 public seniorLossRatio;                    // % de perte pour les investisseurs (Base 1e18)
    address public complianceModule;                   // Contrat de Whitelist (KYC)

    // --- EVENTS (Pour le Frontend) ---
    event CatastropheTriggered(uint256 severity, uint256 claimAmount, uint256 investorLossPercent);
    event ComplianceUpdated(address newModule);

    /**
     * @param _asset L'adresse du token sous-jacent (ex: USDC)
     * @param _compliance L'adresse du contrat de KYC
     * @param _insurer L'adresse du portefeuille de l'assureur
     * @param _capTotal La capacité totale (40M)
     * @param _insurerJuniorAmount La part de l'assureur (4M)
     * @param _maxCoverage Le montant max du sinistre (20M)
     * @param _durationInDays Durée du vault (ex: 30 jours)
     */
    constructor(
        IERC20 _asset,
        address _compliance,
        address _insurer,
        uint256 _capTotal,
        uint256 _insurerJuniorAmount,
        uint256 _maxCoverage,
        uint256 _durationInDays
    ) ERC4626(_asset) ERC20("HPIV Insurance Vault", "HPIV-LP") {
        require(_insurerJuniorAmount < _capTotal, "Junior tranche must be < Total cap");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(INSURER_ROLE, _insurer);
        // L'oracle sera défini plus tard par l'admin via grantRole

        complianceModule = _compliance;
        MAX_VAULT_CAPACITY = _capTotal;
        INSURER_FIRST_LOSS_CAPITAL = _insurerJuniorAmount;
        MAX_COVERAGE_AMOUNT = _maxCoverage;
        MATURITY_DATE = block.timestamp + (_durationInDays * 1 days);
    }

    // =============================================================
    // 1. LOGIQUE DE DÉPÔT & CONFORMITÉ (KYC)
    // =============================================================

    /**
     * @dev Surcharge du dépôt standard pour ajouter KYC et Plafonds.
     */
    function deposit(uint256 assets, address receiver) public override returns (uint256) {
        // 1. Vérification KYC (Conformité Suisse LBA)
        require(_isWhitelisted(receiver), "HPIV: Investor not KYC verified");

        // 2. Vérification du Plafond (Hard Cap)
        require(totalAssets() + assets <= MAX_VAULT_CAPACITY, "HPIV: Vault capacity exceeded");

        // 3. Vérification de la Période
        require(block.timestamp < MATURITY_DATE, "HPIV: Deposit period over");

        // Si c'est l'assureur, on vérifie qu'il ne dépasse pas sa tranche
        if (hasRole(INSURER_ROLE, receiver)) {
            // Note: Simplification. Idéalement, on suit le montant exact déposé par l'assureur.
        }

        return super.deposit(assets, receiver);
    }

    // =============================================================
    // 2. CŒUR DU SYSTÈME : GESTION DU SINISTRE (ORACLE)
    // =============================================================

    /**
     * @dev Appelée par l'Oracle (Chainlink/API) pour valider une catastrophe.
     * @param measuredValue La valeur mesurée (ex: vitesse vent 260 km/h)
     */
    function triggerCatastrophe(uint256 measuredValue) external onlyRole(ORACLE_ROLE) {
        require(!isCatastropheTriggered, "HPIV: Event already triggered");
        require(block.timestamp <= MATURITY_DATE + 2 days, "HPIV: Coverage expired"); // +2 jours de grace

        // 1. Validation de l'événement
        isCatastropheTriggered = true;

        // 2. Calcul du montant du sinistre (Ici fixe à MAX_COVERAGE, mais pourrait être graduel)
        uint256 actualClaimAmount = MAX_COVERAGE_AMOUNT;

        // 3. CALCUL DU "SOFT DEFAULT" (Mathématiques HPIV)
        // ----------------------------------------------------
        // Formule: Reste à payer = Sinistre - Tranche Junior
        //          Si Sinistre < Junior, Investisseurs ne paient rien.

        uint256 investorLossAmount = 0;

        if (actualClaimAmount > INSURER_FIRST_LOSS_CAPITAL) {
            investorLossAmount = actualClaimAmount - INSURER_FIRST_LOSS_CAPITAL;
        }

        // 4. Calcul du Ratio de Perte pour les investisseurs (Haircut)
        // Ex: 16M / 36M = 0.4444...
        uint256 currentInvestorEquity = totalAssets() - INSURER_FIRST_LOSS_CAPITAL;

        if (currentInvestorEquity > 0) {
            seniorLossRatio = (investorLossAmount * 1e18) / currentInvestorEquity;
        }

        emit CatastropheTriggered(measuredValue, actualClaimAmount, seniorLossRatio);
    }

    // =============================================================
    // 3. LOGIQUE DE RETRAIT & VALORISATION (WATERFALL)
    // =============================================================

    /**
     * @dev Surcharge de previewRedeem pour appliquer la perte asymétrique.
     * C'est ici que l'Assureur perd 100% et l'Investisseur perd X%.
     */
    function previewRedeem(uint256 shares) public view override returns (uint256) {
        // Calcul standard des actifs (Assets = Shares * Price)
        uint256 grossAssets = super.previewRedeem(shares);

        // Si aucune catastrophe, retour standard (100% + Yield)
        if (!isCatastropheTriggered) {
            return grossAssets;
        }

        // SCÉNARIO CATASTROPHE : Application des pertes différenciées

        // Cas A : C'est l'Assureur (Junior Tranche)
        // Simplification: On assume que l'appelant est l'assureur via msg.sender dans redeem
        // Note: Dans preview, on ne connait pas toujours le owner, c'est une limitation ERC4626.
        // Pour ce prototype, on applique le ratio Senior par défaut,
        // l'Assureur devrait avoir une fonction spécifique ou perdre ses shares via burn.

        // Cas B : C'est l'Investisseur (Senior Tranche)
        // Formule : Montant * (1 - RatioPerte)
        uint256 loss = (grossAssets * seniorLossRatio) / 1e18;
        return grossAssets - loss;
    }

    /**
     * @dev Exécution du retrait avec blocage temporel (Hard Lock).
     */
    function withdraw(uint256 assets, address receiver, address owner) public override returns (uint256) {
        // 1. Vérification du Hard Lock (5 jours avant maturité)
        bool isLockPeriod = block.timestamp >= (MATURITY_DATE - LOCK_WINDOW) && block.timestamp < MATURITY_DATE;
        require(!isLockPeriod, "HPIV: Funds locked 5 days before maturity");

        // 2. Si c'est l'assureur qui retire APRES une catastrophe
        if (hasRole(INSURER_ROLE, owner) && isCatastropheTriggered) {
             revert("HPIV: Insurer Junior Tranche fully absorbed");
        }

        return super.withdraw(assets, receiver, owner);
    }

    // =============================================================
    // 4. FONCTIONS UTILITAIRES
    // =============================================================

    // Interface interne pour le module KYC (à adapter selon le provider choisi)
    function _isWhitelisted(address _user) internal view returns (bool) {
        // Exemple simple: appel à un smart contract externe
        // return ICompliance(complianceModule).check(_user);
        return true; // Bypass pour le test, à activer en prod
    }
}
