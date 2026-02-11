import React, { useState } from 'react';
import { X, ChevronDown } from '../ui/Icons';
import { RabbyIcon, ZerionIcon, MetaMaskIcon, WalletConnectIcon, SimulationIcon } from '../ui/WalletIcons';
import { useWeb3 } from '../../context/Web3Context';

const ConnectWalletModal = ({ isOpen, onClose }) => {
    const { connectWallet } = useWeb3();
    const [showOtherWallets, setShowOtherWallets] = useState(false);

    if (!isOpen) return null;

    const handleSelect = (walletType) => {
        connectWallet(walletType);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-zoom-in" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Connect Wallet</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-4 space-y-3">
                    {/* RABBY */}
                    <button onClick={() => handleSelect('rabby')} className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group">
                        <RabbyIcon />
                        <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">Rabby Wallet</span>
                    </button>

                    {/* ZERION */}
                    <button onClick={() => handleSelect('zerion')} className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group">
                        <ZerionIcon />
                        <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">Zerion Wallet</span>
                    </button>

                    {/* AUTRES WALLETS (DROPDOWN) */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                        <button onClick={() => setShowOtherWallets(!showOtherWallets)} className="w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                            <span>Other Wallets</span>
                            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showOtherWallets ? 'rotate-180' : ''}`} />
                        </button>

                        {showOtherWallets && (
                            <div className="space-y-2 mt-2 animate-slide-up">
                                <button onClick={() => handleSelect('simulation')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                                    <SimulationIcon />
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Simulation Wallet</span>
                                </button>
                                <button onClick={() => handleSelect('metamask')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                                    <MetaMaskIcon />
                                    <span className="font-medium text-slate-700 dark:text-slate-300">MetaMask</span>
                                </button>
                                <button onClick={() => handleSelect('walletconnect')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                                    <WalletConnectIcon />
                                    <span className="font-medium text-slate-700 dark:text-slate-300">WalletConnect</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConnectWalletModal;
