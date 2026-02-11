import React from 'react';
import { LayoutGrid } from '../ui/Icons';

const VaultWaterfall = () => {
    return (
        <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden h-full">
            <h3 className="font-bold mb-4 flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-blue-400" /> Waterfall Structure
            </h3>
            <div className="space-y-2 relative z-10">
                <div className="p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
                    <div className="flex justify-between text-xs mb-1 opacity-70">
                        <span>1. First Loss</span>
                        <span>Insurer</span>
                    </div>
                    <div className="font-bold">Insurer Capital (Junior)</div>
                </div>
                <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30 text-amber-200">
                    <div className="flex justify-between text-xs mb-1 opacity-70">
                        <span>2. Junior Tranche</span>
                        <span>High Yield</span>
                    </div>
                    <div className="font-bold">Speculative Capital</div>
                </div>
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/50">
                    <div className="flex justify-between text-xs mb-1 opacity-70">
                        <span>3. Senior Tranche</span>
                        <span>Secured</span>
                    </div>
                    <div className="font-bold">Your Investment</div>
                </div>
            </div>
        </div>
    );
};

export default VaultWaterfall;
