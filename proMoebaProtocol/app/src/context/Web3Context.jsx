import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from './ToastContext';
import { TOKEN_MAP } from '../constants/mocks';
import { ERC20_ABI } from '../constants/abis';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
    const { showToast } = useToast();

    // États du Wallet
    const [walletConnected, setWalletConnected] = useState(false);
    const [userAddress, setUserAddress] = useState('');     // Format court (0x12...34)
    const [userFullAddress, setUserFullAddress] = useState(''); // Format long
    const [userBalance, setUserBalance] = useState('0.00'); // Solde NATIF (ETH)

    // Mode Live vs Simulation
    const [isLiveMode, setIsLiveMode] = useState(false);

    // Initialisation des listeners Ethereum
    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    const addr = accounts[0];
                    setUserFullAddress(addr);
                    setUserAddress(`${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`);
                    showToast("Account change detected", 'info');
                    // On pourrait re-fetcher la balance ici
                } else {
                    disconnectWallet();
                    showToast("Wallet disconnected", 'info');
                }
            });
        }
    }, [showToast]);

    // Fonction principale de connexion (Logique de app.html)
    const connectWallet = async (walletType) => {
        // 1. GESTION SIMULATION
        if (walletType === 'simulation') {
            const simAddress = '0xsimulated000000000000000000000000000000';
            setWalletConnected(true);
            setUserAddress('Simu...Test');
            setUserFullAddress(simAddress);
            setUserBalance('100.0000');
            showToast("Connected with Simulation Wallet (Test Mode)", 'success');
            return;
        }

        // 2. GESTION WEB3 RÉEL
        if (!window.ethers && !ethers) {
            showToast("Technical error: Web3 library not loaded.", 'error');
            return;
        }

        let providerInput = null;

        // Détection du provider selon le type choisi
        if (walletType === 'zerion') {
            if (window.zerionWallet) providerInput = window.zerionWallet;
            else if (window.ethereum && window.ethereum.isZerion) providerInput = window.ethereum;
            else providerInput = window.ethereum;
        } else if (walletType === 'rabby') {
            if (window.ethereum && window.ethereum.isRabby) providerInput = window.ethereum;
            else providerInput = window.ethereum;
        } else if (walletType === 'metamask') {
            if (window.ethereum) providerInput = window.ethereum;
        } else if (walletType === 'walletconnect') {
            if (window.ethereum) providerInput = window.ethereum;
        } else {
            providerInput = window.ethereum;
        }

        if (!providerInput) {
            showToast("No compatible wallet detected.", 'error');
            return;
        }

        try {
            const accounts = await providerInput.request({ method: 'eth_requestAccounts' });
            if (!accounts || accounts.length === 0) {
                showToast("No account selected.", 'error');
                return;
            }

            const provider = new ethers.providers.Web3Provider(providerInput);
            const signer = provider.getSigner();
            const address = await signer.getAddress();

            // Signature Message (Sécurité présente dans app.html)
            try {
                const messageToSign = `Mœba Protocol Login\n\nWallet: ${address}\nNonce: ${Date.now()}`;
                showToast("Please sign the request in your wallet...", 'info');
                await signer.signMessage(messageToSign);
                showToast("Valid signature. Authorized login.", 'success');
            } catch (signErr) {
                console.error("Signature error:", signErr);
                showToast("Connection canceled: Signature rejected by user.", 'error');
                return;
            }

            const balanceBig = await provider.getBalance(address);
            const balanceFmt = ethers.utils.formatEther(balanceBig);
            const shortAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

            setWalletConnected(true);
            setUserAddress(shortAddress);
            setUserFullAddress(address);
            setUserBalance(parseFloat(balanceFmt).toFixed(4));

            let walletName = 'Wallet';
            if (walletType === 'zerion' || providerInput.isZerion) walletName = 'Zerion';
            else if (walletType === 'rabby' || providerInput.isRabby) walletName = 'Rabby';
            else if (walletType === 'metamask' || providerInput.isMetaMask) walletName = 'MetaMask';

            showToast(`Connected with ${walletName}`, 'success');

        } catch (error) {
            console.error(error);
            showToast(`Connection failed: ${error.message || error}`, 'error');
        }
    };

    const disconnectWallet = () => {
        setWalletConnected(false);
        setUserAddress('');
        setUserFullAddress('');
        setUserBalance('0.00');
        showToast("Disconnected from the application.", 'info');
    };

    // Helper pour récupérer la balance d'un Token spécifique (Asset Balance)
    // Logique extraite du useEffect "fetchAssetBalance" de app.html
    const getAssetBalance = async (vaultChain, vaultAsset) => {
        if (!walletConnected || !window.ethereum) return '0.00';

        // En mode simulation, on retourne une fausse balance infinie
        if (userFullAddress === '0xsimulated000000000000000000000000000000') {
            return '50000.00';
        }

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const tokenAddress = TOKEN_MAP[vaultChain] ? TOKEN_MAP[vaultChain][vaultAsset] : null;

            let balance = ethers.BigNumber.from(0);
            let decimals = 18;

            if (tokenAddress) {
                const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
                balance = await contract.balanceOf(userFullAddress);
                try { decimals = await contract.decimals(); } catch(e) {}
            } else if (vaultAsset === 'ETH' && vaultChain === 'Ethereum') {
                balance = await provider.getBalance(userFullAddress);
            }

            const formatted = ethers.utils.formatUnits(balance, decimals);
            return parseFloat(formatted);
        } catch (err) {
            console.error("Error fetching asset balance", err);
            return 0;
        }
    };

    return (
        <Web3Context.Provider value={{
            walletConnected,
            userAddress,
            userFullAddress,
            userBalance,
            isLiveMode,
            setIsLiveMode,
            connectWallet,
            disconnectWallet,
            getAssetBalance
        }}>
            {children}
        </Web3Context.Provider>
    );
};
