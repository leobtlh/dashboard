import React, { useState } from 'react';
import {
    Wallet, Activity, CheckCircle2, AlertTriangle, ChevronDown,
    Coins, ArrowRight, Plus
} from '../components/ui/Icons.jsx';
import { useData } from '../context/DataContext.jsx';
import { useWeb3 } from '../context/Web3Context.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getTrancheAprs, calculatePayoutDetails } from '../utils/finance.js';
import { formatCurrency, calculateDaysRemaining } from '../utils/formatting.js';
import ConnectWalletModal from '../components/Modals/ConnectWalletModal.jsx';

const PortfolioPage = ({ onVaultSelect }) => {
    // --- GLOBAL CONTEXT ---
    const { vaults, claimFromVault } = useData();
    const { walletConnected, userFullAddress } = useWeb3();
    const { showToast } = useToast();

    // --- LOCAL STATE ---
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

    // --- HANDLE CLAIM ---
    const handleClaim = (vault) => {
        claimFromVault(vault.id);
        // Note: The context handles the toast, but if we want to match app.html logic strictly,
        // we might trigger it here too. Context usually suffices.
    };

    // --- NOT CONNECTED STATE ---
    if (!walletConnected) {
        return (
            <>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in max-w-2xl mx-auto">
                    <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-2">
                        <Wallet className="h-20 w-20 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard Access</h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400">
                        Connect your wallet to view your positions and manage your investments.
                    </p>
                    <button
                        onClick={() => setIsWalletModalOpen(true)}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-200 dark:hover:shadow-none flex items-center gap-2"
                    >
                        <Wallet className="h-5 w-5" /> Connect Wallet
                    </button>
                </div>
                <ConnectWalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
            </>
        );
    }

    // --- CONNECTED DASHBOARD ---
    // Filter vaults where user has a balance > 0
    const myVaults = vaults.filter(v => v.userBalance > 0);

    return (
        <div className="max-w-full mx-auto animate-in fade-in duration-500">
            <div className="text-center mb-10">
                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100 dark:border-green-800">
                    <Wallet className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Portfolio Dashboard</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Monitor your active investment positions</p>
            </div>

            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-slate-300 flex items-center gap-2">
                        <Activity className="h-4 w-4" /> Active Positions
                    </h3>
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {myVaults.map(vault => {
                        // --- CALCULS DES VALEURS ESTIMÉES ET APR PAR TRANCHE ---
                        const userJunior = vault.balancesJunior ? (vault.balancesJunior[userFullAddress] || 0) : 0;
                        const userSenior = vault.balancesSenior ? (vault.balancesSenior[userFullAddress] || 0) : 0;

                        // Appel au Helper
                        const { seniorApr, juniorApr } = getTrancheAprs(vault);

                        // Calcul Temps Restant
                        const daysRemaining = calculateDaysRemaining(vault.maturityDate);
                        const yearFraction = daysRemaining / 365;

                        // Valeurs de Fin Estimées
                        const estimatedSeniorEnd = userSenior * (1 + (seniorApr / 100) * yearFraction);
                        const estimatedJuniorEnd = userJunior * (1 + (juniorApr / 100) * yearFraction);
                        const totalEstimatedEnd = estimatedSeniorEnd + estimatedJuniorEnd;

                        // --- CAS 1: MATURED (SUCCÈS) ---
                        if (vault.status === 'MATURED') {
                            const details = calculatePayoutDetails(vault, userFullAddress);
                            return (
                                <div key={vault.id} className="p-4 bg-green-50/50 dark:bg-green-900/10 relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="text-xl font-bold text-green-900 dark:text-green-400 flex items-center gap-2">
                                                <CheckCircle2 className="h-5 w-5" /> {vault.name}
                                            </h4>
                                            <p className="text-xs font-mono text-green-600 dark:text-green-500 mt-1">{vault.id}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 rounded-full text-xs font-bold text-green-700 dark:text-green-300 border border-green-200 dark:border-green-600">
                                            SUCCESS - CLAIMABLE
                                        </span>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-green-100 dark:border-green-900/30 mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-slate-500 dark:text-slate-400">Initial Balance</span>
                                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{formatCurrency(vault.userBalance)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2 text-green-600 dark:text-green-400 text-sm">
                                            <span>Total Gains (Yield)</span>
                                            <span>+ {formatCurrency(details.yieldPayout)}</span>
                                        </div>
                                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-900 dark:text-white">Total Available</span>
                                            <span className="font-mono text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(details.totalPayout)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleClaim(vault)}
                                        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg shadow-green-200 dark:shadow-none transition-all flex justify-center items-center gap-2"
                                    >
                                        <Coins className="h-5 w-5" /> Claim Gains & Capital
                                    </button>
                                </div>
                            );
                        }

                        // --- CAS 2: TRIGGERED (CATASTROPHE) ---
                        if (vault.status === 'TRIGGERED') {
                            const details = calculatePayoutDetails(vault, userFullAddress);
                            return (
                                <div key={vault.id} className="p-8 bg-red-50/50 dark:bg-red-900/10 relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="text-xl font-bold text-red-900 dark:text-red-400 flex items-center gap-2">
                                                <AlertTriangle className="h-5 w-5" /> {vault.name}
                                            </h4>
                                            <p className="text-xs font-mono text-red-400 dark:text-red-500 mt-1">{vault.id}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/50 rounded-full text-xs font-bold text-red-600 dark:text-red-300 border border-red-200 dark:border-red-600">
                                            LOSS CONFIRMED
                                        </span>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-red-100 dark:border-red-900/30 mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-slate-500 dark:text-slate-400">Initial Balance</span>
                                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{formatCurrency(vault.userBalance)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2 text-red-600 dark:text-red-400 text-sm">
                                            <span>Estimated Loss</span>
                                            <span>- {formatCurrency(details.loss)}</span>
                                        </div>
                                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-900 dark:text-white">Remaining to Claim</span>
                                            <span className="font-mono text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(details.totalPayout)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleClaim(vault)}
                                        className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-red-200 dark:shadow-none transition-all flex justify-center items-center gap-2"
                                    >
                                        <Coins className="h-5 w-5" /> Claim Remaining Funds
                                    </button>
                                </div>
                            );
                        }

                        // --- CAS 3: OPEN (INVESTISSEMENT ACTIF) ---
                        return (
                            <details key={vault.id} className="group p-8 open:bg-slate-50 dark:open:bg-slate-900/20 transition-colors duration-300">
                                <summary className="list-none cursor-pointer outline-none [&::-webkit-details-marker]:hidden">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{vault.name}</h4>
                                            <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-1">{vault.id}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="px-3 py-1 bg-green-100 dark:bg-green-900/50 rounded-full text-xs font-bold text-green-600 dark:text-green-300 border border-green-200 dark:border-green-600">
                                                ACTIVE INVESTMENT
                                            </div>
                                            <div className="p-[5px] flex items-center gap-1 text-slate-400 dark:text-slate-500">
                                                <span className="text-xs font-medium">Details</span>
                                                <ChevronDown className="h-4 w-4 transition-transform duration-300 group-open:rotate-180" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 group-open:bg-white dark:group-open:bg-slate-800">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Invested Amount</p>
                                            <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(vault.userBalance)} <span className="text-sm font-sans font-normal text-slate-500 dark:text-slate-400">{vault.asset}</span>
                                            </p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900/30 p-4 rounded-xl border-2 border-green-100 dark:border-green-800 relative overflow-hidden group-open:bg-green-50 dark:group-open:bg-green-900/10">
                                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                                <Coins className="h-16 w-16 text-green-600 dark:text-green-400" />
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Estimated Value (Total)</p>
                                            <p className="text-2xl font-mono font-bold text-green-600 dark:text-green-400">
                                                {formatCurrency(totalEstimatedEnd)}
                                            </p>
                                        </div>
                                    </div>
                                </summary>

                                {/* --- SECTION DÉTAILLÉE (EXPANDED) --- */}
                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 animate-slide-up">
                                    <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Allocation & Projections by Tranche</h5>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* TRANCHE SENIOR */}
                                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                <span className="font-bold text-blue-700 dark:text-blue-300 text-sm">Senior Tranche</span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500 dark:text-slate-400">Invested</span>
                                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{formatCurrency(userSenior)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500 dark:text-slate-400">Est. APR</span>
                                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{seniorApr.toFixed(2)}%</span>
                                                </div>
                                                <div className="pt-2 mt-2 border-t border-blue-200 dark:border-blue-800/50 flex justify-between text-sm">
                                                    <span className="text-slate-600 dark:text-slate-300 font-medium">Est. End</span>
                                                    <span className="font-mono font-bold text-blue-700 dark:text-blue-300">{formatCurrency(estimatedSeniorEnd)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* TRANCHE JUNIOR */}
                                        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                                <span className="font-bold text-indigo-700 dark:text-indigo-300 text-sm">Junior Tranche</span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500 dark:text-slate-400">Invested</span>
                                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{formatCurrency(userJunior)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500 dark:text-slate-400">Est. APR</span>
                                                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{juniorApr.toFixed(2)}%</span>
                                                </div>
                                                <div className="pt-2 mt-2 border-t border-indigo-200 dark:border-indigo-800/50 flex justify-between text-sm">
                                                    <span className="text-slate-600 dark:text-slate-300 font-medium">Est. End</span>
                                                    <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">{formatCurrency(estimatedJuniorEnd)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* RÉSUMÉ TOTAL */}
                                        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 flex flex-col justify-center">
                                            <div className="text-center">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Estimated Total at Maturity</p>
                                                <p className="text-2xl font-bold text-green-700 dark:text-green-400 font-mono">{formatCurrency(totalEstimatedEnd)}</p>
                                                <p className="text-[10px] text-green-600/70 dark:text-green-400/70 mt-1">
                                                    Potential Gain: +{formatCurrency(totalEstimatedEnd - vault.userBalance)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={(e) => { e.preventDefault(); onVaultSelect(vault.id); }}
                                            className="px-6 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 text-slate-900 dark:text-white rounded-lg font-bold text-sm transition-all shadow-sm hover:shadow flex items-center gap-2"
                                        >
                                            Manage / Adjust Position <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </details>
                        );
                    })}

                    {myVaults.length === 0 && (
                        <div className="p-12 text-center">
                            <p className="text-slate-400 dark:text-slate-500 mb-2">No active investments.</p>
                            <button
                                onClick={() => window.location.reload()} // Navigation fallback if router not handled by parent purely
                                className="text-green-600 dark:text-green-400 hover:underline text-sm"
                            >
                                Explore opportunities
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PortfolioPage;
