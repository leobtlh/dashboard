// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

// Interface pour le module de conformité (KYC)
interface ICompliance {
    function isAllowed(address user) external view returns (bool);
}

// =============================================================
// CONTRACT: JUNIOR TOKEN
// =============================================================

/**
 * @title HPIVJuniorToken
 * @dev Token représentant la part "Junior" (Risque élevé / Rendement élevé).
 * Il est entièrement contrôlé par le Vault Senior.
 */
contract HPIVJuniorToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(string memory name, string memory symbol, address _vault)
        ERC20(name, symbol)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, _vault);
        _grantRole(MINTER_ROLE, _vault);
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyRole(MINTER_ROLE) {
        _burn(from, amount);
    }
}

// =============================================================
// CONTRACT: MAIN VAULT (SENIOR TRANCHE)
// =============================================================

/**
 * @title IStrategy
 * @dev Interface pour le placement du Float (Aave, Compound, etc.)
 */
interface IStrategy {
    function invest(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function withdrawAll() external;
    function totalValue() external view returns (uint256);
}

/**
 * @title HPIVVault (Senior Tranche & Coordinator)
 * @dev Ce contrat est un ERC4626 représentant la tranche SENIOR.
 * Il gère aussi la tranche JUNIOR via un token satellite.
 * Aligné sur app.html : Supporte Description, Dates, et Waterfall Junior/Senior.
 */
contract HPIVVault is ERC4626, AccessControl, ReentrancyGuard {
    using Math for uint256;

    // --- RÔLES ---
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant INSURER_ROLE = keccak256("INSURER_ROLE");
    bytes32 public constant DAO_ROLE = keccak256("DAO_ROLE");

    // --- STATE MACHINE ---
    enum VaultStatus { PENDING, OPEN, ACTIVE, MATURED, TRIGGERED }
    VaultStatus public status;

    // --- CONFIGURATION ---
    HPIVJuniorToken public juniorToken; // Token Junior séparé

    string public riskName;
    string public description; // Requis par app.html pour l'affichage
    uint256 public immutable MAX_CAPACITY;
    uint256 public immutable MAX_COVERAGE;
    uint256 public immutable START_DATE;
    uint256 public immutable MATURITY_DATE;

    // --- COMPTABILITÉ (WATERFALL) ---
    // On sépare le capital investi (Principal) du rendement (Premium) pour gérer la cascade de pertes.
    uint256 public seniorPrincipal;
    uint256 public juniorPrincipal;
    uint256 public insurerFirstLossCapital;
    uint256 public premiumReserve; // Prime payée par l'assureur, distribuée à la fin

    // Gestion des pertes
    uint256 public seniorLossPercent; // 1e18 scale (0 = 0%, 1e18 = 100%)
    uint256 public juniorLossPercent; // 1e18 scale

    // --- STRATÉGIE ---
    IStrategy public strategy;
    address public complianceModule; // Gardé pour compatibilité constructeur

    // --- EVENTS ---
    event VaultInitialized(uint256 insurerCapital, uint256 premium);
    event JuniorDeposit(address indexed user, uint256 assets, uint256 shares);
    event JuniorWithdraw(address indexed user, uint256 assets, uint256 shares);
    event CatastropheTriggered(uint256 claimAmount, uint256 juniorLoss, uint256 seniorLoss);
    event StatusChanged(VaultStatus newStatus);

    constructor(
        IERC20 _asset,
        address _compliance,
        address _insurer,
        uint256 _maxCapacity,
        uint256 _maxCoverage,
        uint256 _startDate,
        uint256 _maturityDate,
        string memory _riskName,
        string memory _description,
        string memory _tokenName,
        string memory _tokenSymbol
    ) ERC4626(_asset) ERC20(string.concat("Senior ", _tokenName), string.concat("s", _tokenSymbol)) {
        require(_maturityDate > _startDate, "Dates invalid");

        // Configuration Roles
        _grantRole(DEFAULT_ADMIN_ROLE, _insurer);
        _grantRole(INSURER_ROLE, _insurer);
        _grantRole(DAO_ROLE, _insurer);
        _grantRole(ORACLE_ROLE, _insurer); // Pour la démo, l'assureur peut aussi déclencher l'oracle

        complianceModule = _compliance;
        MAX_CAPACITY = _maxCapacity;
        MAX_COVERAGE = _maxCoverage;
        START_DATE = _startDate;
        MATURITY_DATE = _maturityDate;
        riskName = _riskName;
        description = _description;
        status = VaultStatus.PENDING;

        // Déploiement du Token Junior
        juniorToken = new HPIVJuniorToken(
            string.concat("Junior ", _tokenName),
            string.concat("j", _tokenSymbol),
            address(this)
        );
    }

    // =============================================================
    // 1. INITIALISATION SÉCURISÉE (Anti-Inflation Attack)
    // =============================================================

    /**
     * @dev L'assureur initialise le vault.
     * PROTECTION: On mint des "Dead Shares" pour verrouiller le taux de change initial.
     */
    function initializeVault(uint256 _insurerCapital, uint256 _premium) external nonReentrant onlyRole(INSURER_ROLE) {
        require(status == VaultStatus.PENDING, "Already initialized");
        require(_insurerCapital > 1000, "Capital too low for security check");

        // Transfert des fonds Assureur
        uint256 totalNeeded = _insurerCapital + _premium;
        IERC20(asset()).transferFrom(msg.sender, address(this), totalNeeded);

        // Comptabilité
        insurerFirstLossCapital = _insurerCapital;
        premiumReserve = _premium;

        // PROTECTION ANTI-INFLATION (DONATION ATTACK)
        // On mint 1000 shares de Senior et Junior pour l'adresse 0xdead (Burn)
        // Cela fixe le dénominateur initial et empêche les attaques d'arrondi.
        // Ces 1000 wei proviennent du capital de l'assureur (coût de sécurité négligeable).

        // Lock Senior Dead Shares
        _mint(address(0xdead), 1000);
        seniorPrincipal += 1000;

        // Lock Junior Dead Shares
        juniorToken.mint(address(0xdead), 1000);
        juniorPrincipal += 1000;

        // On ajuste le capital assureur effectif (il "paie" pour la sécurité)
        insurerFirstLossCapital -= 2000;

        status = VaultStatus.OPEN;
        emit VaultInitialized(_insurerCapital, _premium);
        emit StatusChanged(VaultStatus.OPEN);
    }

    // =============================================================
    // 2. GESTION DES DÉPÔTS (SENIOR & JUNIOR)
    // =============================================================

    /**
     * @dev Dépôt SENIOR (Standard ERC4626).
     * Override pour gérer les limites et périodes.
     */
    function deposit(uint256 assets, address receiver) public override nonReentrant returns (uint256) {
        require(ICompliance(complianceModule).isAllowed(receiver), "KYC Required");
        require(status == VaultStatus.OPEN, "Vault not open");
        require(block.timestamp < START_DATE, "Subscription closed");
        require(totalAssets() + assets <= MAX_CAPACITY, "Max Cap reached");

        uint256 shares = super.deposit(assets, receiver);
        seniorPrincipal += assets;

        return shares;
    }

    /**
     * @dev Dépôt JUNIOR (Custom).
     * Les Juniors prennent plus de risque pour plus de rendement.
     */
    function depositJunior(uint256 assets) external nonReentrant returns (uint256) {
        require(ICompliance(complianceModule).isAllowed(msg.sender), "KYC Required");
        require(status == VaultStatus.OPEN, "Vault not open");
        require(block.timestamp < START_DATE, "Subscription closed");
        require(totalAssets() + assets <= MAX_CAPACITY, "Max Cap reached");

        IERC20(asset()).transferFrom(msg.sender, address(this), assets);

        // Mint 1:1 pour simplifier lors de la souscription (avant yield)
        uint256 shares = assets;
        juniorToken.mint(msg.sender, shares);

        juniorPrincipal += assets;
        emit JuniorDeposit(msg.sender, assets, shares);
        return shares;
    }

    // =============================================================
    // 3. GESTION DES RETRAITS (WATERFALL)
    // =============================================================

    /**
     * @dev Withdrawal Logic Helper
     */
    function _canWithdraw() internal view {
        if (status == VaultStatus.OPEN) return; // Autorisé d'annuler avant le début
        if (status == VaultStatus.MATURED) return; // Autorisé après la fin
        if (status == VaultStatus.TRIGGERED) return; // Autorisé après crash (Soft Default)
        revert("Funds locked during active risk period");
    }

    /**
     * @dev Retrait SENIOR.
     * Prend en compte les pertes potentielles (seniorLossPercent).
     */
    function withdraw(uint256 assets, address receiver, address owner) public override nonReentrant returns (uint256) {
        _canWithdraw();
        // Si perte Senior, on réduit le montant sortant réellement via le mécanisme de preview de ERC4626
        // ou via la valeur intrinsèque des shares qui a baissé.

        uint256 shares = previewWithdraw(assets);
        uint256 recoveredAssets = super.withdraw(assets, receiver, owner);

        // Mise à jour comptabilité
        if (seniorPrincipal >= recoveredAssets) {
            seniorPrincipal -= recoveredAssets;
        } else {
            seniorPrincipal = 0;
        }

        return recoveredAssets;
    }

    /**
     * @dev Retrait JUNIOR.
     */
    function withdrawJunior(uint256 shares) external nonReentrant {
        _canWithdraw();

        uint256 totalJuniorSupply = juniorToken.totalSupply();
        require(totalJuniorSupply > 0, "No junior shares");

        // Calcul de la valeur par part Junior
        uint256 currentJuniorEquity = _calculateJuniorEquity();

        uint256 assetsToReturn = (shares * currentJuniorEquity) / totalJuniorSupply;

        juniorToken.burn(msg.sender, shares);
        IERC20(asset()).transfer(msg.sender, assetsToReturn);

        if (juniorPrincipal >= assetsToReturn) {
            juniorPrincipal -= assetsToReturn;
        } else {
            juniorPrincipal = 0;
        }

        emit JuniorWithdraw(msg.sender, assetsToReturn, shares);
    }

    // =============================================================
    // 4. MOTEUR DE SINISTRE (WATERFALL ENGINE)
    // =============================================================

    /**
     * @dev Déclenchement du sinistre par l'Oracle.
     * Applique la logique de "First Loss" : Assureur -> Junior -> Senior.
     */
    function triggerCatastrophe(uint256 claimAmount) external onlyRole(ORACLE_ROLE) nonReentrant {
        require(status == VaultStatus.ACTIVE || (block.timestamp >= START_DATE && status != VaultStatus.TRIGGERED), "Invalid state");

        // 1. Récupération des fonds externes (Strategy)
        if (address(strategy) != address(0)) {
            try strategy.withdrawAll() {} catch {}
        }

        uint256 remainingClaim = claimAmount;

        // ETAPE 1: Capital Assureur (First Loss)
        if (insurerFirstLossCapital >= remainingClaim) {
            insurerFirstLossCapital -= remainingClaim;
            remainingClaim = 0;
        } else {
            remainingClaim -= insurerFirstLossCapital;
            insurerFirstLossCapital = 0;
        }

        // ETAPE 2: Premium Reserve (Le yield sert de tampon avant le principal)
        if (remainingClaim > 0) {
             if (premiumReserve >= remainingClaim) {
                premiumReserve -= remainingClaim;
                remainingClaim = 0;
            } else {
                remainingClaim -= premiumReserve;
                premiumReserve = 0;
            }
        }

        // ETAPE 3: Tranche Junior
        if (remainingClaim > 0) {
            if (juniorPrincipal >= remainingClaim) {
                juniorPrincipal -= remainingClaim;
                juniorLossPercent = (remainingClaim * 1e18) / (juniorPrincipal + remainingClaim);
                remainingClaim = 0;
            } else {
                uint256 loss = juniorPrincipal;
                juniorPrincipal = 0;
                juniorLossPercent = 1e18; // 100% perte
                remainingClaim -= loss;
            }
        }

        // ETAPE 4: Tranche Senior
        if (remainingClaim > 0) {
            if (seniorPrincipal >= remainingClaim) {
                seniorPrincipal -= remainingClaim;
                seniorLossPercent = (remainingClaim * 1e18) / (seniorPrincipal + remainingClaim);
                remainingClaim = 0;
            } else {
                // Défaut total
                seniorPrincipal = 0;
                seniorLossPercent = 1e18;
            }
        }

        // Simulation du paiement du sinistre (Sortie des fonds vers 0xdead pour matérialiser la perte)
        IERC20(asset()).transfer(address(0xdead), claimAmount);

        status = VaultStatus.TRIGGERED;
        emit CatastropheTriggered(claimAmount, juniorLossPercent, seniorLossPercent);
        emit StatusChanged(VaultStatus.TRIGGERED);
    }

    /**
     * @dev Fin de période sans sinistre.
     */
    function setMatured() external {
        require(block.timestamp >= MATURITY_DATE, "Not mature yet");
        require(status == VaultStatus.ACTIVE || status == VaultStatus.OPEN, "Invalid state");
        status = VaultStatus.MATURED;
        emit StatusChanged(VaultStatus.MATURED);
    }

    /**
     * @dev Passage de OPEN à ACTIVE (Lock des fonds)
     */
    function activateVault() external {
        require(block.timestamp >= START_DATE, "Too early");
        require(status == VaultStatus.OPEN, "Invalid state");
        status = VaultStatus.ACTIVE;
        emit StatusChanged(VaultStatus.ACTIVE);
    }

    // =============================================================
    // 5. VALORISATION & VIEW FUNCTIONS
    // =============================================================

    function totalAssets() public view override returns (uint256) {
        return IERC20(asset()).balanceOf(address(this));
    }

    /**
     * @dev Helper requis par app.html pour afficher les infos
     */
    function getDetails() external view returns (string memory, string memory, uint256, uint256) {
        return (riskName, description, START_DATE, MATURITY_DATE);
    }

    function _calculateJuniorEquity() internal view returns (uint256) {
        if (juniorPrincipal == 0) return 0;
        if (status == VaultStatus.TRIGGERED && juniorPrincipal == 0) return 0;

        // Le Junior récupère son principal restant + sa part du premium restant
        uint256 totalPrincipal = seniorPrincipal + juniorPrincipal;
        if (totalPrincipal == 0) return 0;

        uint256 juniorShareOfPremium = (premiumReserve * juniorPrincipal) / totalPrincipal;
        return juniorPrincipal + juniorShareOfPremium;
    }
}
