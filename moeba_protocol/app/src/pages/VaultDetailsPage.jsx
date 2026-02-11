import React, { useState, useEffect, useMemo } from 'react';
import {
    ArrowLeft, Globe, AlertTriangle, CheckCircle2, Lock, Building2,
    FileText, Activity, TrendingUp, Coins, Wallet, ArrowRight, ChevronDown
} from '../components/ui/Icons.jsx';
import RiskChart from '../components/Charts/RiskChart.jsx';
import InvestorKYCModal from '../components/Modals/InvestorKYCModal.jsx';
import { useData } from '../context/DataContext.jsx';
import { useWeb3 } from '../context/Web3Context.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getTrancheAprs, calculatePayoutDetails } from '../utils/finance.js';
import { formatCurrency, parseAppDate } from '../utils/formatting.js';

const VaultDetailsPage = ({ vaultId, onBack }) => {
    // --- GLOBAL CONTEXT ---
    const { vaults, depositToVault, withdrawFromVault, claimFromVault, initializeVault, triggerOracle } = useData();
    const { walletConnected, userFullAddress, getAssetBalance } = useWeb3();
    const { showToast } = useToast();

    // --- LOCAL STATE (Matching app.html) ---
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [actionTab, setActionTab] = useState('deposit'); // 'deposit' | 'withdraw'
    const [trancheType, setTrancheType] = useState('senior'); // 'senior' | 'junior'

    // Asset Balance Logic
    const [assetBalance, setAssetBalance] = useState(0);
    const [assetBalanceFormatted, setAssetBalanceFormatted] = useState('0.00');

    // KYC Modal State
    const [showInvestorKYC, setShowInvestorKYC] = useState(false);
    const [isInvestorRegistering, setIsInvestorRegistering] = useState(false);

    // Get Current Vault
    const selectedVault = vaults.find(v => v.id === vaultId);

    // --- HELPERS FROM APP.HTML ---
    const isVaultStarted = (vault) => {
        if (!vault || !vault.startDate) return false;
        const start = parseAppDate(vault.startDate);
        return start && new Date() >= start;
    };

    const isInvestorWhitelisted = useMemo(() => {
        // Mock whitelist check based on local storage or hardcoded simulation logic from app.html
        // In a real app, this comes from Web3Context or DataContext.
        // For now, we assume true or rely on context check if available.
        // We'll use a simple check for simulation.
        return true;
    }, [userFullAddress]);

    // --- EFFECT: FETCH BALANCE ---
    useEffect(() => {
        if (walletConnected && selectedVault) {
            getAssetBalance(selectedVault.chain, selectedVault.asset).then(bal => {
                setAssetBalance(parseFloat(bal));
                setAssetBalanceFormatted(parseFloat(bal).toFixed(4));
            });
        }
    }, [walletConnected, selectedVault, getAssetBalance]);


    // --- HANDLERS (Mapped to Context) ---

    const handleSetPercentage = (percent) => {
        if (assetBalance <= 0) return;
        const amount = (assetBalance * percent) / 100;
        const remaining = selectedVault.totalCapacity - selectedVault.currentAssets;
        const finalAmount = amount > remaining ? remaining : amount;
        setDepositAmount(finalAmount.toFixed(4));
        if (amount > remaining) showToast("Amount adjusted to the maximum remaining capacity.", 'info');
    };

    const handleDeposit = async () => {
        if (!walletConnected) { showToast("Connect your wallet.", 'error'); return; }

        // KYC CHECK (Simplified for React Port)
        // In app.html this checks local storage. Here we trigger modal if context says so.
        // For strict parity, if we want to simulate the modal:
        /* if (!isInvestorWhitelisted) {
             setShowInvestorKYC(true);
             return;
        }
        */

        if (!selectedVault || !depositAmount) return;
        const amount = parseFloat(depositAmount);
        if (amount <= 0) { showToast("Invalid amount.", 'error'); return; }

        const remainingCapacity = selectedVault.totalCapacity - selectedVault.currentAssets;
        if (amount > remainingCapacity) {
            showToast(`Error: Capacity exceeded (${formatCurrency(remainingCapacity)}).`, 'error');
            return;
        }

        // Call Context
        await depositToVault(selectedVault.id, amount.toString(), trancheType);
        setDepositAmount('');
    };

    const handleWithdraw = async () => {
        if (!walletConnected) return;
        const amount = parseFloat(withdrawAmount);

        // Verify specific tranche balance
        const currentJunior = selectedVault.balancesJunior ? (selectedVault.balancesJunior[userFullAddress] || 0) : 0;
        const currentSenior = selectedVault.balancesSenior ? (selectedVault.balancesSenior[userFullAddress] || 0) : 0;
        const available = trancheType === 'junior' ? currentJunior : currentSenior;

        if (amount <= 0 || amount > available) { showToast(`Invalid amount or insufficient ${trancheType} balance.`, 'error'); return; }

        // Call Context
        await withdrawFromVault(selectedVault.id, amount.toString(), trancheType);
        setWithdrawAmount('');
    };

    const handleClaim = (vault) => {
        claimFromVault(vault.id);
    };

    const handleInitializeVault = (vaultId) => {
        if (initializeVault) {
            initializeVault(vaultId);
        } else {
            showToast("Initialization logic not linked in Context", "error");
        }
    };

    // Handle KYC Submission (Mock)
    const handleInvestorKYC = (data) => {
        setIsInvestorRegistering(true);
        setTimeout(() => {
            setIsInvestorRegistering(false);
            setShowInvestorKYC(false);
            showToast("KYC Request sent to Admin.", 'info');
        }, 1500);
    };

    if (!selectedVault) return <div>Loading...</div>;

    // Derived values
    const { seniorApr, juniorApr } = getTrancheAprs(selectedVault);
    const isFull = selectedVault.currentAssets >= selectedVault.totalCapacity;

    return (
        <div className="space-y-6 animate-in fade-in">

            <InvestorKYCModal
                isOpen={showInvestorKYC}
                onClose={() => setShowInvestorKYC(false)}
                onSubmit={handleInvestorKYC}
                isSubmitting={isInvestorRegistering}
            />

            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back to the Vaults
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">

                    {/* EN-TÊTE DU VAULT */}
                    <div className={`p-8 rounded-2xl border ${selectedVault.status === 'TRIGGERED' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : selectedVault.status === 'MATURED' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex gap-2 mb-3">
                                    <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 uppercase tracking-wide flex items-center gap-1">
                                        <Globe className="h-3 w-3" /> {selectedVault.chain}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-xs font-bold text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800 uppercase tracking-wide">
                                        {selectedVault.asset}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className={`text-3xl font-bold flex items-center gap-3 ${selectedVault.status === 'TRIGGERED' ? 'text-red-700 dark:text-red-400' : selectedVault.status === 'MATURED' ? 'text-green-700 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
                                        {selectedVault.status === 'TRIGGERED' && <AlertTriangle className="h-8 w-8" />}
                                        {selectedVault.name}
                                    </h1>
                                    {isVaultStarted(selectedVault) && selectedVault.status !== 'MATURED' && selectedVault.status !== 'TRIGGERED' &&
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center gap-1"><Lock className="h-3 w-3" /> ACTIVE PERIOD</span>
                                    }
                                    {selectedVault.status === 'MATURED' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 flex items-center gap-1">OVER</span>}
                                    {selectedVault.status === 'TRIGGERED' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 flex items-center gap-1">DISASTER</span>}
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                                    <Building2 className="h-4 w-4" /> Insurer: <span className="font-semibold">{selectedVault.insurer}</span>
                                    <span className="mx-2">•</span>
                                    ID : <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs">{selectedVault.id}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ALERTE CATASTROPHE */}
                    {selectedVault.status === 'TRIGGERED' && (
                        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-6 rounded-r-xl">
                            <h4 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                                <AlertTriangle className="h-6 w-6" /> Disaster Confirmed
                            </h4>
                            <p className="text-red-700 dark:text-red-200 mb-4 text-sm leading-relaxed">
                                The oracle has detected an event exceeding critical thresholds. The “Soft Default” mechanism is activated.
                            </p>
                        </div>
                    )}

                    {/* INFO VAULT TERMINÉ (SUCCÈS) */}
                    {selectedVault.status === 'MATURED' && (
                        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600 p-6 rounded-r-xl">
                            <h4 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                                <CheckCircle2 className="h-6 w-6" /> Risk Period Over
                            </h4>
                            <p className="text-green-700 dark:text-green-200 mb-4 text-sm leading-relaxed">
                                The coverage period has ended without any claims being made. The principal and interest are available for withdrawal.
                            </p>
                        </div>
                    )}

                    {/* DESCRIPTION */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400"/> Trigger Conditions
                        </h4>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                            {selectedVault.description || "No detailed description provided by the insurer."}
                        </div>
                    </section>

                    {/* DONNÉES FINANCIÈRES */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-green-600 dark:text-green-400"/> Financial Data
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 uppercase font-semibold">Total Capacity (Hard Cap)</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(selectedVault.totalCapacity)}</p>
                                <p className="text-[10px] text-slate-400 mt-1">Includes Venture Capital + Premium</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 uppercase font-semibold text-indigo-600 dark:text-indigo-400">Junior Slice (First Loss)</p>
                                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(selectedVault.juniorCapital)}</p>
                                <p className="text-[10px] text-slate-400 mt-1">Insurance capital at risk</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 uppercase font-semibold text-green-600 dark:text-green-400">Premium Reserve (Yield)</p>
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(selectedVault.premium)}</p>
                                <p className="text-[10px] text-slate-400 mt-1">Secured for investors</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 uppercase font-semibold">Inception Date (Lock)</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{selectedVault.startDate || 'N/A'}</p>
                                <p className="text-[10px] text-slate-400 mt-1">Beginning of the lockdown</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 uppercase font-semibold">Over-Collateralization</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                    {(selectedVault.totalCapacity - selectedVault.premium) > selectedVault.claimAmount ?
                                        (((selectedVault.totalCapacity - selectedVault.premium) / selectedVault.claimAmount) * 100).toFixed(0) + '%'
                                        : '100%'}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">Ratio (Capital - Premium) / Risk</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 uppercase font-semibold">Maturity Date</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{selectedVault.maturityDate}</p>
                                <p className="text-[10px] text-slate-400 mt-1">End of the risk period</p>
                            </div>
                        </div>
                    </section>

                    {/* GRAPHIQUE RISQUE */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400"/> Risk Evolution & Triggers
                        </h4>
                        <RiskChart data={selectedVault.history || []} triggers={selectedVault.triggers || []} />
                    </section>
                </div>

                {/* SIDEBAR - GESTION POSITION */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">

                        {/* CARTE DE POSITION UTILISATEUR */}
                        {selectedVault.userBalance > 0 && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-green-200 dark:border-green-800 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <Coins className="h-20 w-20 text-green-600" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                    Your Current Location
                                </h3>
                                <div className="mb-4">
                                    <p className="text-3xl font-mono font-bold text-green-700 dark:text-green-400">
                                        {formatCurrency(selectedVault.userBalance)}
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                        Invested in {selectedVault.name}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* CARTE D'ACTION (DÉPÔT / RETRAIT) */}
                        <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border shadow-xl ${
                            selectedVault.status === 'TRIGGERED' ? 'border-red-200 dark:border-red-800 shadow-red-100 dark:shadow-none' :
                            selectedVault.status === 'MATURED' ? 'border-green-200 dark:border-green-800 shadow-green-100 dark:shadow-none' :
                            selectedVault.status === 'PENDING' ? 'border-amber-200 dark:border-amber-800 shadow-amber-100 dark:shadow-none' : // Style pour PENDING
                            'border-slate-200 dark:border-slate-700 shadow-slate-100 dark:shadow-none'
                        }`}>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <Wallet className="h-5 w-5" /> Position Management
                            </h3>

                            {selectedVault.status === 'OPEN' ? (
                                isVaultStarted(selectedVault) ? (
                                    <div className="text-center py-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
                                        <Lock className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                                        <p className="text-slate-600 dark:text-slate-300 font-bold">Active & Locked Vault</p>
                                        <p className="text-xs text-slate-500 mt-2 px-4 leading-relaxed">
                                            The subscription period ended on <strong>{selectedVault.startDate}</strong>. Withdrawals are no longer possible until maturity.
                                        </p>
                                        <p className="text-xs text-slate-500 mt-2 font-mono">Unlocking : {selectedVault.maturityDate}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl mb-6">
                                            <button onClick={() => setActionTab('deposit')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${actionTab === 'deposit' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>Deposit</button>
                                            <button onClick={() => setActionTab('withdraw')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${actionTab === 'withdraw' ? 'bg-white dark:bg-slate-800 shadow-sm text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400'}`}>Withdrawal</button>
                                        </div>
                                        {/* SÉLECTEUR DE TRANCHE (Senior vs Junior) */}
                                        <div className="mb-6 grid grid-cols-2 gap-3">
                                            <label className="cursor-pointer">
                                                <input type="radio" name="tranche" value="senior" checked={trancheType === 'senior'} onChange={() => setTrancheType('senior')} className="hidden peer" />
                                                <div className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 text-center transition-all h-full flex flex-col justify-center">
                                                    <div className="font-bold text-slate-700 dark:text-slate-200">Senior</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">APR { seniorApr.toFixed(2) }%</div>
                                                    <div className="text-[10px] text-green-600 mt-1 font-medium">Payment Priority</div>
                                                </div>
                                            </label>
                                            <label className="cursor-pointer">
                                                <input type="radio" name="tranche" value="junior" checked={trancheType === 'junior'} onChange={() => setTrancheType('junior')} className="hidden peer" />
                                                <div className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 dark:peer-checked:bg-indigo-900/20 text-center transition-all h-full flex flex-col justify-center">
                                                    <div className="font-bold text-slate-700 dark:text-slate-200">Junior</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">APR { juniorApr.toFixed(2) }%</div>
                                                    <div className="text-[10px] text-orange-500 mt-1 font-medium">Boost Yield</div>
                                                </div>
                                            </label>
                                        </div>

                                        {actionTab === 'deposit' ? (
                                            <div className="space-y-6 animate-fade-in">
                                                {selectedVault.currentAssets >= selectedVault.totalCapacity && (
                                                    <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-center"><span className="font-bold text-slate-500 dark:text-slate-300">This vault has reached its maximum capacity.</span></div>
                                                )}
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 pt-1">
                                                            Amount ({trancheType === 'senior' ? 'Senior' : 'Junior'})
                                                        </label>
                                                        <div className="text-right">
                                                            <span className="text-xs text-slate-500 dark:text-slate-400">Balance: <span className="font-bold text-slate-700 dark:text-slate-200 cursor-pointer hover:underline" onClick={() => setDepositAmount(assetBalance.toString())}>{assetBalanceFormatted}</span> {selectedVault.asset}</span>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">max: <span className="font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline" onClick={() => setDepositAmount((selectedVault.totalCapacity - selectedVault.currentAssets).toString())}>{formatCurrency(selectedVault.totalCapacity - selectedVault.currentAssets)}</span></div>
                                                        </div>
                                                    </div>

                                                    <div className="relative">
                                                        <input type="number" min="0" step="0.01" value={depositAmount} onChange={(e) => { const val = parseFloat(e.target.value); const max = selectedVault.totalCapacity - selectedVault.currentAssets; if (val > max) { setDepositAmount(max.toFixed(4)); } else { setDepositAmount(e.target.value); } }} disabled={selectedVault.currentAssets >= selectedVault.totalCapacity} className="w-full pl-4 pr-16 py-4 border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed" placeholder={selectedVault.currentAssets >= selectedVault.totalCapacity ? "Sold Out" : "0.00"} />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">{selectedVault.asset}</span>
                                                    </div>
                                                    {walletConnected && assetBalance > 0 && selectedVault.currentAssets < selectedVault.totalCapacity && (
                                                        <div className="flex gap-2">{[25, 50, 75, 100].map(pct => (<button key={pct} onClick={() => handleSetPercentage(pct)} className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-blue-600">{pct}%</button>))}</div>
                                                    )}
                                                </div>
                                                <div className="space-y-3 pt-2">
                                                    <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Estimated APR</span><span className={`font-bold ${trancheType === 'junior' ? 'text-indigo-600' : 'text-blue-600'}`}>{trancheType === 'junior' ? juniorApr.toFixed(2) : seniorApr.toFixed(2)}%</span></div>
                                                    <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Deposit fees</span><span className="font-medium text-slate-900 dark:text-white">0.00%</span></div>
                                                </div>
                                                <button onClick={handleDeposit} disabled={selectedVault.currentAssets >= selectedVault.totalCapacity} className={`w-full py-4 ${trancheType === 'junior' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all flex justify-center items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none`}>{selectedVault.currentAssets >= selectedVault.totalCapacity ? "Capacity Reached" : `Confirm Deposit ${trancheType === 'junior' ? 'Junior' : 'Senior'}`} <ArrowRight className="h-4 w-4"/></button>
                                                <p className="text-xs text-center text-slate-400 mt-2">Subscription period open until {selectedVault.startDate}.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 animate-fade-in">
                                                <div className="flex justify-between items-center mb-1"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount to be withdrawn ({trancheType === 'senior' ? 'Senior' : 'Junior'})</label></div>
                                                <div className="relative">
                                                    <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="w-full pl-4 pr-16 py-4 border border-orange-200 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-900/10 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium text-lg" placeholder="0.00" />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">{selectedVault.asset}</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-slate-500">
                                                    <span>Invested {trancheType === 'junior' ? 'Junior' : 'Senior'}: {trancheType === 'junior' ? (selectedVault.balancesJunior?.[userFullAddress] || 0) : (selectedVault.balancesSenior?.[userFullAddress] || 0)} {selectedVault.asset}</span>
                                                    <span className="text-orange-600 dark:text-orange-400 font-bold cursor-pointer hover:underline" onClick={() => setWithdrawAmount(trancheType === 'junior' ? (selectedVault.balancesJunior?.[userFullAddress] || 0) : (selectedVault.balancesSenior?.[userFullAddress] || 0))}>Max</span>
                                                </div>
                                                <button onClick={handleWithdraw} className="w-full py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 text-slate-700 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 rounded-xl font-bold transition-all">Withdraw Funds {trancheType}</button>
                                                <p className="text-xs text-center text-slate-400 mt-2">Withdrawal is permitted free of charge as long as the vault has not started.</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            ) : selectedVault.status === 'MATURED' ? (
                                <div className="space-y-4">
                                    <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl border border-green-100 dark:border-green-800 mb-4">
                                        <p className="text-sm text-green-800 dark:text-green-200 font-medium text-center">
                                            The vault has matured. You can withdraw your earnings.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleClaim(selectedVault)}
                                        disabled={selectedVault.userBalance <= 0}
                                        className={`w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg transition-all ${
                                            selectedVault.userBalance > 0
                                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200 dark:shadow-none'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                        }`}
                                    >
                                        <Coins className="h-5 w-5" />
                                        {selectedVault.userBalance > 0 ? "Claim Gains & Principal" : "Gains Claimed"}
                                    </button>
                                </div>
                            ) : selectedVault.status === 'PENDING' ? (
                                /* --- BLOC POUR PENDING --- */
                                <div className="space-y-4">
                                    <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-xl border border-amber-100 dark:border-amber-800 mb-4">
                                        <div className="flex flex-col items-center text-center">
                                            <Activity className="h-8 w-8 text-amber-500 mb-2" />
                                            <p className="text-sm text-amber-800 dark:text-amber-200 font-bold">
                                                Pending activation
                                            </p>
                                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                                This vault is currently being set up by the insurer. Deposits are not yet open.
                                            </p>
                                        </div>
                                    </div>
                                    {/* SIMULATION: INITIALIZE BUTTON (If User is Insurer or Simulation Mode) */}
                                    <div className="text-center">
                                        <button
                                            onClick={() => handleInitializeVault(selectedVault.id)}
                                            className="w-full md:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm mb-2"
                                        >
                                            Fund & Open (Simu)
                                        </button>
                                        <button
                                            disabled
                                            className="w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                                        >
                                            <Lock className="h-4 w-4" /> Public Access Locked
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* --- BLOC TRIGGERED (CATASTROPHE) --- */
                                <div className="space-y-4">
                                    <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl border border-red-100 dark:border-red-800 mb-4">
                                        <p className="text-sm text-red-800 dark:text-red-200 font-medium text-center">
                                            Withdrawals are restricted following the event.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleClaim(selectedVault)}
                                        disabled={selectedVault.userBalance <= 0}
                                        className={`w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg transition-all ${
                                            selectedVault.userBalance > 0
                                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200 dark:shadow-none'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                        }`}
                                    >
                                        <Coins className="h-5 w-5" />
                                        {selectedVault.userBalance > 0 ? "Claim Remaining Balance" : "Funds Claimed"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                            <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Need help?</h5>
                            <ul className="text-sm space-y-2 text-slate-600 dark:text-slate-400">
                                <li>• <a href="#" className="hover:underline">Whitepaper</a></li>
                                <li>• <a href="#" className="hover:underline">Smart Contract Audit</a></li>
                                <li>• <a href="#" className="hover:underline">Discord Support</a></li>
                            </ul>
                        </div>

                        {/* BOUTON SIMULATION CATASTROPHE (Uniquement si OPEN) */}
                        {selectedVault.status === 'OPEN' && (
                            <div className="flex flex-col gap-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-slate-800 rounded-full border border-red-100 dark:border-red-900 shadow-sm">
                                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-red-900 dark:text-red-300 text-sm">Test Zone (Simulation)</p>
                                        <p className="text-[10px] text-red-700 dark:text-red-400">
                                            Simulating a catastrophe sends a `triggerCatastrophe()` transaction to the Smart Contract.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => triggerOracle(selectedVault.id)}
                                    className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95 text-sm"
                                >
                                    SIMULATE CRASH
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VaultDetailsPage;
