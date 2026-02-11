export const generateMockHistory = (type) => {
    const data = [];
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStr = date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });
        let risk, trigger1;

        if (type === 'WIND') {
            risk = Math.min(99, Math.max(0, 5 + (i * 0.2) + (Math.random() * 10 - 5)));
            trigger1 = Math.min(300, Math.max(0, 50 + (i * 1.5) + (Math.random() * 80 - 20)));
            data.push({ date: dayStr, risk: risk.toFixed(1), windSpeed: trigger1.toFixed(0) });
        } else {
            risk = Math.min(99, Math.max(0, 2 + (Math.random() * 5)));
            if (i === 5) risk = 45;
            trigger1 = Math.max(0, (Math.random() * 4).toFixed(1));
            if (i === 5) trigger1 = 6.8;
            data.push({ date: dayStr, risk: risk.toFixed(1), magnitude: trigger1 });
        }
    }
    return data;
};
