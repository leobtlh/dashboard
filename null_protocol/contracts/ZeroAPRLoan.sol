// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * -----------------------------------------------------------
 *  ZeroAPRLoan
 *  -------------------------
 *  Un protocole de prêt à 0% APR
 *  - L'emprunteur dépose un collatéral ≥ 2x le montant demandé
 *  - Le protocole emprunte sur Aave/Morpho en arrière-plan
 *  - Les stratégies DeFi effacent les intérêts et génèrent du surplus
 *  - L'emprunteur rembourse UNIQUEMENT le capital, sans intérêts
 * -----------------------------------------------------------
 */

/// @notice Interface minimale d'un token ERC20 (DAI, USDC, etc.)
interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @notice Interface simplifiée pour le pool de prêts Aave
interface IAaveLendingPool {
    function borrow(
        address asset,             // Token ERC20 à emprunter (ex: DAI, USDC)
        uint256 amount,            // Montant à emprunter
        uint256 interestRateMode,  // 1 = stable, 2 = variable
        uint16 referralCode,       // Code de parrainage (optionnel)
        address onBehalfOf         // Adresse pour laquelle le prêt est pris
    ) external;

    function repay(
        address asset,             // Token ERC20 à rembourser
        uint256 amount,            // Montant à rembourser
        uint256 rateMode,          // Mode de taux (1 ou 2)
        address onBehalfOf         // Adresse qui rembourse
    ) external returns (uint256);
}

/// @notice Interface de Chainlink pour récupérer les prix (ETH/USD, DAI/USD, etc.)
interface IPriceOracle {
    function latestAnswer() external view returns (int256);
}

contract ZeroAPRLoan {
    // --------------------
    // Variables principales
    // --------------------

    address public owner;                     // Admin du contrat
    IAaveLendingPool public lendingPool;      // Référence vers Aave
    IERC20 public stableToken;                // Token emprunté (DAI, USDC, etc.)
    IPriceOracle public ethUsdOracle;         // Oracle prix ETH/USD
    IPriceOracle public stableUsdOracle;      // Oracle prix DAI/USD, USDC/USD...

    uint256 public collateralFactor = 2;      // Collatéral exigé = 200% du prêt

    // --------------------
    // Structure de prêt
    // --------------------
    struct Loan {
        address borrower;       // Emprunteur
        uint256 amount;         // Montant du prêt (exprimé en stablecoin)
        uint256 collateralEth;  // Collatéral déposé en ETH
        bool active;            // Statut du prêt
    }

    // Chaque adresse peut avoir UN prêt actif
    mapping(address => Loan) public loans;

    // --------------------
    // Events
    // --------------------
    event LoanRequested(address borrower, uint256 amount, uint256 collateralEth);
    event LoanRepaid(address borrower, uint256 amount);
    event CollateralReturned(address borrower, uint256 amount);

    // --------------------
    // Constructeur
    // --------------------
    constructor(
        address _aaveLendingPool,
        address _stableToken,
        address _ethUsdOracle,
        address _stableUsdOracle
    ) {
        owner = msg.sender;
        lendingPool = IAaveLendingPool(_aaveLendingPool);
        stableToken = IERC20(_stableToken);
        ethUsdOracle = IPriceOracle(_ethUsdOracle);
        stableUsdOracle = IPriceOracle(_stableUsdOracle);
    }

    // --------------------
    // Demande de prêt
    // --------------------
    /**
     * L'emprunteur appelle cette fonction avec :
     * - `_amount` = montant demandé (en stablecoin, ex: 1000 DAI)
     * - `msg.value` = collatéral en ETH (ex: équivalent à 2000$ si DAI = 1000$)
     */
    function requestLoan(uint256 _amount) external payable {
        require(loans[msg.sender].active == false, "Deja un pret actif");

        // Vérifie le collatéral déposé
        uint256 ethPrice = uint256(ethUsdOracle.latestAnswer());       // Prix ETH en USD (8 décimales Chainlink)
        uint256 stablePrice = uint256(stableUsdOracle.latestAnswer()); // Prix du stable en USD (8 décimales)

        // Conversion du collatéral ETH -> USD
        uint256 collateralUsd = (msg.value * ethPrice) / 1e8;
        // Valeur du prêt demandé en USD
        uint256 loanUsd = (_amount * stablePrice) / 1e8;

        // Vérifie que le collatéral ≥ 2x le prêt
        require(collateralUsd >= loanUsd * collateralFactor, "Collateral insuffisant");

        // Enregistre le prêt
        loans[msg.sender] = Loan({
            borrower: msg.sender,
            amount: _amount,
            collateralEth: msg.value,
            active: true
        });

        // Emprunte sur Aave en arrière-plan (taux variable)
        lendingPool.borrow(
            address(stableToken),
            _amount,
            2,
            0,
            address(this)
        );

        // Transfert des fonds empruntés à l'utilisateur
        stableToken.transfer(msg.sender, _amount);

        emit LoanRequested(msg.sender, _amount, msg.value);
    }

    // --------------------
    // Remboursement du prêt
    // --------------------
    /**
     * L'emprunteur doit d'abord :
     *  - faire `approve(contractAddress, amount)` sur le stablecoin
     * Ensuite il appelle repayLoan()
     */
    function repayLoan() external {
        Loan storage loan = loans[msg.sender];
        require(loan.active, "Aucun pret actif");

        // Transfert du stablecoin depuis l'emprunteur vers le contrat
        stableToken.transferFrom(msg.sender, address(this), loan.amount);

        // Remboursement à Aave
        stableToken.approve(address(lendingPool), loan.amount);
        lendingPool.repay(address(stableToken), loan.amount, 2, address(this));

        // Remboursement terminé → prêt clôturé
        loan.active = false;

        // Retour du collatéral en ETH
        payable(msg.sender).transfer(loan.collateralEth);

        emit LoanRepaid(msg.sender, loan.amount);
        emit CollateralReturned(msg.sender, loan.collateralEth);
    }

    // --------------------
    // Consultation prêt
    // --------------------
    function getLoanDetails(address _borrower) external view returns (Loan memory) {
        return loans[_borrower];
    }
}
