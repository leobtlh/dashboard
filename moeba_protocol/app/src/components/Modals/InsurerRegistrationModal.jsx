import React, { useState } from 'react';
import { X, Shield } from '../ui/Icons';
import { useData } from '../../context/DataContext';

const InsurerRegistrationModal = ({ isOpen, onClose }) => {
    const { registerInsurer } = useData();
    const [formData, setFormData] = useState({ companyName: '', kybLink: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await registerInsurer(formData);
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 overflow-hidden animate-zoom-in" onClick={e => e.stopPropagation()}>
                 <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-600" /> Insurer Registration
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50 text-sm text-indigo-800 dark:text-indigo-300">
                        To be whitelisted, you must provide legal proof of existence (KYB) and a valid insurance certificate.
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Company Name</label>
                            <input
                                type="text"
                                required
                                value={formData.companyName}
                                onChange={e => setFormData({...formData, companyName: e.target.value})}
                                className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Ex: Axa Corporate Solutions"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">KYB Proof (IPFS/URL Link)</label>
                            <input
                                type="text"
                                required
                                value={formData.kybLink}
                                onChange={e => setFormData({...formData, kybLink: e.target.value})}
                                className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                                placeholder="ipfs://..."
                            />
                            <p className="text-xs text-slate-500 mt-1">Link to the decentralized hosted certificate.</p>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Sending request..." : "Submit Request"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InsurerRegistrationModal;
