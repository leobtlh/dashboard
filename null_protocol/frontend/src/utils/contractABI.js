// contractABI.js
// ------------------------------------------------------------
// Contient les informations nécessaires pour interagir avec :
//   1. Le smart contract ZeroAPRLoan (ton protocole).
//   2. Le stablecoin utilisé comme actif emprunté/remboursé (DAI/USDC).
//
// Ces informations incluent :
//   - L'adresse du contrat déployé (contractAddress).
//   - L'ABI (Application Binary Interface) du contrat.
//   - L'adresse du token stable utilisé.
//   - L'ABI du token stable (standard ERC20).
// ------------------------------------------------------------

// ------------------------------------------------------------
// 1. Adresse du contrat ZeroAPRLoan
// ------------------------------------------------------------
// ⚠️ IMPORTANT : tu devras remplacer cette adresse par
// l'adresse réelle une fois ton contrat déployé sur
// testnet (Goerli, Sepolia) ou mainnet.
export const contractAddress = "0x0000000000000000000000000000000000000000";

// ------------------------------------------------------------
// 2. ABI du contrat ZeroAPRLoan
// ------------------------------------------------------------
// L'ABI décrit toutes les fonctions publiques du contrat.
// C'est ce qui permet à ethers.js d'appeler les fonctions.
// Ici j'inclus uniquement celles définies dans smartContract.sol
export const contractABI = [
  // requestLoan(uint256 _amount)
  {
    "inputs": [
      { "internalType": "uint256", "name": "_amount", "type": "uint256" }
    ],
    "name": "requestLoan",
    "outputs": [],
    "stateMutability": "payable", // car on envoie du collatéral en ETH
    "type": "function"
  },
  // repayLoan()
  {
    "inputs": [],
    "name": "repayLoan",
    "outputs": [],
    "stateMutability": "payable", // car remboursement en ETH ou token
    "type": "function"
  },
  // getLoanDetails(address _borrower)
  {
    "inputs": [
      { "internalType": "address", "name": "_borrower", "type": "address" }
    ],
    "name": "getLoanDetails",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "borrower", "type": "address" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" },
          { "internalType": "uint256", "name": "collateral", "type": "uint256" },
          { "internalType": "bool", "name": "active", "type": "bool" }
        ],
        "internalType": "struct ZeroAPRLoan.Loan",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// ------------------------------------------------------------
// 3. Adresse du stablecoin
// ------------------------------------------------------------
// ⚠️ IMPORTANT : tu dois mettre l'adresse du token stable
// que tu utilises sur le réseau choisi.
//
// Exemple pour Sepolia (testnet) avec USDC/DAI mocké :
//   DAI Sepolia : 0x68194a729C2450ad26072b3D33ADaCbcef39D574
//
// Tu peux aussi déployer ton propre ERC20 pour tester.
export const stableTokenAddress = "0x0000000000000000000000000000000000000000";

// ------------------------------------------------------------
// 4. ABI standard ERC20
// ------------------------------------------------------------
// Les fonctions de base nécessaires pour interagir avec un token ERC20.
// Notamment : balanceOf, approve, allowance, transfer, transferFrom.
export const stableABI = [
  // balanceOf(address account)
  {
    "constant": true,
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "type": "function"
  },
  // approve(address spender, uint256 amount)
  {
    "constant": false,
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  },
  // allowance(address owner, address spender)
  {
    "constant": true,
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "type": "function"
  },
  // transfer(address to, uint256 amount)
  {
    "constant": false,
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  },
  // transferFrom(address from, address to, uint256 amount)
  {
    "constant": false,
    "inputs": [
      { "name": "from", "type": "address" },
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "transferFrom",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  }
];
