import React from 'react';
import Navbar from './Navbar';

const MainLayout = ({ children, activeView, setActiveView }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans text-slate-900 dark:text-slate-100">
            {/* Navbar gère la navigation haute */}
            <Navbar activeView={activeView} setActiveView={setActiveView} />

            {/* Contenu Principal */}
            <main className="max-w-[89%] mx-auto px-6 py-10">
                {children}
            </main>

            {/* Footer Simple (optionnel mais recommandé pour fermer le layout) */}
            <footer className="max-w-7xl mx-auto px-6 py-8 text-center text-slate-400 dark:text-slate-600 text-sm">
                <p>© 2025 Mœba Protocol. Decentralized Insurance Infrastructure.</p>
            </footer>
        </div>
    );
};

export default MainLayout;
