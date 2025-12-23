// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./HPIVVault.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HPIV Factory
 * @dev Usine à Smart Contracts. Permet aux assureurs (ou à l'admin) de déployer
 * de nouveaux Vaults isolés pour ségréguer les risques.
 */
contract HPIVFactory is Ownable {

    // Registre de tous les vaults déployés (pour le Frontend)
    address[] public allVaults;

    // Mapping pour vérifier si une adresse est un vrai vault HPIV
    mapping(address => bool) public isValidVault;

    // Events pour l'indexation (The Graph / Frontend)
    event VaultCreated(
        address indexed vaultAddress,
        address indexed insurer,
        string riskName,
        uint256 capTotal
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Crée une nouvelle instance de Vault ségréguée.
     * @param _asset Token utilisé (ex: USDC)
     * @param _compliance Adresse du module KYC
     * @param _capTotal Capacité max (ex: 40M)
     * @param _maxCoverage Couverture max (ex: 20M)
     * @param _durationInDays Durée (ex: 30)
     * @param _riskName Nom du risque (ex: "Florida Wind 2026") - juste pour l'event
     */
    function createVault(
        IERC20 _asset,
        address _compliance,
        uint256 _capTotal,
        uint256 _maxCoverage,
        uint256 _durationInDays,
        string memory _riskName
    ) external returns (address) {

        // 1. Déploiement d'une NOUVELLE instance de HPIVVault
        // Le `msg.sender` (l'appelant) devient l'Assureur (INSURER_ROLE) du nouveau vault
        HPIVVault newVault = new HPIVVault(
            _asset,
            _compliance,
            msg.sender, // L'assureur est celui qui clique sur le bouton "Créer"
            _capTotal,
            _maxCoverage,
            _durationInDays
        );

        address vaultAddr = address(newVault);

        // 2. Enregistrement dans le registre protocolaire
        allVaults.push(vaultAddr);
        isValidVault[vaultAddr] = true;

        // 3. Emission de l'event pour le Frontend
        emit VaultCreated(vaultAddr, msg.sender, _riskName, _capTotal);

        return vaultAddr;
    }

    /**
     * @dev Retourne le nombre total de vaults créés
     */
    function totalVaults() external view returns (uint256) {
        return allVaults.length;
    }
}
