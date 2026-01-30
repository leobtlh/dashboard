import React, { useState, useMemo } from 'react';
import { ArrowLeft, Building2, Calendar, FileText, CheckCircle2, Lock, AlertTriangle } from '../components/ui/Icons';
import RiskChart from '../components/Charts/RiskChart';
import VaultWaterfall from '../components/Vaults/VaultWaterfall';
import TrancheSelector from '../components/Vaults/TrancheSelector';
import InvestorKYCModal from '../components/Modals/InvestorKYCModal';
import { useData } from '../context/DataContext';
import { useWeb3 } from '../context/Web3Context';
import { useToast } from '../context/ToastContext';
import { getTrancheAprs, calculatePayoutDetails } from '../utils/finance';
import { formatCurrency, calculateDaysRemaining } from '../utils/formatting';

const VaultDetailsPage = ({ vaultId, onBack }) => {
    // Hooks
    const { vaults, depositToVault, withdrawFromVault, claimFromVault, getInvestorRequestStatus } = useData();
    const { walletConnected, userFullAddress, getAssetBalance } = useWeb3();
    const { showToast } = useToast();

    // Local State
    const [amount, setAmount] = useState('');
    const [trancheType, setTrancheType] = useState('senior'); // 'senior' | 'junior'
    const [activeTab, setActiveTab] = useState('deposit'); // 'deposit' | 'withdraw'
    const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    const [walletBalance, setWalletBalance] = useState('0.00');

    // Récupération du Vault courant
    const vault = vaults.find(v => v.id === vaultId);

    // Fetch Balance logic
    React.useEffect(() => {
        if (walletConnected && vault) {
            setIsLoadingBalance(true);
            getAssetBalance(vault.chain, vault.asset).then(bal => {
                setWalletBalance(bal);
                setIsLoadingBalance(false);
            });
        }
    }, [walletConnected, vault, getAssetBalance]);

    // Derived State (Calculs)
    const { seniorApr, juniorApr } = useMemo(() => vault ? getTrancheAprs(vault) : { seniorApr:0, juniorApr:0 }, [vault]);
    const daysRemaining = useMemo(() => vault ? calculateDaysRemaining(vault.maturityDate) : 0, [vault]);

    const userDeposited = useMemo(() => {
        if (!vault || !userFullAddress) return 0;
        return trancheType === 'junior'
            ? (vault.balancesJunior?.[userFullAddress] || 0)
            : (vault.balancesSenior?.[userFullAddress] || 0);
    }, [vault, userFullAddress, trancheType]);

    // Logic KYC check
    const kycStatus = getInvestorRequestStatus();
    const isKYCApproved = kycStatus === 'approved';

    if (!vault) return <div>Loading...</div>;

    const handleAction = () => {
        if (!walletConnected) { showToast("Connect wallet first", "error"); return; }
        if (!amount || parseFloat(amount) <= 0) { showToast("Invalid amount", "error"); return; }

        if (activeTab === 'deposit') {
            if (!isKYCApproved && vault.chain !== 'Base') { // Simu KYC check sauf Base (permissionless pour demo)
                 setIsKYCModalOpen(true);
                 return;
            }
            if (parseFloat(amount) > parseFloat(walletBalance)) { showToast("Insufficient balance", "error"); return; }
            depositToVault(vault.id, amount, trancheType);
        } else {
             if (parseFloat(amount) > userDeposited) { showToast("Insufficient deposited balance", "error"); return; }
             withdrawFromVault(vault.id, amount, trancheType);
        }
        setAmount('');
    };

    const payoutDetails = calculatePayoutDetails(vault, userFullAddress);

    return (
        <div className="animate-fade-in pb-20">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Marketplace
            </button>

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                            {vault.chain}
                        </span>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{vault.name}</h1>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><Building2 className="h-4 w-4"/> {vault.insurer}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4"/> Maturity: {daysRemaining} days</span>
                    </div>
                </div>
                {/* Badges Status */}
                <div className="flex items-center gap-3">
                    {vault.status === 'OPEN' && <span className="badge bg-green-100 text-green-700"><CheckCircle2 className="h-4 w-4"/> OPEN FOR DEPOSIT</span>}
                    {vault.status === 'TRIGGERED' && <span className="badge bg-red-100 text-red-700"><AlertTriangle className="h-4 w-4"/> TRIGGERED</span>}
                    {vault.status === 'MATURED' && <span className="badge bg-green-100 text-green-700"><CheckCircle2 className="h-4 w-4"/> MATURED</span>}
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* GAUCHE : CHART & INFO (Colspan 8) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* KPI CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card p-6">
                            <p className="text-sm text-slate-500 mb-1">Total Capacity</p>
                            <p className="text-2xl font-bold">{formatCurrency(vault.totalCapacity)}</p>
                        </div>
                        <div className="card p-6">
                            <p className="text-sm text-slate-500 mb-1">Current Assets</p>
                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(vault.currentAssets)}</p>
                        </div>
                        <div className="card p-6">
                            <p className="text-sm text-slate-500 mb-1">Max Yield (APR)</p>
                            <p className="text-2xl font-bold text-green-600">{vault.apr}%</p>
                        </div>
                    </div>

                    {/* CHART */}
                    <div className="card p-6">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Live Oracle Data</h3>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-slate-500">Connected to Chainlink</span>
                            </div>
                        </div>
                        <RiskChart data={vault.history} triggers={vault.triggers} />
                    </div>

                    {/* DESCRIPTION */}
                    <div className="card p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FileText className="h-5 w-5"/> Terms & Conditions</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{vault.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                            <div><span className="text-slate-500">Trigger Threshold:</span> <span className="font-bold">{vault.triggerValue} {vault.triggers?.[0]?.unit}</span></div>
                            <div><span className="text-slate-500">Oracle Source:</span> <span className="font-bold">NOAA / USGS</span></div>
                        </div>
                    </div>
                </div>

                {/* DROITE : ACTION SIDEBAR (Colspan 4) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* 1. WATERFALL VISUALIZATION */}
                    <div className="h-64">
                        <VaultWaterfall />
                    </div>

                    {/* 2. ACTION PANEL */}
                    <div className="card p-6 border-blue-100 dark:border-blue-900 shadow-xl shadow-blue-900/5">
                        {vault.status === 'OPEN' ? (
                            <>
                                <h3 className="font-bold text-lg mb-6">Position Management</h3>

                                {/* TABS DEPOSIT/WITHDRAW */}
                                <div className="flex mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                    <button onClick={() => setActiveTab('deposit')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'deposit' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500'}`}>Deposit</button>
                                    <button onClick={() => setActiveTab('withdraw')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'withdraw' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500'}`}>Withdraw</button>
                                </div>

                                <TrancheSelector
                                    trancheType={trancheType} setTrancheType={setTrancheType}
                                    seniorApr={seniorApr} juniorApr={juniorApr}
                                />

                                {/* INPUT */}
                                <div className="mb-6">
                                    <div className="flex justify-between text-xs mb-2 text-slate-500">
                                        <span>Amount ({vault.asset})</span>
                                        <span>
                                            {activeTab === 'deposit'
                                              ? `Balance: ${isLoadingBalance ? '...' : walletBalance}`
                                              : `Staked: ${userDeposited}`
                                            }
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0.00"
                                        />
                                        <button
                                            onClick={() => setAmount(activeTab === 'deposit' ? walletBalance : userDeposited)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded"
                                        >
                                            MAX
                                        </button>
                                    </div>
                                </div>

                                {/* BUTTON */}
                                <button
                                    onClick={handleAction}
                                    disabled={!walletConnected}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95"
                                >
                                    {walletConnected ? (activeTab === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal') : 'Connect Wallet'}
                                </button>

                                {/* KYC WARNING */}
                                {!isKYCApproved && walletConnected && (
                                    <p className="text-xs text-center text-slate-400 mt-4 flex items-center justify-center gap-1">
                                        <Lock className="h-3 w-3"/> KYC required for Junior Tranche
                                    </p>
                                )}
                            </>
                        ) : (
                            // MODE RECLAMATION (MATURED / TRIGGERED)
                            <div className="text-center py-6">
                                <h3 className="font-bold text-xl mb-2 text-slate-900 dark:text-white">Vault Closed</h3>
                                <p className="text-sm text-slate-500 mb-6">This vault has reached maturity or was triggered.</p>

                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl mb-6 text-left space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Principal</span>
                                        <span className="font-bold">{formatCurrency(payoutDetails.principalRecovered)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Yield Earned</span>
                                        <span className="font-bold text-green-600">+{formatCurrency(payoutDetails.yieldPayout)}</span>
                                    </div>
                                    {payoutDetails.loss > 0 && (
                                        <div className="flex justify-between text-sm text-red-500">
                                            <span>Loss realized</span>
                                            <span className="font-bold">-{formatCurrency(payoutDetails.loss)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-bold text-lg">
                                        <span>Total Claimable</span>
                                        <span>{formatCurrency(payoutDetails.totalPayout)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => claimFromVault(vault.id)}
                                    disabled={payoutDetails.totalPayout <= 0}
                                    className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-lg shadow-green-200 dark:shadow-none transition-all"
                                >
                                    Claim Payout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <InvestorKYCModal isOpen={isKYCModalOpen} onClose={() => setIsKYCModalOpen(false)} />
        </div>
    );
};

// Utils style local
const card = "bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700";

export default VaultDetailsPage;
