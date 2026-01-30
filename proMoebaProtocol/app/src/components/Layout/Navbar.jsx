import React, { useState } from 'react';
import {
    Sun, Moon, Wallet, LogOut, ChevronDown, UserCheck
} from '../ui/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useWeb3 } from '../../context/Web3Context';
import ConnectWalletModal from '../Modals/ConnectWalletModal';

const Navbar = ({ activeView, setActiveView }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { walletConnected, userAddress, userBalance, disconnectWallet } = useWeb3();
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Items de navigation
    const navItems = [
        { id: 'marketplace', label: 'Marketplace' },
        { id: 'portfolio', label: 'My Portfolio' },
        { id: 'insurer', label: 'Insurer Dashboard' },
        { id: 'oracle', label: 'Oracle Status' },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                {/* LOGO IMAGE (Chargé depuis public/img/) */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('marketplace')}>
                    <img
                        src="/img/MoebaLogo.png"
                        alt="Mœba Protocol Logo"
                        className="w-10 h-10 object-contain"
                    />
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                        Mœba
                    </span>
                </div>

                {/* NAVIGATION CENTRALE */}
                <nav className="hidden md:flex bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                                activeView === item.id
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* ACTIONS DROITE (Theme & Wallet) */}
                <div className="flex items-center gap-4">
                    {/* Switch Theme */}
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Toggle Theme"
                    >
                        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>

                    {/* Wallet Section */}
                    {walletConnected ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-3 pl-3 pr-2 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-300 dark:hover:border-slate-600 group"
                            >
                                <div className="flex flex-col items-end mr-1">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">{userBalance} ETH</span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{userAddress}</span>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-md">
                                    <Wallet className="h-4 w-4" />
                                </div>
                                <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                            </button>

                            {/* Dropdown Menu */}
                            {showUserMenu && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden py-1 animate-slide-up">
                                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Connected as</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{userAddress}</p>
                                    </div>
                                    <button className="w-full text-left px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                        <UserCheck className="h-4 w-4" /> KYC Status: Verified
                                    </button>
                                    <button
                                        onClick={() => { disconnectWallet(); setShowUserMenu(false); }}
                                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                    >
                                        <LogOut className="h-4 w-4" /> Disconnect
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsWalletModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <Wallet className="h-5 w-5" />
                            Connect Wallet
                        </button>
                    )}
                </div>
            </div>

            {/* Modale de connexion */}
            <ConnectWalletModal
                isOpen={isWalletModalOpen}
                onClose={() => setIsWalletModalOpen(false)}
            />
        </header>
    );
};

export default Navbar;
