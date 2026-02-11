import React, { useState } from 'react';
import {
    Search, LayoutGrid, List, Globe, CheckCircle2, Lock, Activity,
    AlertTriangle, Building2, ArrowRight
} from '../components/ui/Icons.jsx';
import { useData } from '../context/DataContext.jsx';
import { AVAILABLE_CHAINS, CHAIN_LOGOS } from '../constants/mocks.js';
import { formatCurrency, parseAppDate } from '../utils/formatting.js';

const MarketplacePage = ({ onVaultSelect }) => {
    // Access global data
    const { vaults } = useData();

    // --- LOCAL STATE (From app.html) ---
    const [selectedChains, setSelectedChains] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [aprSort, setAprSort] = useState('neutral');
    const [maturitySort, setMaturitySort] = useState('neutral');
    const [riskSort, setRiskSort] = useState('neutral');
    const [viewMode, setViewMode] = useState('list');

    // --- HELPERS (From app.html) ---
    const isVaultStarted = (vault) => {
        if (!vault || !vault.startDate) return false;
        const start = parseAppDate(vault.startDate);
        return start && new Date() >= start;
    };

    const toggleChainFilter = (chain) => {
        if (selectedChains.includes(chain)) {
            setSelectedChains(selectedChains.filter(c => c !== chain));
        } else {
            setSelectedChains([...selectedChains, chain]);
        }
    };

    const parseDateForSort = (dateStr) => {
        if (!dateStr || dateStr === "Pending") return new Date(9999, 11, 31);
        const d = parseAppDate(dateStr);
        return d || new Date();
    };

    const toggleAprSort = () => {
        setMaturitySort('neutral');
        setRiskSort('neutral');
        if (aprSort === 'neutral') setAprSort('desc');
        else if (aprSort === 'desc') setAprSort('asc');
        else setAprSort('neutral');
    };

    const toggleMaturitySort = () => {
        setAprSort('neutral');
        setRiskSort('neutral');
        if (maturitySort === 'neutral') setMaturitySort('asc');
        else if (maturitySort === 'asc') setMaturitySort('desc');
        else setMaturitySort('neutral');
    };

    const toggleRiskSort = () => {
        setAprSort('neutral');
        setMaturitySort('neutral');
        if (riskSort === 'neutral') setRiskSort('asc');
        else if (riskSort === 'asc') setRiskSort('desc');
        else setRiskSort('neutral');
    };

    // --- FILTERING & SORTING LOGIC ---
    const filteredVaults = vaults.filter(vault => {
        if (selectedChains.length > 0 && !selectedChains.includes(vault.chain)) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return vault.asset.toLowerCase().includes(q) || vault.name.toLowerCase().includes(q);
        }
        return true;
    }).sort((a, b) => {
        if (aprSort !== 'neutral') {
            const valA = parseFloat(a.apr);
            const valB = parseFloat(b.apr);
            return aprSort === 'desc' ? valB - valA : valA - valB;
        }
        if (maturitySort !== 'neutral') {
            const dateA = parseDateForSort(a.maturityDate);
            const dateB = parseDateForSort(b.maturityDate);
            return maturitySort === 'asc' ? dateA - dateB : dateB - dateA;
        }
        if (riskSort !== 'neutral') {
            const riskA = parseFloat(a.riskProb);
            const riskB = parseFloat(b.riskProb);
            return riskSort === 'asc' ? riskA - riskB : riskB - riskA;
        }
        return 0;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* EN-TÊTE + FILTRES MULTI-CHAINS */}
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Vaults Opportunities</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Invest in Swiss-compliant parametric risks, secured by a fully funded blockchain infrastructure.</p>
                </div>

                {/* BARRE DE FILTRES BLOCKCHAINS */}
                <div className="w-full flex flex-wrap items-center gap-2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-pink-50/30 to-pink-200/50 dark:from-transparent dark:via-pink-900/10 dark:to-pink-800/30 p-2 rounded-xl">
                    <span className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wide flex items-center gap-1"><Globe className="h-4 w-4" /> Network</span>
                    {AVAILABLE_CHAINS.filter(chain => vaults.some(v => v.chain === chain)).map(chain => (
                        <button
                            key={chain}
                            onClick={() => toggleChainFilter(chain)}
                            title={chain}
                            className={`p-2 rounded-lg transition-all border ${
                                selectedChains.includes(chain)
                                ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500 shadow-sm'
                                : 'bg-white dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:border-blue-300'
                            }`}
                        >
                            <img src={CHAIN_LOGOS[chain]} alt={chain} className="w-6 h-6 object-contain" />
                        </button>
                    ))}

                    <div className="ml-auto flex items-center gap-2">
                        {/* BOUTONS TOGGLE VIEW MODE (LISTE / GRILLE) */}
                        <div className="flex bg-white dark:bg-slate-700 rounded-lg p-1 border border-slate-200 dark:border-slate-600">
                            <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                            title="Vue Liste"
                            >
                                <List className="h-4 w-4" />
                            </button>
                            <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                            title="Vue Grille"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                        </div>

                        {(selectedChains.length > 0 || searchQuery || aprSort !== 'neutral' || maturitySort !== 'neutral') && (
                            <button onClick={() => { setSelectedChains([]); setSearchQuery(''); setAprSort('neutral'); setMaturitySort('neutral'); }} className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                Reset Filtres
                            </button>
                        )}
                    </div>
                </div>

                {/* BARRE DE FILTRES APR CROISSANT/DECROISSANT & MATURITE & SEARCH */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* BOUTON TRI APR */}
                    <button
                        onClick={toggleAprSort}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border select-none ${
                            aprSort !== 'neutral'
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-sm'
                            : 'bg-white dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                    >
                        <span className="font-bold text-sm">APR</span>
                        {aprSort === 'neutral' && <span className="text-slate-300">⇅</span>}
                        {aprSort === 'desc' && <span>↓</span>}
                        {aprSort === 'asc' && <span>↑</span>}
                    </button>

                    {/* BOUTON TRI MATURITE */}
                    <button
                        onClick={toggleMaturitySort}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border select-none ${
                            maturitySort !== 'neutral'
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-sm'
                            : 'bg-white dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                    >
                        <span className="font-bold text-sm">Maturity</span>
                        {maturitySort === 'neutral' && <span className="text-slate-300">⇅</span>}
                        {maturitySort === 'asc' && <span>→</span>}
                        {maturitySort === 'desc' && <span>←</span>}
                    </button>

                    {/* BUTTON RISK SORT */}
                    <button
                        onClick={toggleRiskSort}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border select-none ${
                            riskSort !== 'neutral'
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-sm'
                            : 'bg-white dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                    >
                        <span className="font-bold text-sm">Risk</span>
                        {riskSort === 'neutral' && <span className="text-slate-300">⇅</span>}
                        {riskSort === 'asc' && <span>↓</span>}
                        {riskSort === 'desc' && <span>↑</span>}
                    </button>

                    {/* CHAMP RECHERCHE */}
                    <div className="relative ml-auto flex-1 min-w-[200px] max-w-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                            placeholder="Search (e.g., USDC, Florida...)"
                        />
                    </div>
                </div>

            </div>

            {/* CONTENEUR GRILLE / LISTE */}
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                {filteredVaults.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        No vault found with these criteria.
                    </div>
                ) : (
                    filteredVaults.map((vault) => {
                        // Vérification si le vault est complet
                        const isFull = vault.currentAssets >= vault.totalCapacity;
                        // CHECK STATUT DE DEMARRAGE
                        const started = isVaultStarted(vault);

                        if (viewMode === 'list') {
                            // VUE LISTE COMPACTE
                            return (
                                <div
                                    key={vault.id}
                                    onClick={() => onVaultSelect(vault.id)}
                                    className={`group relative rounded-xl border transition-all cursor-pointer hover:shadow-md
                                        ${vault.status === 'TRIGGERED' ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900' :
                                        vault.status === 'MATURED' ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900' :
                                        isFull && vault.status === 'OPEN' ? 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 opacity-90' :
                                        'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500'}`}
                                >
                                    <div className="p-4 relative flex flex-col md:flex-row md:items-center gap-6">

                                        {/* MAIN INFO & BADGES */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600 uppercase tracking-wider">
                                                    {vault.chain}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800 uppercase tracking-wider">
                                                    {vault.asset}
                                                </span>
                                                {vault.status === 'OPEN' && !started && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> OPEN</span>}
                                                {vault.status === 'OPEN' && started && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 flex items-center gap-1"><Lock className="h-3 w-3" /> LOCKED</span>}
                                                {vault.status === 'MATURED' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> COMPLETED</span>}
                                                {vault.status === 'PENDING' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center gap-1"><Activity className="h-3 w-3" /> PENDING</span>}
                                                {vault.status === 'TRIGGERED' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> DISASTER</span>}
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{vault.name}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-1">
                                                <Building2 className="h-3 w-3" /> {vault.insurer}
                                            </p>
                                        </div>

                                        <div className="w-full max-w-[500px] grid grid-cols-[auto_0.5fr_auto_0.5fr_auto_1.6fr] items-center gap-4">

                                            {/* --- SEPARATEUR --- */}
                                            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-auto"></div>

                                            {/* --- BLOC 1 : RISQUE --- */}
                                            <div className="flex flex-col items-start">
                                                <span className="text-sm text-slate-400 dark:text-slate-500">Risk</span>
                                                <span className={`text-ml font-bold ${vault.riskProb > 10 ? 'text-red-600 dark:text-red-400' : 'text-orange-500 dark:text-orange-400'}`}>
                                                    {vault.riskProb}%
                                                </span>
                                            </div>

                                            {/* --- SEPARATEUR --- */}
                                            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-auto"></div>

                                            {/* --- BLOC 2 : APR --- */}
                                            <div className="flex flex-col items-start">
                                                <span className="text-sm text-slate-400 dark:text-slate-500">APR</span>
                                                <span className={`text-ml font-bold leading-none ${
                                                    vault.status === 'OPEN' || vault.status === 'MATURED'
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-slate-400 dark:text-slate-500'
                                                }`}>
                                                    {vault.apr}%
                                                </span>
                                            </div>

                                            {/* --- SEPARATEUR --- */}
                                            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-auto"></div>

                                            {/* --- BLOC 3 : LEVÉE --- */}
                                            <div className="flex flex-col items-start">
                                                <span className="text-sm text-slate-400 dark:text-slate-500">Funds raised</span>
                                                <span className="text-ml font-bold text-slate-700 dark:text-slate-300">
                                                    {formatCurrency(vault.currentAssets)}
                                                    <span className="text-slate-400 dark:text-slate-500 text-sm font-normal ml-1">
                                                        / {formatCurrency(vault.totalCapacity)}
                                                    </span>
                                                </span>
                                            </div>

                                        </div>


                                        {/* DÉBUT ET MATURITÉ */}
                                        <div className="flex flex-wrap items-center gap-14 justify-end pr-[74px] relative">

                                            {/* BOXES */}
                                            <div className="flex flex-col gap-4">
                                                <div className="w-[350px] h-[70px] relative flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 px-4 py-4 rounded-xl border border-slate-100 dark:border-slate-700 shrink-0">
                                                    <div>
                                                        <p className="text-sm text-slate-400 dark:text-slate-500">Beginning</p>
                                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{vault.startDate || 'N/A'}</p>
                                                    </div>

                                                    {/* Barre */}
                                                    <div
                                                    className="absolute top-1/2 -translate-y-1/2 flex items-center gap-10 pointer-events-none"
                                                    style={{ left: '50%' }}
                                                    >
                                                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                                                    </div>

                                                    <div className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center gap-10 pointer-events-none">
                                                        <div className="text-right">
                                                            <p className="text-sm text-slate-400 dark:text-slate-500">Maturity</p>
                                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{vault.maturityDate}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ARROW */}
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors hidden md:block">
                                                <ArrowRight className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pl-4 pr-[90px]">
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-4 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${vault.status === 'TRIGGERED' ? 'bg-red-500' : vault.status === 'MATURED' ? 'bg-green-500' : isFull ? 'bg-slate-500' : 'bg-blue-600'}`}
                                            style={{ width: `${(vault.currentAssets / vault.totalCapacity) * 100}%` }}
                                        ></div>
                                        </div>
                                    </div>

                                </div>
                            );
                        }

                        // VUE GRILLE
                        return (
                            <div
                                key={vault.id}
                                onClick={() => onVaultSelect(vault.id)}
                                className={`group relative bg-white dark:bg-slate-800 rounded-2xl border transition-all cursor-pointer
                                    ${vault.status === 'TRIGGERED' ? 'border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/20' :
                                    vault.status === 'MATURED' ? 'border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/20' :
                                    isFull && vault.status === 'OPEN' ? 'border-slate-300 dark:border-slate-600 bg-slate-100/50 dark:bg-slate-800/50 opacity-90' :
                                    'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg'}`}
                            >
                                <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                                    {/* BADGES */}
                                    {vault.status === 'OPEN' && !started && !isFull && <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> OPEN</span>}
                                    {vault.status === 'OPEN' && started && <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 flex items-center gap-1"><Lock className="h-3 w-3" /> LOCKED</span>}
                                    {vault.status === 'OPEN' && isFull && !started && <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1"><Lock className="h-3 w-3" /> SOLD OUT</span>}
                                    {vault.status === 'MATURED' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> OVER</span>}
                                    {vault.status === 'PENDING' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center gap-1"><Activity className="h-3 w-3" /> PENDING</span>}
                                    {vault.status === 'TRIGGERED' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> DISASTER</span>}
                                </div>

                                <div className="p-6">
                                    <div className="mb-6">
                                        {/* BADGE NETWORK & ASSET DANS LA CARTE */}
                                        <div className="flex gap-2 mb-3">
                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600 uppercase tracking-wider">
                                                {vault.chain}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-[10px] font-bold text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800 uppercase tracking-wider">
                                                {vault.asset}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{vault.name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                            <Building2 className="h-3 w-3" /> Insurer: {vault.insurer}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-end mb-6">
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Yield (APR)</p>
                                            <p className={`text-4xl font-bold ${vault.status === 'OPEN' ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                                {vault.apr}%
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Funds raised</p>
                                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                                {formatCurrency(vault.currentAssets)} <span className="text-slate-400 dark:text-slate-500 text-sm font-normal">/ {formatCurrency(vault.totalCapacity)}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3 text-orange-500" /> Probability of loss
                                        </span>
                                        <span className={`text-sm font-bold ${vault.riskProb > 10 ? 'text-red-600 dark:text-red-400' : 'text-orange-500 dark:text-orange-400'}`}>
                                            {vault.riskProb}%
                                        </span>
                                    </div>

                                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 mb-6 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${vault.status === 'TRIGGERED' ? 'bg-red-500' : vault.status === 'MATURED' ? 'bg-green-500' : isFull ? 'bg-slate-500' : 'bg-blue-600'}`}
                                            style={{ width: `${(vault.currentAssets / vault.totalCapacity) * 100}%` }}
                                        ></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1">Inception Date (Lock)</p>
                                            <p className="font-semibold text-slate-900 dark:text-white">{vault.startDate || 'N/A'}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1">Maturity (Unlock)</p>
                                            <p className="font-semibold text-slate-900 dark:text-white">{vault.maturityDate}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-center items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium">
                                        <span>View details {vault.status === 'OPEN' && !isFull ? '& Invest' : ''}</span> <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default MarketplacePage;
