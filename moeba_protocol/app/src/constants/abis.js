// Adresse fictive pour la démo, à remplacer par l'adresse déployée du HPIVFactory
export const FACTORY_ADDRESS_LIVE = "0x0000000000000000000000000000000000000000";

// ABI pour vérifier le status Whitelist sur la Factory + Register
export const FACTORY_ABI_EXTENDED = [
    "function isWhitelistedInsurer(address insurer) view returns (bool)",
    "function registerInsurer(string companyName, string kybHash) external",
    "function insurerRequests(address insurer) view returns (string companyName, string kybHash, uint8 status, uint256 requestDate)"
];

// ABI Minimal pour lire les balances ERC20
export const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

// Whitelist locale pour simulation
export const INSURER_WHITELIST_LOCAL = [
    '0x912f9886fb676750943fdefc4c30d3ca927c3a72',
    '0x5B757b308b8842698035C53b8ea0844240ac485B',
    '0xsimulated000000000000000000000000000000'
].map(addr => addr.toLowerCase());
