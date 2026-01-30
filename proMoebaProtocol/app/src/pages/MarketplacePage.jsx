import React, { useState } from 'react';
import { Search, LayoutGrid, List } from '../components/ui/Icons';
import VaultCard from '../components/Vaults/VaultCard';
import { useData } from '../context/DataContext';
import { AVAILABLE_CHAINS, AVAILABLE_ASSETS } from '../constants/mocks';

const MarketplacePage = ({ onVaultSelect }) => {
    const { vaults } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterChain, setFilterChain] = useState('All');
    const [filterAsset, setFilterAsset] = useState('All');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'

    // --- LOGIQUE DE FILTRAGE (issue de app.html) ---
    const filteredVaults = vaults.filter(vault => {
        const matchesSearch = vault.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              vault.insurer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesChain = filterChain === 'All' || vault.chain === filterChain;
        const matchesAsset = filterAsset === 'All' || vault.asset === filterAsset;
        return matchesSearch && matchesChain && matchesAsset;
    });

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Marketplace</h1>
                    <p className="text-slate-500 dark:text-slate-400">Discover and invest in parametric risk vaults.</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <LayoutGrid className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <List className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* BARRE DE RECHERCHE ET FILTRES */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
                {/* Search */}
                <div className="md:col-span-6 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search by name, insurer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                {/* Filter Chain */}
                <div className="md:col-span-3 relative">
                    <select
                        value={filterChain}
                        onChange={(e) => setFilterChain(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                    >
                        <option value="All">All Chains</option>
                        {AVAILABLE_CHAINS.map(chain => <option key={chain} value={chain}>{chain}</option>)}
                    </select>
                </div>

                {/* Filter Asset */}
                <div className="md:col-span-3 relative">
                    <select
                        value={filterAsset}
                        onChange={(e) => setFilterAsset(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                    >
                        <option value="All">All Assets</option>
                        {AVAILABLE_ASSETS.map(asset => <option key={asset} value={asset}>{asset}</option>)}
                    </select>
                </div>
            </div>

            {/* GRILLE DE RÉSULTATS */}
            {filteredVaults.length > 0 ? (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {filteredVaults.map(vault => (
                        <VaultCard
                            key={vault.id}
                            vault={vault}
                            viewMode={viewMode}
                            onClick={onVaultSelect}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No vaults found matching your filters.</p>
                    <button
                        onClick={() => {setSearchTerm(''); setFilterChain('All'); setFilterAsset('All');}}
                        className="mt-4 text-blue-600 hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default MarketplacePage;
