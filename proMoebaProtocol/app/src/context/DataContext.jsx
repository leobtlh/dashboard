import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from './ToastContext';
import { useWeb3 } from './Web3Context';
import { INITIAL_VAULTS } from '../constants/mocks';
import { FACTORY_ADDRESS_LIVE, FACTORY_ABI_EXTENDED, INSURER_WHITELIST_LOCAL } from '../constants/abis';
import { generateMockHistory } from '../utils/generators';
import { formatCurrency } from '../utils/formatting';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { showToast } = useToast();
    const { walletConnected, userFullAddress, isLiveMode, userAddress } = useWeb3();

    // --- STATES PRINCIPAUX ---
    // Chargement des Vaults depuis LocalStorage ou Initiaux
    const [vaults, setVaults] = useState(() => {
        const saved = localStorage.getItem('moeba_vaults');
        return saved ? JSON.parse(saved) : INITIAL_VAULTS;
    });

    // Sauvegarde automatique
    useEffect(() => {
        localStorage.setItem('moeba_vaults', JSON.stringify(vaults));
    }, [vaults]);

    // Etats de permissions
    const [isInsurerWhitelisted, setIsInsurerWhitelisted] = useState(false);
    const [isInvestorWhitelisted, setIsInvestorWhitelisted] = useState(false);
    const [registrationStatus, setRegistrationStatus] = useState('none'); // 'none', 'pending', 'approved', 'rejected'

    // --- LOGIQUE WHITELIST & PERMISSIONS (issue de checkWhitelistStatus dans app.html) ---
    useEffect(() => {
        const checkWhitelistStatus = async () => {
            if (!walletConnected || !userFullAddress) {
                setIsInsurerWhitelisted(false);
                setIsInvestorWhitelisted(false);
                setRegistrationStatus('none');
                return;
            }

            const SIMULATION_ADDRESS = '0xsimulated000000000000000000000000000000';

            // 1. VERIFICATION INVESTISSEUR
            const investorList = JSON.parse(localStorage.getItem('moeba_investor_whitelist') || '[]');
            const investorRequests = JSON.parse(localStorage.getItem('moeba_investor_requests') || '[]');

            // Si c'est la simu ou si l'user est dans la liste locale
            if (userFullAddress.toLowerCase() === SIMULATION_ADDRESS || investorList.includes(userFullAddress.toLowerCase())) {
                setIsInvestorWhitelisted(true);
            } else {
                setIsInvestorWhitelisted(false);
            }

            // 2. VERIFICATION ASSUREUR
            if (isLiveMode) {
                // Mode LIVE (Blockchain)
                try {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    // Si adresse nulle, on considère pas whitelisté
                    if (FACTORY_ADDRESS_LIVE === "0x0000000000000000000000000000000000000000") {
                        setIsInsurerWhitelisted(false);
                        return;
                    }
                    const factoryContract = new ethers.Contract(FACTORY_ADDRESS_LIVE, FACTORY_ABI_EXTENDED, provider);
                    const isWhitelisted = await factoryContract.isWhitelistedInsurer(userFullAddress);
                    setIsInsurerWhitelisted(isWhitelisted);

                    if (!isWhitelisted) {
                        try {
                            const request = await factoryContract.insurerRequests(userFullAddress);
                            if (request.status === 1) setRegistrationStatus('pending');
                            else if (request.status === 3) setRegistrationStatus('rejected');
                            else setRegistrationStatus('none');
                        } catch(e) {}
                    }
                } catch (error) {
                    console.error("Erreur Whitelist On-Chain:", error);
                    setIsInsurerWhitelisted(false);
                }
            } else {
                // Mode LOCAL / SIMULATION
                const isLocalListed = INSURER_WHITELIST_LOCAL.includes(userFullAddress.toLowerCase());

                if (isLocalListed) {
                    setIsInsurerWhitelisted(true);
                    setRegistrationStatus('approved');
                } else {
                    const storedRequests = localStorage.getItem('moeba_insurer_requests');
                    if (storedRequests) {
                        try {
                            const requests = JSON.parse(storedRequests);
                            const myRequest = requests.find(r => r.address.toLowerCase() === userFullAddress.toLowerCase());
                            if (myRequest) {
                                if (myRequest.status === 2) {
                                     setIsInsurerWhitelisted(true);
                                     setRegistrationStatus('approved');
                                } else if (myRequest.status === 1) {
                                     setIsInsurerWhitelisted(false);
                                     setRegistrationStatus('pending');
                                } else if (myRequest.status === 3) {
                                     setIsInsurerWhitelisted(false);
                                     setRegistrationStatus('rejected');
                                }
                            } else {
                                setIsInsurerWhitelisted(false);
                                setRegistrationStatus('none');
                            }
                        } catch(e) {}
                    } else {
                        setIsInsurerWhitelisted(false);
                        setRegistrationStatus('none');
                    }
                }
            }
        };
        checkWhitelistStatus();
    }, [walletConnected, userFullAddress, isLiveMode]);

    // --- ACTIONS METIER (Vaults) ---

    // 1. Création de Vault (Insurer)
    const createVault = (formData) => {
        const newVault = {
            id: `0x${Math.floor(Math.random() * 1000000).toString(16)}...new`,
            name: formData.name || "New Cat Bond",
            insurerAddress: userFullAddress,
            insurer: formData.companyName || `Insurer (${userAddress})`,
            description: formData.description,
            totalCapacity: formData.totalCapacity, // Capacité calculée
            claimAmount: formData.claimAmount,
            currentAssets: 0,
            juniorCapital: formData.juniorCapital,
            premium: formData.premium,
            startDate: formData.startDateStr,
            maturityDate: formData.endDateStr,
            apr: formData.apr,
            riskProb: (Math.random() * 19 + 1).toFixed(1),
            status: "PENDING",
            chain: formData.chain,
            asset: formData.asset,
            balancesJunior: {},
            balancesSenior: {},
            totalJuniorDeposits: 0,
            totalSeniorDeposits: 0,
            history: generateMockHistory('WIND'),
            // Valeurs par défaut pour l'oracle
            triggerValue: 150,
            triggers: []
        };

        setVaults([...vaults, newVault]);
        showToast(`Vault successfully created!`, 'success');
    };

    // 2. Initialisation du Vault (Passage de PENDING à OPEN)
    const initializeVault = (vaultId) => {
        const updatedVaults = vaults.map(v => {
            if (v.id === vaultId) {
                // Logique de recalcul APR exact lors de l'ouverture (comme dans app.html)
                // Ici simplifiée car les données sont déjà dans l'objet,
                // mais on débloque le statut.
                return {
                    ...v,
                    status: "OPEN",
                    currentAssets: v.juniorCapital + v.premium, // L'assureur met le capital junior + premium
                    // On pourrait recalculer l'APR ici si besoin
                };
            }
            return v;
        });
        setVaults(updatedVaults);
        showToast(isLiveMode ? "Vault Initialized (Live Mock)" : "Vault Initialized (Simulation)", 'success');
    };

    // 3. Dépôt (Investisseur)
    const depositToVault = (vaultId, amount, trancheType) => {
        const amountFloat = parseFloat(amount);

        const updatedVaults = vaults.map(v => {
            if (v.id === vaultId) {
                const currentBalances = v.balances || {};
                const newUserBalance = (currentBalances[userFullAddress] || 0) + amountFloat;

                const newBalancesJunior = { ...(v.balancesJunior || {}) };
                const newBalancesSenior = { ...(v.balancesSenior || {}) };
                let newTotalJunior = v.totalJuniorDeposits || 0;
                let newTotalSenior = v.totalSeniorDeposits || 0;

                if (trancheType === 'junior') {
                    newTotalJunior += amountFloat;
                    newBalancesJunior[userFullAddress] = (newBalancesJunior[userFullAddress] || 0) + amountFloat;
                } else {
                    newTotalSenior += amountFloat;
                    newBalancesSenior[userFullAddress] = (newBalancesSenior[userFullAddress] || 0) + amountFloat;
                }

                return {
                    ...v,
                    currentAssets: v.currentAssets + amountFloat,
                    userBalance: newUserBalance, // sync pour backward compatibility
                    balances: { ...currentBalances, [userFullAddress]: newUserBalance },
                    balancesJunior: newBalancesJunior,
                    balancesSenior: newBalancesSenior,
                    totalJuniorDeposits: newTotalJunior,
                    totalSeniorDeposits: newTotalSenior
                };
            }
            return v;
        });

        setVaults(updatedVaults);
        showToast(`Deposit of ${amount} (${trancheType}) confirmed.`, 'success');
    };

    // 4. Retrait (Investisseur - Avant démarrage)
    const withdrawFromVault = (vaultId, amount, trancheType) => {
        const amountFloat = parseFloat(amount);

        const updatedVaults = vaults.map(v => {
            if (v.id === vaultId) {
                const currentBalances = v.balances || {};
                const newUserBalance = (currentBalances[userFullAddress] || 0) - amountFloat;

                const newBalancesJunior = { ...(v.balancesJunior || {}) };
                const newBalancesSenior = { ...(v.balancesSenior || {}) };
                let newTotalJunior = v.totalJuniorDeposits || 0;
                let newTotalSenior = v.totalSeniorDeposits || 0;

                // On suppose que la vérification de solde suffisant est faite dans l'UI
                if (trancheType === 'junior') {
                    newTotalJunior -= amountFloat;
                    newBalancesJunior[userFullAddress] = (newBalancesJunior[userFullAddress] || 0) - amountFloat;
                } else {
                    newTotalSenior -= amountFloat;
                    newBalancesSenior[userFullAddress] = (newBalancesSenior[userFullAddress] || 0) - amountFloat;
                }

                return {
                    ...v,
                    currentAssets: v.currentAssets - amountFloat,
                    userBalance: newUserBalance,
                    balances: { ...currentBalances, [userFullAddress]: newUserBalance },
                    balancesJunior: newBalancesJunior,
                    balancesSenior: newBalancesSenior,
                    totalJuniorDeposits: newTotalJunior,
                    totalSeniorDeposits: newTotalSenior
                };
            }
            return v;
        });

        setVaults(updatedVaults);
        showToast(`Withdrawal of ${amount} (${trancheType}) completed.`, 'success');
    };

    // 5. Claim (Investisseur - Après maturité ou Trigger)
    const claimFromVault = (vaultId) => {
        // La logique financière est faite dans l'UI via calculatePayoutDetails
        // Ici on remet juste les balances à zéro
        const updatedVaults = vaults.map(v => {
            if (v.id === vaultId) {
                const newBalances = { ...(v.balances || {}), [userFullAddress]: 0 };
                const newBalancesJunior = { ...(v.balancesJunior || {}), [userFullAddress]: 0 };
                const newBalancesSenior = { ...(v.balancesSenior || {}), [userFullAddress]: 0 };

                return {
                    ...v,
                    userBalance: 0, // pour l'affichage courant
                    balances: newBalances,
                    balancesJunior: newBalancesJunior,
                    balancesSenior: newBalancesSenior
                };
            }
            return v;
        });
        setVaults(updatedVaults);
        // Le Toast est souvent géré par l'UI qui calcule le montant,
        // mais on peut en mettre un générique ici si besoin.
    };

    // 6. Trigger Oracle (Admin/Simulation)
    const triggerOracle = (vaultId) => {
        const updatedVaults = vaults.map(v => {
            if (v.id === vaultId) {
                return { ...v, status: "TRIGGERED" };
            }
            return v;
        });
        setVaults(updatedVaults);
        showToast("ORACLE ALERT : Catastrophe confirmed. Soft Default activated.", 'error');
    };

    // --- GESTION REGISTRES (Requests) ---

    // Envoi demande Assureur (KYB)
    const registerInsurer = async (data) => {
        if (isLiveMode) {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const factoryContract = new ethers.Contract(FACTORY_ADDRESS_LIVE, FACTORY_ABI_EXTENDED, signer);
                const tx = await factoryContract.registerInsurer(data.companyName, data.kybLink);
                await tx.wait();
                setRegistrationStatus('pending');
                showToast("Registration request successfully submitted!", 'success');
            } catch (err) {
                showToast("Blockchain Error: " + (err.reason || err.message), 'error');
            }
        } else {
            // Simulation locale
            await new Promise(resolve => setTimeout(resolve, 1000));
            const existing = localStorage.getItem('moeba_insurer_requests');
            let requests = [];
            if (existing) { try { requests = JSON.parse(existing); } catch(e) {} }

            const newRequest = {
                address: userFullAddress,
                companyName: data.companyName,
                kybHash: data.kybLink,
                status: 1, // Pending
                date: Date.now()
            };

            const existingIndex = requests.findIndex(r => r.address.toLowerCase() === userFullAddress.toLowerCase());
            if (existingIndex >= 0) requests[existingIndex] = newRequest;
            else requests.push(newRequest);

            localStorage.setItem('moeba_insurer_requests', JSON.stringify(requests));
            setRegistrationStatus('pending');
            showToast("Simulated request sent successfully (Stored Locally)", 'success');
        }
    };

    // Envoi demande Investisseur (KYC)
    const registerInvestor = async (data) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const storedRequests = JSON.parse(localStorage.getItem('moeba_investor_requests') || '[]');

        const newRequest = {
            address: userFullAddress,
            fullName: data.fullName,
            email: data.email,
            idHash: data.idHash,
            status: 1, // Pending
            date: Date.now()
        };

        const existingIndex = storedRequests.findIndex(r => r.address.toLowerCase() === userFullAddress.toLowerCase());
        if (existingIndex >= 0) storedRequests[existingIndex] = newRequest;
        else storedRequests.push(newRequest);

        localStorage.setItem('moeba_investor_requests', JSON.stringify(storedRequests));
        showToast("KYC Request sent to Admin. Please wait for approval.", 'info');
    };

    // Vérifie si l'investisseur a une demande en attente
    const getInvestorRequestStatus = () => {
        const requests = JSON.parse(localStorage.getItem('moeba_investor_requests') || '[]');
        const myRequest = requests.find(r => r.address.toLowerCase() === userFullAddress.toLowerCase());
        if (!myRequest) return 'none';
        if (myRequest.status === 1) return 'pending';
        if (myRequest.status === 2) return 'approved';
        if (myRequest.status === 3) return 'rejected';
        return 'none';
    };

    return (
        <DataContext.Provider value={{
            vaults,
            isInsurerWhitelisted,
            isInvestorWhitelisted,
            registrationStatus,
            createVault,
            initializeVault,
            depositToVault,
            withdrawFromVault,
            claimFromVault,
            triggerOracle,
            registerInsurer,
            registerInvestor,
            getInvestorRequestStatus
        }}>
            {children}
        </DataContext.Provider>
    );
};
