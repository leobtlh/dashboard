import React, { useMemo } from 'react';
import { Wallet, TrendingUp, Activity, ArrowRight, Shield } from '../components/ui/Icons';
import VaultCard from '../components/Vaults/VaultCard';
import { useData } from '../context/DataContext';
import { useWeb3 } from '../context/Web3Context';
import { calculatePayoutDetails } from '../utils/finance';
import { formatCurrency } from '../utils/formatting';

const PortfolioPage = ({ onVaultSelect }) => {
    const { vaults } = useData();
    const { userFullAddress, walletConnected } = useWeb3();

    // --- LOGIQUE PORTFOLIO (Identique à app.html) ---
    const myVaults = useMemo(() => {
        if (!walletConnected || !userFullAddress) return [];
        return vaults.filter(v => {
            const hasJunior = v.balancesJunior && v.balancesJunior[userFullAddress] > 0;
            const hasSenior = v.balancesSenior && v.balancesSenior[userFullAddress] > 0;
            return hasJunior || hasSenior;
        });
    }, [vaults, walletConnected, userFullAddress]);

    const stats = useMemo(() => {
        let totalInvested = 0;
        let totalYield = 0;
        let activePositions = 0;

        myVaults.forEach(vault => {
            if (vault.status === 'OPEN' || vault.status === 'MATURED') {
                const details = calculatePayoutDetails(vault, userFullAddress);
                totalInvested += (details.principalRecovered || 0); // Approx
                totalYield += (details.yieldPayout || 0);
                if (vault.status === 'OPEN') activePositions++;
            }
        });
        return { totalInvested, totalYield, activePositions };
    }, [myVaults, userFullAddress]);

    const claimableVaults = myVaults.filter(v => v.status === 'MATURED' || v.status === 'TRIGGERED');

    if (!walletConnected) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <Wallet className="h-10 w-10 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Connect your wallet</h2>
                <p className="text-slate-500 mb-8">Please connect your wallet to view your portfolio.</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Portfolio</h1>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet className="h-24 w-24 text-blue-600" /></div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Invested</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.totalInvested)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="h-24 w-24 text-green-600" /></div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Accrued Yield</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">+{formatCurrency(stats.totalYield)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="h-24 w-24 text-purple-600" /></div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Active Positions</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.activePositions}</p>
                </div>
            </div>

            {/* CLAIMABLE SECTION (si dispo) */}
            {claimableVaults.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5" /> Claimable Payouts
                    </h3>
                    <div className="space-y-4">
                        {claimableVaults.map(vault => (
                            <div key={vault.id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-green-100 dark:border-green-900/20">
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">{vault.name}</h4>
                                    <p className="text-sm text-slate-500">Status: {vault.status}</p>
                                </div>
                                <button
                                    onClick={() => onVaultSelect(vault.id)}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-green-200 dark:shadow-none transition-all"
                                >
                                    Claim Now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ACTIVE POSITIONS LIST */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Your Active Positions</h2>
                {myVaults.length > 0 ? (
                    <div className="space-y-4">
                        {myVaults.map(vault => (
                            <VaultCard
                                key={vault.id}
                                vault={vault}
                                viewMode="list"
                                onClick={onVaultSelect}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-slate-500 mb-4">You don't have any active positions yet.</p>
                        <button
                            onClick={() => window.location.reload()} // Hack simple pour retourner à l'accueil si navigation pas dispo ici, mais onVaultSelect gère le switch
                            className="text-blue-600 font-bold hover:underline"
                        >
                            Explore Marketplace
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortfolioPage;
