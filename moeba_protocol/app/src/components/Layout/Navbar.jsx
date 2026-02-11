import React, { useState } from 'react';
import {
    Sun, Moon, Wallet, LogOut, RefreshCw, Zap, Globe
} from '../ui/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useWeb3 } from '../../context/Web3Context';
import ConnectWalletModal from '../Modals/ConnectWalletModal';

const Navbar = ({ activeView, setActiveView }) => {
    // Contexts Global state
    const { isDarkMode, toggleTheme } = useTheme();
    const { walletConnected, userAddress, userFullAddress, disconnectWallet } = useWeb3();

    // Local UI State
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [showWalletMenu, setShowWalletMenu] = useState(false);

    // UI Toggle for Simulation Mode (Visual parity with app.html)
    const [isLiveMode, setIsLiveMode] = useState(false);

    // Navigation Mapping (React View -> HTML Role)
    const handleNav = (view) => {
        setActiveView(view);
    };

    return (
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors duration-300">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    <div className="flex items-center gap-4">
                        <a href="#" className="flex items-center" onClick={(e) => { e.preventDefault(); handleNav('marketplace'); }}>
                            <img src="/img/MoebaLogo.png" alt="MOEBA" className="h-12 w-auto" />
                        </a>

                        <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-full ml-4">
                            <button onClick={() => setIsLiveMode(false)} className={`px-3 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1 ${!isLiveMode ? 'bg-white dark:bg-slate-600 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}><RefreshCw className="h-3 w-3" /> Simulation</button>
                            <button onClick={() => setIsLiveMode(true)} className={`px-3 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1 ${isLiveMode ? 'bg-red-500 shadow text-white' : 'text-slate-500 hover:text-slate-700'}`}><Zap className="h-3 w-3" /> Live</button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 transition-colors">
                            <button onClick={() => handleNav('marketplace')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeView === 'marketplace' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Investor</button>
                            <button onClick={() => handleNav('insurer')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeView === 'insurer' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Insurer</button>
                            <button onClick={() => handleNav('portfolio')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeView === 'portfolio' ? 'bg-white dark:bg-slate-700 shadow-sm text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Dashboard</button>
                        </div>

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                        <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => walletConnected ? setShowWalletMenu(!showWalletMenu) : setIsWalletModalOpen(true)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors border ${walletConnected ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 border-transparent'}`}
                            >
                                <Wallet className="h-4 w-4" />
                                {walletConnected ? (
                                    <span className="text-xs font-bold">{userAddress}</span>
                                ) : (
                                    <span>Connect Wallet</span>
                                )}
                            </button>

                            {walletConnected && showWalletMenu && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 flex flex-col gap-1">
                                    <a
                                        href={`https://etherscan.io/address/${userFullAddress || userAddress}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        <Globe className="h-4 w-4" /> <span>Etherscan</span>
                                    </a>
                                    <button
                                        onClick={() => { disconnectWallet(); setShowWalletMenu(false); }}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors w-full text-left"
                                    >
                                        <LogOut className="h-4 w-4" /> <span>Disconnect</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConnectWalletModal
                isOpen={isWalletModalOpen}
                onClose={() => setIsWalletModalOpen(false)}
            />
        </nav>
    );
};

export default Navbar;
