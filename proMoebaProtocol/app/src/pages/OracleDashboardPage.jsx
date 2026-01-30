import React from 'react';
import { Activity, AlertTriangle } from '../components/ui/Icons';
import { useData } from '../context/DataContext';

const OracleDashboardPage = () => {
    const { vaults, triggerOracle } = useData();
    const openVaults = vaults.filter(v => v.status === 'OPEN');

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <Activity className="h-8 w-8 text-red-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Oracle Network Status</h1>
                    <p className="text-slate-500">Real-time monitoring of parametric triggers.</p>
                </div>
            </div>

            <div className="space-y-6">
                {openVaults.length > 0 ? openVaults.map(vault => (
                    <div key={vault.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">{vault.chain}</span>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{vault.name}</h3>
                            </div>
                            <div className="flex gap-6 text-sm">
                                <div>
                                    <span className="text-slate-500 block text-xs">Trigger Type</span>
                                    <span className="font-medium">{vault.triggers?.[0]?.name || 'Wind Speed'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs">Threshold</span>
                                    <span className="font-medium text-red-500"> &gt; {vault.triggerValue} {vault.triggers?.[0]?.unit}</span>
                                </div>
                            </div>
                        </div>

                        {/* BOUTON SIMULATION */}
                        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-4">
                            <div className="text-xs text-red-800 dark:text-red-300 max-w-[200px]">
                                <strong className="block mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3"/> Admin Zone</strong>
                                Simulate a catastrophic event to trigger payout.
                            </div>
                            <button
                                onClick={() => triggerOracle(vault.id)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm shadow-lg hover:scale-105 transition-all"
                            >
                                SIMULATE CRASH
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-12 text-slate-400">No active vaults to monitor.</div>
                )}
            </div>
        </div>
    );
};

export default OracleDashboardPage;
