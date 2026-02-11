import { MONTHS } from '../constants/mocks';

// Standard anglais pour le formatage monétaire (USDC)
export const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(val);
};

// Parser les dates (standard anglais textuel ex: "01 January 2025")
export const parseAppDate = (dateStr) => {
    if (!dateStr || dateStr === "Pending" || dateStr === "En attente") return null;
    const parsedDate = new Date(dateStr);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
};

// Calcul des jours restants avant maturité
export const calculateDaysRemaining = (dateStr) => {
    const targetDate = parseAppDate(dateStr);
    if (!targetDate) return 0;
    const today = new Date();
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
};

// Validation jours dans mois (pour formulaire)
export const isValidDayInMonth = (day, monthName, year) => {
    const mIndex = MONTHS.findIndex(m => m.name === monthName);
    if (mIndex === -1) return false;
    const daysInMonth = new Date(year, mIndex + 1, 0).getDate();
    return day > 0 && day <= daysInMonth;
};

// Récupérer le nombre de jours max d'un mois donné
export const getMaxDays = (monthName) => {
    const m = MONTHS.find(mo => mo.name === monthName);
    return m ? m.days : 31;
};
