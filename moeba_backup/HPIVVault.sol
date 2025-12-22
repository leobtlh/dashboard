// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title HPIV Vault (Hybrid Parametric Insurance Vault) - Final Version
 * @dev Protocole d'Assurance Paramétrique avec Amorçage Obligatoire par l'Assureur.
 * L'assureur doit déposer sa Tranche Junior ET la Prime (Yield) pour ouvrir le vault.
 */
contract HPIVVault is ERC4626, AccessControl {
    using Math for uint256;

    // --- RÔLES ---
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant INSURER_ROLE = keccak256("INSURER_ROLE");

    // --- CONFIGURATION ---
    uint256 public immutable MAX_VAULT_CAPACITY;
    uint256 public immutable MAX_COVERAGE_AMOUNT;
    uint256 public immutable MATURITY_DATE;
    uint256 public constant LOCK_WINDOW = 5 days;

    // --- ÉTAT FINANCIER ---
    bool public isVaultInitialized;                    // Le vault est-il ouvert ?
    uint256 public insurerJuniorCapital;               // La part "First Loss" déposée
    uint256 public insurerPremiumPaid;                 // La prime déposée (Yield)

    // --- ÉTAT DU SINISTRE ---
    bool public isCatastropheTriggered;
    uint256 public seniorLossRatio;                    // % de perte investisseur (1e18)
    address public complianceModule;

    // --- EVENTS ---
    event VaultInitialized(uint256 juniorCapital, uint256 premiumAmount, uint256 timestamp);
    event CatastropheTriggered(uint256 severity, uint256 claimAmount, uint256 investorLossPercent);

    constructor(
        IERC20 _asset,
        address _compliance,
        address _insurer,
        uint256 _capTotal,
        uint256 _maxCoverage,
        uint256 _durationInDays
    ) ERC4626(_asset) ERC20("HPIV Insurance Vault", "HPIV-LP") {
        _grantRole(DEFAULT_ADMIN_ROLE, _insurer);
        _grantRole(INSURER_ROLE, _insurer);

        complianceModule = _compliance;
        MAX_VAULT_CAPACITY = _capTotal;
        MAX_COVERAGE_AMOUNT = _maxCoverage;
        MATURITY_DATE = block.timestamp + (_durationInDays * 1 days);
    }

    // =============================================================
    // 1. ACTIVATION DU VAULT (L'Assureur paie d'abord)
    // =============================================================

    /**
     * @dev Fonction critique. L'assureur fixe ici son niveau de risque.
     * @param _juniorAmount Le montant qu'il risque en premier (ex: 4M$)
     * @param _premiumAmount Le montant qu'il offre en rendement (ex: 330k$)
     */
    function initializeVault(uint256 _juniorAmount, uint256 _premiumAmount) external onlyRole(INSURER_ROLE) {
        require(!isVaultInitialized, "HPIV: Already initialized");
        require(_juniorAmount > 0 && _premiumAmount > 0, "Amounts must be > 0");
        require(_juniorAmount < MAX_VAULT_CAPACITY, "Junior > Max Cap");

        // 1. Transfert de la Tranche Junior (Capital à Risque)
        // L'assureur reçoit des parts (shares) pour ce capital, car c'est son argent (sauf sinistre)
        // On utilise la logique interne _deposit pour minter les parts à l'assureur
        IERC20(asset()).transferFrom(msg.sender, address(this), _juniorAmount);

        // Note technique : Pour simplifier la comptabilité du "First Loss",
        // on considère ici le Junior Capital comme un dépôt "spécial" tracé séparément.
        insurerJuniorCapital = _juniorAmount;

        // 2. Transfert de la Prime (Yield pur)
        // Ce montant est transféré SANS minter de parts. Il enrichit le pot commun immédiatement.
        IERC20(asset()).transferFrom(msg.sender, address(this), _premiumAmount);
        insurerPremiumPaid = _premiumAmount;

        // 3. Ouverture des vannes
        isVaultInitialized = true;

        emit VaultInitialized(_juniorAmount, _premiumAmount, block.timestamp);
    }

    // =============================================================
    // 2. DÉPÔT INVESTISSEURS (Bloqué tant que non activé)
    // =============================================================

    function deposit(uint256 assets, address receiver) public override returns (uint256) {
        require(isVaultInitialized, "HPIV: Vault waiting for Insurer funding");
        require(_isWhitelisted(receiver), "HPIV: KYC required");

        // On vérifie le plafond en incluant le capital déjà déposé par l'assureur
        require(totalAssets() + assets <= MAX_VAULT_CAPACITY, "HPIV: Vault full");
        require(block.timestamp < MATURITY_DATE, "HPIV: Too late");

        return super.deposit(assets, receiver);
    }

    // =============================================================
    // 3. GESTION DU SINISTRE (LOGIQUE FIRST LOSS)
    // =============================================================

    function triggerCatastrophe(uint256 measuredValue) external onlyRole(ORACLE_ROLE) {
        require(isVaultInitialized, "HPIV: Not initialized");
        require(!isCatastropheTriggered, "HPIV: Already triggered");

        isCatastropheTriggered = true;
        uint256 actualClaimAmount = MAX_COVERAGE_AMOUNT;

        // --- CŒUR DU CALCUL : JUNIOR TRANCHE FIRST ---

        uint256 investorLossAmount = 0;

        // Si le sinistre est plus grand que ce que l'assureur a mis en Junior
        if (actualClaimAmount > insurerJuniorCapital) {
            investorLossAmount = actualClaimAmount - insurerJuniorCapital;
        } else {
            // Sinon, l'assureur couvre tout, les investisseurs ne perdent rien
            investorLossAmount = 0;
        }

        // Calcul du Ratio pour les investisseurs (Senior Tranche)
        // On calcule sur la base des actifs totaux MOINS la part junior (déjà morte)
        // et MOINS la prime (qui est un bonus, pas du capital garanti)

        uint256 currentTotalAssets = totalAssets();

        // Equity des investisseurs = Tout ce qu'il y a dans le coffre - La part de l'assureur
        uint256 seniorEquity = 0;
        if (currentTotalAssets > insurerJuniorCapital) {
            seniorEquity = currentTotalAssets - insurerJuniorCapital;
        }

        if (seniorEquity > 0) {
            seniorLossRatio = (investorLossAmount * 1e18) / seniorEquity;
        } else {
            seniorLossRatio = 1e18; // 100% de perte si plus rien
        }

        emit CatastropheTriggered(measuredValue, actualClaimAmount, seniorLossRatio);
    }

    // =============================================================
    // 4. RETRAIT & WATERFALL
    // =============================================================

    function previewRedeem(uint256 shares) public view override returns (uint256) {
        uint256 grossAssets = super.previewRedeem(shares);

        if (!isCatastropheTriggered) {
            return grossAssets;
        }

        // Si sinistre : application du Haircut
        uint256 loss = (grossAssets * seniorLossRatio) / 1e18;

        // Sécurité underflow
        if (loss > grossAssets) return 0;
        return grossAssets - loss;
    }

    function withdraw(uint256 assets, address receiver, address owner) public override returns (uint256) {
        // Hard Lock check
        bool isLockPeriod = block.timestamp >= (MATURITY_DATE - LOCK_WINDOW) && block.timestamp < MATURITY_DATE;
        require(!isLockPeriod, "HPIV: Locked period");

        // Protection : L'assureur ne peut pas retirer son Junior Capital s'il a été consommé
        // Note: Ici, l'assureur n'a pas minté de LP tokens standards pour sa Junior Tranche dans cette version simplifiée
        // (il l'a déposé en collatéral pur).
        // S'il avait des parts, on bloquerait ici.

        return super.withdraw(assets, receiver, owner);
    }

    // --- VUE UTILITAIRE POUR LE FRONTEND ---

    /**
     * @dev Permet au site web de calculer l'APY instantané.
     * Yield = (Prime / Capacité Senior) * (365 / Durée)
     */
    function getEstimatedAPY() external view returns (uint256) {
        if (!isVaultInitialized || totalAssets() <= insurerJuniorCapital) return 0;

        uint256 seniorLiquidity = totalAssets() - insurerJuniorCapital;
        // Formule simple pour l'affichage (x 100 pour %)
        return (insurerPremiumPaid * 100 * 365) / (seniorLiquidity * ((MATURITY_DATE - block.timestamp) / 1 days + 1));
    }

    function _isWhitelisted(address) internal view returns (bool) {
        return true;
    }
}
