import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const RiskChart = ({ data, triggers }) => {
    // État local pour gérer les lignes affichées (comme dans le HTML)
    const [activeTriggers, setActiveTriggers] = useState([]);

    if (!data || data.length === 0) {
        return <div className="p-4 text-slate-500 text-center text-sm">No historical data available.</div>;
    }

    const toggleTrigger = (triggerId) => {
        if (activeTriggers.includes(triggerId)) {
            setActiveTriggers(activeTriggers.filter(id => id !== triggerId));
        } else {
            setActiveTriggers([...activeTriggers, triggerId]);
        }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Contrôles (Checkboxes) */}
            <div className="flex flex-wrap items-center gap-4 mb-2">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Risk Probability (%)</span>
                </div>
                {triggers && triggers.map(trigger => (
                    <label
                        key={trigger.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 select-none"
                    >
                        <input
                            type="checkbox"
                            checked={activeTriggers.includes(trigger.id)}
                            onChange={() => toggleTrigger(trigger.id)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 dark:bg-slate-900 cursor-pointer"
                        />
                        <span
                            className="text-sm text-slate-600 dark:text-slate-400 font-medium"
                            style={{ color: activeTriggers.includes(trigger.id) ? trigger.color : undefined }}
                        >
                            {trigger.name} ({trigger.unit})
                        </span>
                    </label>
                ))}
            </div>

            {/* Graphique Recharts */}
            <div className="h-[300px] w-full bg-slate-50 dark:bg-slate-900/30 rounded-xl p-2 border border-slate-100 dark:border-slate-700">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:opacity-10" />

                        <XAxis
                            dataKey="date"
                            tick={{fontSize: 12, fill: '#94a3b8'}}
                            axisLine={false}
                            tickLine={false}
                        />

                        {/* Axe Y Gauche (Risque %) */}
                        <YAxis
                            yAxisId="left"
                            tick={{fontSize: 12, fill: '#f97316'}}
                            axisLine={false}
                            tickLine={false}
                            unit="%"
                            domain={[0, 100]}
                        />

                        {/* Axe Y Droit (Valeurs Trigger) */}
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{fontSize: 12, fill: '#64748b'}}
                            axisLine={false}
                            tickLine={false}
                            hide={activeTriggers.length === 0}
                        />

                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                color: '#0f172a'
                            }}
                            labelStyle={{ color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}
                        />

                        <Legend wrapperStyle={{ paddingTop: '10px' }}/>

                        {/* Ligne Principale : Risque */}
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="risk"
                            name="Claim Probability"
                            stroke="#f97316"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />

                        {/* Lignes Dynamiques : Triggers */}
                        {triggers && triggers.map(trigger => (
                            activeTriggers.includes(trigger.id) && (
                                <Line
                                    key={trigger.id}
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey={trigger.id}
                                    name={`${trigger.name} (${trigger.unit})`}
                                    stroke={trigger.color}
                                    strokeWidth={2}
                                    dot={false}
                                    strokeDasharray="5 5"
                                />
                            )
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RiskChart;
