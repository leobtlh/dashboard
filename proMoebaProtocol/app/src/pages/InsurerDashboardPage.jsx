import React, { useState } from 'react';
import { Shield, Plus, Lock } from '../components/ui/Icons';
import { useData } from '../context/DataContext';
import { useWeb3 } from '../context/Web3Context';
import { useToast } from '../context/ToastContext';
import { AVAILABLE_CHAINS, AVAILABLE_ASSETS, MONTHS } from '../constants/mocks';
import { updateJunior } from '../utils/finance';
import { isValidDayInMonth, getMaxDays } from '../utils/formatting';
import InsurerRegistrationModal from '../components/Modals/InsurerRegistrationModal';
import VaultCard from '../components/Vaults/VaultCard';

const InsurerDashboardPage = () => {
    const {
        isInsurerWhitelisted, registrationStatus, createVault, vaults, initializeVault
    } = useData();
    const { walletConnected, userFullAddress } = useWeb3();
    const { showToast } = useToast();
    const [isRegModalOpen, setIsRegModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '', description: '', chain: 'Base', asset: 'USDC',
        totalCapacity: '', juniorPercent: '10', juniorCapital: '', premium: '',
        startDay: '1', startMonth: 'January', startYear: '2025',
        endDay: '31', endMonth: 'December', endYear: '2025',
        apr: '10', type: 'Hurricane'
    });

    const issuedVaults = vaults.filter(v => v.insurerAddress === userFullAddress);

    // Gestion du calcul automatique Junior Capital
    const handleCapacityChange = (val) => {
        const cap = parseFloat(val);
        const jun = updateJunior(cap, formData.juniorPercent);
        setFormData({ ...formData, totalCapacity: val, juniorCapital: jun.toFixed(2) });
    };

    const handlePercentChange = (val) => {
        const jun = updateJunior(formData.totalCapacity, val);
        setFormData({ ...formData, juniorPercent: val, juniorCapital: jun.toFixed(2) });
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();

        // Validation dates
        if (!isValidDayInMonth(parseInt(formData.startDay), formData.startMonth, parseInt(formData.startYear)) ||
            !isValidDayInMonth(parseInt(formData.endDay), formData.endMonth, parseInt(formData.endYear))) {
            showToast("Invalid dates selected.", 'error');
            return;
        }

        // Construction des dates string
        const startDateStr = `${formData.startDay} ${formData.startMonth} ${formData.startYear}`;
        const endDateStr = `${formData.endDay} ${formData.endMonth} ${formData.endYear}`;

        createVault({
            ...formData,
            startDateStr,
            endDateStr,
            claimAmount: formData.totalCapacity // Simplification: Claim = Max Capacity
        });

        // Reset form (optionnel)
    };

    if (!walletConnected) {
        return <div className="text-center py-20 text-slate-500">Connect wallet to access Insurer Dashboard.</div>;
    }

    if (!isInsurerWhitelisted) {
        return (
            <div className="max-w-2xl mx-auto py-12 text-center animate-fade-in">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="h-10 w-10 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Insurer Access Restricted</h2>
                <p className="text-slate-500 mb-8">
                    You need to be a whitelisted insurer to issue Cat Bonds on Mœba Protocol.
                </p>

                {registrationStatus === 'pending' ? (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-800">
                        Registration pending approval.
                    </div>
                ) : (
                    <button
                        onClick={() => setIsRegModalOpen(true)}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                    >
                        Register as Insurer
                    </button>
                )}
                <InsurerRegistrationModal isOpen={isRegModalOpen} onClose={() => setIsRegModalOpen(false)} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-10">
            {/* HEADER DASHBOARD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <p className="opacity-80 text-sm font-medium mb-1">Total Active Cover</p>
                    <p className="text-3xl font-bold">$45.2M</p>
                    <Shield className="absolute bottom-[-10px] right-[-10px] h-24 w-24 opacity-20" />
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-slate-500 text-sm font-medium mb-1">Active Policies</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{issuedVaults.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-slate-500 text-sm font-medium mb-1">Premium Earned</p>
                    <p className="text-3xl font-bold text-green-600">$1.2M</p>
                </div>
            </div>

            {/* FORMULAIRE CRÉATION */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Plus className="h-6 w-6 text-indigo-600" /> Issue New Cat Bond
                </h2>

                <form onSubmit={handleCreateSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* LEFT COLUMN */}
                        <div className="space-y-4">
                            <div>
                                <label className="label-style">Bond Name</label>
                                <input required type="text" className="input-style" placeholder="Ex: Hurricane Florida 2025"
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-style">Chain</label>
                                    <select className="input-style" value={formData.chain} onChange={e => setFormData({...formData, chain: e.target.value})}>
                                        {AVAILABLE_CHAINS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-style">Asset</label>
                                    <select className="input-style" value={formData.asset} onChange={e => setFormData({...formData, asset: e.target.value})}>
                                        {AVAILABLE_ASSETS.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="label-style">Risk Type</label>
                                <select className="input-style" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                    <option value="Hurricane">Hurricane / Typhoon</option>
                                    <option value="Earthquake">Earthquake</option>
                                    <option value="Flood">Flood / Excess Rainfall</option>
                                </select>
                            </div>
                            <div>
                                <label className="label-style">Description (Oracle & Trigger details)</label>
                                <textarea required rows="3" className="input-style" placeholder="Details..."
                                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-4">
                            <div>
                                <label className="label-style">Total Capacity ({formData.asset})</label>
                                <input required type="number" className="input-style" placeholder="1000000"
                                    value={formData.totalCapacity} onChange={e => handleCapacityChange(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-style">First Loss (%)</label>
                                    <input required type="number" className="input-style"
                                        value={formData.juniorPercent} onChange={e => handlePercentChange(e.target.value)} />
                                </div>
                                <div>
                                    <label className="label-style">Required Capital</label>
                                    <input type="text" disabled className="input-style bg-slate-50 dark:bg-slate-900 opacity-60"
                                        value={formData.juniorCapital} />
                                </div>
                            </div>
                            <div>
                                <label className="label-style">Premium to pay ({formData.asset})</label>
                                <input required type="number" className="input-style" placeholder="50000"
                                    value={formData.premium} onChange={e => setFormData({...formData, premium: e.target.value})} />
                            </div>
                            <div>
                                <label className="label-style">Investor APR (%)</label>
                                <input required type="number" step="0.1" className="input-style" placeholder="10.5"
                                    value={formData.apr} onChange={e => setFormData({...formData, apr: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    {/* DATES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div>
                            <label className="label-style mb-2 block">Inception Date</label>
                            <div className="flex gap-2">
                                <input type="number" min="1" max={getMaxDays(formData.startMonth)} className="input-style w-20"
                                    value={formData.startDay} onChange={e => setFormData({...formData, startDay: e.target.value})} />
                                <select className="input-style flex-1" value={formData.startMonth} onChange={e => setFormData({...formData, startMonth: e.target.value})}>
                                    {MONTHS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                                </select>
                                <input type="number" className="input-style w-24" value={formData.startYear} onChange={e => setFormData({...formData, startYear: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="label-style mb-2 block">Maturity Date</label>
                            <div className="flex gap-2">
                                <input type="number" min="1" max={getMaxDays(formData.endMonth)} className="input-style w-20"
                                    value={formData.endDay} onChange={e => setFormData({...formData, endDay: e.target.value})} />
                                <select className="input-style flex-1" value={formData.endMonth} onChange={e => setFormData({...formData, endMonth: e.target.value})}>
                                    {MONTHS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                                </select>
                                <input type="number" className="input-style w-24" value={formData.endYear} onChange={e => setFormData({...formData, endYear: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all">
                            Create Vault Proposition
                        </button>
                    </div>
                </form>
            </div>

            {/* MY VAULTS LIST */}
            <div>
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Your Issued Vaults</h2>
                 <div className="space-y-4">
                    {issuedVaults.map(vault => (
                        <div key={vault.id} className="relative">
                            <VaultCard vault={vault} viewMode="list" onClick={() => {}} />
                            {vault.status === 'PENDING' && (
                                <div className="absolute top-4 right-4 z-10">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); initializeVault(vault.id); }}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg hover:scale-105 transition-transform"
                                    >
                                        Initialize & Deposit Capital
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {issuedVaults.length === 0 && <p className="text-slate-400 italic">No vaults issued yet.</p>}
                 </div>
            </div>
        </div>
    );
};

// Styles utilitaires locaux
const labelStyle = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";
const inputStyle = "w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900 dark:text-white";

export default InsurerDashboardPage;
