// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./HPIVVault.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HPIV Factory
 * @dev Usine mise à jour pour déployer les Vaults Multi-Tranches.
 * Restauration complète des helpers pour compatibilité Front-End.
 */
contract HPIVFactory is Ownable {

    address[] public allVaults;
    mapping(address => bool) public isValidVault;

    // --- WHITELIST ASSUREURS & KYB ---
    enum RequestStatus { None, Pending, Approved, Rejected }

    struct InsurerRequest {
        string companyName;  // Nom de l'entité légale
        string kybHash;      // Hash IPFS
        RequestStatus status;
        uint256 requestDate;
    }

    mapping(address => bool) public isWhitelistedInsurer;
    mapping(address => InsurerRequest) public insurerRequests;
    address[] public pendingRequestAddresses;

    // --- EVENTS ---
    event VaultCreated(
        address indexed vaultAddress,
        address indexed insurer,
        string riskName,
        uint256 capTotal,
        uint256 startDate,
        uint256 maturityDate
    );

    event InsurerStatusChanged(address indexed insurer, bool status);

    event RegistrationRequested(
        address indexed insurer,
        string companyName,
        string kybHash,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {
        // Démo : Whitelist de l'adresse de déploiement pour tests
        isWhitelistedInsurer[msg.sender] = true;
    }

    /**
     * @dev Soumettre une demande d'enregistrement (KYB).
     */
    function registerInsurer(string memory _companyName, string memory _kybHash) external {
        require(!isWhitelistedInsurer[msg.sender], "Already whitelisted");
        // Accepte si status est None ou Rejected (permet de resoumettre)
        require(insurerRequests[msg.sender].status != RequestStatus.Pending, "Request pending");

        insurerRequests[msg.sender] = InsurerRequest({
            companyName: _companyName,
            kybHash: _kybHash,
            status: RequestStatus.Pending,
            requestDate: block.timestamp
        });

        pendingRequestAddresses.push(msg.sender);
        emit RegistrationRequested(msg.sender, _companyName, _kybHash, block.timestamp);
    }

    /**
     * @dev Admin : Valider ou rejeter un assureur.
     */
    function setInsurerStatus(address _insurer, bool _status) external onlyOwner {
        isWhitelistedInsurer[_insurer] = _status;
        insurerRequests[_insurer].status = _status ? RequestStatus.Approved : RequestStatus.Rejected;
        emit InsurerStatusChanged(_insurer, _status);
    }

    /**
     * @dev Création d'un Vault HPIV Sécurisé Multi-Tranches.
     */
    function createVault(
        IERC20 _asset,
        address _compliance, // Gardé pour compatibilité signature app.html
        uint256 _capTotal,
        uint256 _maxCoverage,
        uint256 _startDate,
        uint256 _maturityDate,
        string memory _riskName,
        string memory _description
    ) external returns (address) {
        require(isWhitelistedInsurer[msg.sender], "Not authorized");
        require(_maturityDate > _startDate, "Invalid dates");

        // Génération automatique des symboles pour Junior/Senior
        string memory tokenName = _riskName;
        string memory tokenSymbol = "HPIV";

        HPIVVault newVault = new HPIVVault(
            _asset,
            _compliance,
            msg.sender,
            _capTotal,
            _maxCoverage,
            _startDate,
            _maturityDate,
            _riskName,
            _description,
            tokenName,
            tokenSymbol
        );

        address vaultAddr = address(newVault);
        allVaults.push(vaultAddr);
        isValidVault[vaultAddr] = true;

        emit VaultCreated(vaultAddr, msg.sender, _riskName, _capTotal, _startDate, _maturityDate);

        return vaultAddr;
    }

    // --- HELPERS FRONT-END (RESTAURÉS) ---

    function totalVaults() external view returns (uint256) {
        return allVaults.length;
    }

    function getPendingRequests() external view returns (address[] memory) {
        return pendingRequestAddresses;
    }

    function getRequestDetails(address _insurer) external view returns (InsurerRequest memory) {
        return insurerRequests[_insurer];
    }

    function getAllVaults() external view returns (address[] memory) {
        return allVaults;
    }
}
