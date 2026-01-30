import React from 'react';

const TrancheSelector = ({ trancheType, setTrancheType, seniorApr, juniorApr }) => {
    return (
        <div className="mb-6 grid grid-cols-2 gap-3">
            <label className="cursor-pointer">
                <input
                    type="radio"
                    name="tranche"
                    value="senior"
                    checked={trancheType === 'senior'}
                    onChange={() => setTrancheType('senior')}
                    className="hidden peer"
                />
                <div className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 text-center transition-all h-full flex flex-col justify-center">
                    <div className="font-bold text-slate-700 dark:text-slate-200">Senior</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">APR {seniorApr.toFixed(2)}%</div>
                    <div className="text-[10px] text-green-600 mt-1 font-medium">Payment Priority</div>
                </div>
            </label>

            <label className="cursor-pointer">
                <input
                    type="radio"
                    name="tranche"
                    value="junior"
                    checked={trancheType === 'junior'}
                    onChange={() => setTrancheType('junior')}
                    className="hidden peer"
                />
                <div className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 dark:peer-checked:bg-indigo-900/20 text-center transition-all h-full flex flex-col justify-center">
                    <div className="font-bold text-slate-700 dark:text-slate-200">Junior</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">APR {juniorApr.toFixed(2)}%</div>
                    <div className="text-[10px] text-orange-500 mt-1 font-medium">Boost Yield</div>
                </div>
            </label>
        </div>
    );
};

export default TrancheSelector;
