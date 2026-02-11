import React, { useState } from 'react';
import { X, UserCheck } from '../ui/Icons';
import { useData } from '../../context/DataContext';

const InvestorKYCModal = ({ isOpen, onClose }) => {
    const { registerInvestor } = useData();
    const [formData, setFormData] = useState({ fullName: '', email: '', idHash: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await registerInvestor(formData);
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 overflow-hidden animate-zoom-in" onClick={e => e.stopPropagation()}>
                 <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-blue-600" /> Investor KYC (FinSA)
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50 text-sm text-blue-800 dark:text-blue-300">
                        To deposit into compliant Vaults, you must verify your identity (Qualified Investor Check).
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Legal Name</label>
                            <input
                                type="text" required
                                value={formData.fullName}
                                onChange={e => setFormData({...formData, fullName: e.target.value})}
                                className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email (Compliance)</label>
                            <input
                                type="email" required
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">ID/Passport Hash</label>
                            <input
                                type="text" required
                                value={formData.idHash}
                                onChange={e => setFormData({...formData, idHash: e.target.value})}
                                className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                placeholder="0x..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Verifying..." : "Verify & Authorize Wallet"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InvestorKYCModal;
