import React, { useState } from 'react';
import {
    Shield, Plus, Lock, Wallet, UserCheck, Activity, X, Minimize2,
    Calendar, CheckCircle2, AlertTriangle, ArrowRight, Globe
} from '../components/ui/Icons.jsx';
import { useData } from '../context/DataContext.jsx';
import { useWeb3 } from '../context/Web3Context.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { AVAILABLE_CHAINS, AVAILABLE_ASSETS, MONTHS } from '../constants/mocks.js';
import { formatCurrency, parseAppDate } from '../utils/formatting.js';
import { generateMockHistory } from '../utils/generators.js';
import InsurerRegistrationModal from '../components/Modals/InsurerRegistrationModal.jsx';
import ConnectWalletModal from '../components/Modals/ConnectWalletModal.jsx';

const InsurerDashboardPage = () => {
    // --- CONTEXT DATA ---
    const {
        isInsurerWhitelisted, registrationStatus, createVault, vaults, initializeVault
    } = useData();
    const { walletConnected, userFullAddress, userAddress, disconnectWallet } = useWeb3();
    const { showToast } = useToast();

    // --- LOCAL UI STATE ---
    const [isRegModalOpen, setIsRegModalOpen] = useState(false);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [isFormExpanded, setIsFormExpanded] = useState(false);
    const [isOvercollateralized, setIsOvercollateralized] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    // --- FORM STATE (From app.html) ---
    const [newVaultData, setNewVaultData] = useState({
        name: '',
        description: '',
        cap: 40000000,
        coverage: 40000000,
        juniorPercent: 10,
        junior: 4000000,
        premium: 330000,
        // START DATE FIELDS
        startDay: '',
        startMonth: 'January',
        startYear: new Date().getFullYear(),
        // MATURITY FIELDS
        day: '',
        month: 'January',
        year: new Date().getFullYear(),
        chain: 'Base',
        asset: 'USDC'
    });

    // --- LOGIC HELPERS (From app.html) ---
    const updateJunior = (cap, percent) => {
        const calculatedJunior = (parseFloat(cap || 0) * parseFloat(percent || 0)) / 100;
        return calculatedJunior;
    };

    const getMaxDays = (monthName) => {
        const m = MONTHS.find(mo => mo.name === monthName);
        return m ? m.days : 31;
    };

    const handleDateBlur = () => {
        setNewVaultData(current => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const currentYear = today.getFullYear();

            const getValidDateObj = (d, mName, y) => {
                const mIndex = MONTHS.findIndex(m => m.name === mName);
                const safeY = Math.max(parseInt(y) || currentYear, currentYear);
                const daysInMonth = new Date(safeY, mIndex + 1, 0).getDate();
                const safeD = Math.min(Math.max(1, parseInt(d) || 1), daysInMonth);
                return new Date(safeY, mIndex, safeD);
            };

            // Calcul Date Début
            let sDate = getValidDateObj(current.startDay, current.startMonth, current.startYear);

            // Si date passée (ex: 12 < 16), on passe au mois suivant (12 Février)
            if (sDate < today) {
                const targetDay = sDate.getDate();
                let nextM = sDate.getMonth() + 1;
                let nextY = sDate.getFullYear();

                // Gestion changement année (Décembre -> Janvier)
                if (nextM > 11) {
                    nextM = 0;
                    nextY++;
                }

                // Vérification validité jour dans le nouveau mois (ex: 31 Jan -> 28 Fév)
                const daysInNextMonth = new Date(nextY, nextM + 1, 0).getDate();
                const safeNextDay = Math.min(targetDay, daysInNextMonth);

                sDate = new Date(nextY, nextM, safeNextDay);
            }

            // Sécurité: Si après projection c'est toujours <= aujourd'hui, on force demain
            if (sDate <= today) {
                sDate = new Date(today);
                sDate.setDate(today.getDate() + 1);
            }

            // Calcul Date Fin
            let eDate = getValidDateObj(current.day, current.month, current.year);

            // Si on est le même mois/année que le début, mais que le jour de fin est inférieur au jour de début
            if (
                eDate.getMonth() === sDate.getMonth() &&
                eDate.getFullYear() === sDate.getFullYear() &&
                eDate.getDate() < sDate.getDate()
            ) {
                // On ajoute 1 mois à la date de fin
                eDate.setMonth(eDate.getMonth() + 1);
            }

            // Si la fin est <= au début, on force Fin = Début + 1 jour
            if (eDate <= sDate) {
                eDate = new Date(sDate);
                eDate.setDate(sDate.getDate() + 1);
            }

            return {
                ...current,
                startDay: sDate.getDate(),
                startMonth: MONTHS[sDate.getMonth()].name,
                startYear: sDate.getFullYear(),
                day: eDate.getDate(),
                month: MONTHS[eDate.getMonth()].name,
                year: eDate.getFullYear()
            };
        });
    };

    const handleCapBlur = () => {
        setNewVaultData(prev => {
            let val = parseFloat(prev.cap);
            if (isNaN(val) || val <= 0) val = 1000;
            // Recalcule de junior qui dépend de la capacité
            const updatedJunior = updateJunior(val, prev.juniorPercent);
            return { ...prev, cap: val, junior: updatedJunior };
        });
    };

    // --- ACTIONS ---
    const handleCreateVault = (e) => {
        e.preventDefault();

        let capVal = parseFloat(newVaultData.cap);
        if (isNaN(capVal) || capVal <= 0) capVal = 1000;
        let premiumVal = parseFloat(newVaultData.premium) || 0;
        if (premiumVal < 0) premiumVal = 0;
        let claimVal = isOvercollateralized ? (parseFloat(newVaultData.coverage) || capVal) : capVal;

        const finalDescription = newVaultData.description && newVaultData.description.trim() !== ""
            ? newVaultData.description
            : "Parametric Protection (auto-generated)";

        // Dates construction
        const mIndexStart = MONTHS.findIndex(m => m.name === newVaultData.startMonth);
        const startDate = new Date(newVaultData.startYear, mIndexStart, newVaultData.startDay);

        const mIndexEnd = MONTHS.findIndex(m => m.name === newVaultData.month);
        const endDate = new Date(newVaultData.year, mIndexEnd, newVaultData.day);

        const formatDateStr = (date) => `${date.getDate()} ${MONTHS[date.getMonth()].name} ${date.getFullYear()}`;

        // Calcul APR
        const diffTime = Math.abs(endDate - startDate);
        const durationInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 365;
        const juniorVal = parseFloat(newVaultData.junior || 0);

        const newVault = {
            name: newVaultData.name || "New Cat Bond",
            insurer: newVaultData.companyName || `Insurer (${userAddress})`, // Note: companyName might come from global context in real app, strictly using local state here
            description: finalDescription,
            totalCapacity: capVal + premiumVal,
            claimAmount: claimVal,
            juniorCapital: juniorVal,
            premium: premiumVal,
            startDate: formatDateStr(startDate),
            maturityDate: formatDateStr(endDate),
            apr: ((capVal - juniorVal) > 0 ? ((premiumVal * 100 * 365) / ((capVal - juniorVal) * durationInDays)).toFixed(2) : "0.00"),
            chain: newVaultData.chain,
            asset: newVaultData.asset,
            history: generateMockHistory('WIND') // Using imported generator
        };

        // Call Context Method
        createVault(newVault);

        // Reset form
        const today = new Date();
        setNewVaultData(prev => ({
            ...prev,
            name: '',
            description: '',
            cap: 40000000,
            startDay: today.getDate(),
            startMonth: MONTHS[today.getMonth()].name,
            startYear: today.getFullYear()
        }));
        setIsFormExpanded(false);
    };

    // --- HANDLE INSURER REGISTRATION (KYB) ---
    const handleInsurerRegistration = async (data) => {
        setIsRegistering(true);
        // Simulation delay similar to app.html behavior
        setTimeout(() => {
            // We'll assume the context handles the actual state update via 'registerInsurer' mock
            // But here we rely on the component state provided by Context (registrationStatus)
            // For this UI to update, we assume the Context method `registerInsurer` updates `registrationStatus` to 'pending'
            // If strictly following app.html logic, we would set local storage here, but we are in React Context environment.
            // We will trigger a toast.
            showToast("Simulated request sent successfully", 'success');
            setIsRegistering(false);
            setIsRegModalOpen(false);
        }, 1500);
    };

    // Filter Vaults
    const myVaults = vaults.filter(vault =>
        vault.insurerAddress && vault.insurerAddress.toLowerCase() === userFullAddress?.toLowerCase()
    );

    // --- RENDER STATES ---

    // 1. NOT CONNECTED
    if (!walletConnected) {
        return (
            <>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in max-w-2xl mx-auto">
                    <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-2">
                        <Shield className="h-20 w-20 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Insurer Access Only</h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400">
                        The insurer space is restricted to VUSA accredited entities. Please connect your wallet to verify your access rights.
                    </p>
                    <button onClick={() => setIsWalletModalOpen(true)} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-200 dark:hover:shadow-none flex items-center gap-2">
                        <Wallet className="h-5 w-5" /> Connect Wallet
                    </button>
                </div>
                <ConnectWalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
            </>
        );
    }

    // 2. CONNECTED BUT NOT WHITELISTED
    if (!isInsurerWhitelisted) {
        return (
            <>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in max-w-2xl mx-auto">
                    <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-full mb-2 border border-red-100 dark:border-red-900">
                        <UserCheck className="h-20 w-20 text-red-500 dark:text-red-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Unauthorized Access</h2>
                    {registrationStatus === 'pending' ? (
                        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 max-w-md">
                            <div className="flex items-center gap-2 font-bold mb-1"><Activity className="h-5 w-5" /> Application under review</div>
                            <p className="text-sm">Your KYB file has been received and is currently being processed by the protocol team.</p>
                        </div>
                    ) : registrationStatus === 'rejected' ? (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 max-w-md">
                            <div className="flex items-center gap-2 font-bold mb-1"><X className="h-5 w-5" /> Application Rejected</div>
                            <p className="text-sm">Your application has been rejected.</p>
                        </div>
                    ) : (
                        <p className="text-lg text-slate-500 dark:text-slate-400">The address <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{userAddress}</span> is not certified.</p>
                    )}
                    <div className="flex gap-4 mt-6">
                        <button onClick={disconnectWallet} className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Switch Wallet</button>
                        {registrationStatus !== 'pending' && (
                            <button onClick={() => setIsRegModalOpen(true)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-200 dark:shadow-none">Register as Insurer</button>
                        )}
                    </div>
                </div>
                <InsurerRegistrationModal
                    isOpen={isRegModalOpen}
                    onClose={() => setIsRegModalOpen(false)}
                    onSubmit={handleInsurerRegistration}
                    isSubmitting={isRegistering}
                />
            </>
        );
    }

    // 3. DASHBOARD (CONNECTED & WHITELISTED)
    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
            <div className={`transition-all duration-500 ease-in-out min-w-0 ${isFormExpanded ? 'lg:flex-[2]' : 'lg:flex-1'} space-y-6`}>
                <div
                    className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm transition-all ${isFormExpanded ? 'ring-2 ring-indigo-500/20' : ''}`}
                    onClick={() => setIsFormExpanded(true)}
                    onFocus={() => setIsFormExpanded(true)}
                >
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400"><Plus className="h-5 w-5" /></div>
                        <div><h2 className="text-lg font-bold text-slate-900 dark:text-white">New Vault</h2><p className="text-xs text-slate-500 dark:text-slate-400">Factory Deployment</p></div>
                        {isFormExpanded && (
                            <button onClick={(e) => { e.stopPropagation(); setIsFormExpanded(false); }} className="ml-auto text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-3 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 transition-colors"><Minimize2 className="h-3 w-3" /> Collapse</button>
                        )}
                    </div>

                    <form onSubmit={handleCreateVault} className="space-y-4">
                        <div className={isFormExpanded ? "grid grid-cols-2 gap-4" : "space-y-4"}>
                            <div className={isFormExpanded ? "col-span-2" : ""}>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Risk Name</label>
                                <input type="text" value={newVaultData.name} onChange={e => setNewVaultData({ ...newVaultData, name: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Ex: Florida Wind 2026" />
                            </div>

                            <div className={isFormExpanded ? "grid grid-cols-2 gap-4 col-span-2" : "grid grid-cols-2 gap-4"}>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Blockchain</label>
                                    <select value={newVaultData.chain} onChange={e => setNewVaultData({ ...newVaultData, chain: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                                        {AVAILABLE_CHAINS.map(chain => (<option key={chain} value={chain}>{chain}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Asset (Payment)</label>
                                    <select value={newVaultData.asset} onChange={e => setNewVaultData({ ...newVaultData, asset: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                                        {AVAILABLE_ASSETS.map(asset => (<option key={asset} value={asset}>{asset}</option>))}
                                    </select>
                                </div>
                            </div>

                            <div className={isFormExpanded ? "col-span-2" : ""}>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Trigger Conditions</label>
                                <textarea value={newVaultData.description} onChange={e => setNewVaultData({ ...newVaultData, description: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 resize-none text-sm" placeholder="Conditions..."></textarea>
                            </div>

                            {/* CHAMP DATE DEBUT */}
                            <div className={isFormExpanded ? "col-span-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800" : "p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800"}>
                                <label className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2"><Calendar className="h-4 w-4" /> Inception Date (Lock)</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <input type="number" min="1" max="31" value={newVaultData.startDay} onBlur={handleDateBlur} onChange={e => setNewVaultData({ ...newVaultData, startDay: e.target.value })} className="p-2 rounded-lg border dark:bg-slate-900 dark:border-slate-600" placeholder="DD" />
                                    <select value={newVaultData.startMonth} onBlur={handleDateBlur} onChange={e => setNewVaultData({ ...newVaultData, startMonth: e.target.value })} className="p-2 rounded-lg border dark:bg-slate-900 dark:border-slate-600">
                                        {MONTHS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                                    </select>
                                    <input type="number" min="2024" value={newVaultData.startYear} onBlur={handleDateBlur} onChange={e => setNewVaultData({ ...newVaultData, startYear: e.target.value })} className="p-2 rounded-lg border dark:bg-slate-900 dark:border-slate-600" placeholder="YYYY" />
                                </div>
                            </div>

                            <div className={isFormExpanded ? "grid grid-cols-3 gap-4 col-span-2" : "grid grid-cols-3 gap-4"}>
                                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">End Day</label><input type="number" min="1" max={getMaxDays(newVaultData.month)} value={newVaultData.day} onBlur={handleDateBlur} onChange={e => setNewVaultData({ ...newVaultData, day: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="DD" /></div>
                                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">End Month</label><select value={newVaultData.month} onBlur={handleDateBlur} onChange={e => setNewVaultData({ ...newVaultData, month: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all">{MONTHS.map(m => (<option key={m.name} value={m.name}>{m.name}</option>))}</select></div>
                                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">End Year</label><input type="number" min={new Date().getFullYear()} value={newVaultData.year} onBlur={handleDateBlur} onChange={e => setNewVaultData({ ...newVaultData, year: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="YYYY" /></div>
                            </div>

                            <div className={isFormExpanded ? "grid grid-cols-2 gap-4 col-span-2" : "grid grid-cols-2 gap-4"}>
                                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Capacity</label><input type="number" min="0" value={newVaultData.cap} onBlur={handleCapBlur} onChange={e => { const val = e.target.value; setNewVaultData({ ...newVaultData, cap: val, junior: updateJunior(val, newVaultData.juniorPercent) }); }} className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Junior (%)</label><div className="relative"><input type="number" min="0" max="100" value={newVaultData.juniorPercent} onChange={e => { const val = e.target.value; setNewVaultData({ ...newVaultData, juniorPercent: val, junior: updateJunior(newVaultData.cap, val) }); }} className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">%</span></div></div>
                            </div>

                            <div className={isFormExpanded ? "col-span-2" : ""}>
                                <div className="flex items-center gap-2 mb-2 mt-2">
                                    <input type="checkbox" id="overcollat" checked={isOvercollateralized} onChange={(e) => setIsOvercollateralized(e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 cursor-pointer" />
                                    <label htmlFor="overcollat" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none font-medium">Enable Over-collateralization</label>
                                </div>
                                {isOvercollateralized && (
                                    <div className="mb-4 animate-fade-in p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Insured Amount</label>
                                        <div className="relative"><input type="number" min="0" value={newVaultData.coverage} onChange={e => setNewVaultData({ ...newVaultData, coverage: e.target.value })} className="w-full p-3 border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">{newVaultData.asset}</span></div>
                                    </div>
                                )}
                            </div>

                            <div className={isFormExpanded ? "col-span-2" : ""}>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Junior Amount Required:</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(newVaultData.junior)}</span>
                                </div>
                            </div>

                            <div className={isFormExpanded ? "col-span-2" : ""}>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Premium to Pay</label>
                                <div className="relative"><input type="number" min="0" value={newVaultData.premium} onChange={e => setNewVaultData({ ...newVaultData, premium: e.target.value })} className="w-full p-3 pl-3 pr-16 border border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/20 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-green-800 dark:text-green-400 font-medium" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 dark:text-green-400 text-xs font-bold">{newVaultData.asset}</span></div>
                            </div>
                        </div>
                        <button type="submit" className="w-full mt-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg shadow-slate-200 dark:shadow-none">Deploy Contract</button>
                    </form>
                </div>

                <div className="bg-indigo-600 dark:bg-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                    <div className="flex items-center gap-3 mb-4"><Shield className="h-6 w-6 opacity-80" /><h3 className="font-bold">VUSA Space</h3></div>
                    <p className="text-indigo-100 text-sm mb-4 leading-relaxed">Your insurer status is verified.</p>
                    <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                        <div className="flex justify-between text-xs font-mono mb-1"><span className="opacity-70">STATUS</span><span className="text-green-300">VERIFIED</span></div>
                        <div className="flex justify-between text-xs font-mono"><span className="opacity-70">ENTITY</span><span>State Farm Re</span></div>
                    </div>
                </div>
            </div>

            <div className={`transition-all duration-500 ease-in-out min-w-0 ${isFormExpanded ? 'lg:flex-1' : 'lg:flex-[2]'}`} onClick={() => setIsFormExpanded(false)}>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Your Managed Vaults</h3>
                <div className="space-y-4">
                    {/* Vérification si la liste est vide */}
                    {(() => {
                        // Si aucun vault, on affiche le message d'état vide
                        if (myVaults.length === 0) {
                            return (
                                <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 text-center animate-fade-in group cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors" onClick={() => setIsFormExpanded(true)}>
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <Shield className="h-8 w-8 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500" />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Active Vaults</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                                        You have not deployed an insurance contract yet. Use the form to configure your first parametric product.
                                    </p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsFormExpanded(true); }}
                                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" /> Start Deployment
                                    </button>
                                </div>
                            );
                        }

                        // 3. Sinon, on affiche la liste normalement (Code existant)
                        return myVaults.map((vault) => (
                            <div key={vault.id} className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col ${!isFormExpanded ? 'md:flex-row' : ''} items-center justify-between gap-6 hover:shadow-md transition-shadow cursor-pointer`}>
                                {isFormExpanded ? (
                                    <div className="flex justify-between items-center w-full">
                                        <div className="min-w-0"><h4 className="font-bold text-slate-900 dark:text-white truncate">{vault.name}</h4><p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">{vault.id}</p></div>
                                        <div className="shrink-0 ml-2">
                                            {vault.status === 'PENDING' && <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-md">PENDING</span>}
                                            {vault.status === 'OPEN' && <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs font-bold rounded-md">ACTIVE</span>}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{vault.name}</h4>
                                                {vault.status === 'PENDING' && <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-md">PENDING</span>}
                                                {vault.status === 'OPEN' && <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs font-bold rounded-md">ACTIVE</span>}
                                                {vault.status === 'MATURED' && <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-md">ENDED</span>}
                                            </div>
                                            <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
                                                <span>Capacity: <strong>{formatCurrency(vault.totalCapacity)}</strong></span>
                                                <span>Junior: <strong>{formatCurrency(vault.juniorCapital)}</strong></span>
                                            </div>
                                        </div>

                                        {vault.status === 'PENDING' ? (
                                            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total to fund (Junior + Premium)</p>
                                                    <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(vault.juniorCapital + vault.premium)}</p>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); initializeVault(vault.id); }} className="w-full md:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm">Fund & Open</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                                                <div className="text-right"><p className="text-xs text-slate-400 dark:text-slate-500">Funds Raised</p><p className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(vault.currentAssets)}</p></div>
                                                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                                                <div className="text-right"><p className="text-xs text-slate-400 dark:text-slate-500">Public APR</p><p className="font-bold text-green-600 dark:text-green-400">{vault.apr}%</p></div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ));
                    })()}
                </div>
            </div>
        </div>
    );
};

export default InsurerDashboardPage;
