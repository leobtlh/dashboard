import { parseAppDate } from './formatting';

// Calcul Cascade de Perte (Waterfall)
export const calculateClaimStats = (vault) => {
    const claimNeeded = vault.claimAmount || vault.totalCapacity; // Total Loss
    const insurerCover = vault.juniorCapital; // First Loss (Assurance)

    // 1. Insurer pays first (First Loss)
    const insurerLoss = Math.min(claimNeeded, insurerCover);
    let remainingLoss = Math.max(0, claimNeeded - insurerLoss);

    // 2. Junior Investors pay second
    const juniorPool = vault.totalJuniorDeposits || 0;
    const juniorLoss = Math.min(remainingLoss, juniorPool);
    remainingLoss = Math.max(0, remainingLoss - juniorLoss);

    // Ratio de récupération Junior (Si pool > 0)
    const juniorRecoveryRatio = juniorPool > 0 ? (juniorPool - juniorLoss) / juniorPool : 0;

    // 3. Senior Investors pay last
    const seniorPool = vault.totalSeniorDeposits || 0;
    const seniorLoss = Math.min(remainingLoss, seniorPool);
    // remainingLoss after senior is uncovered loss (Catastrophe exceed capacity)

    // Ratio de récupération Senior
    const seniorRecoveryRatio = seniorPool > 0 ? (seniorPool - seniorLoss) / seniorPool : 0;

    return { juniorRecoveryRatio, seniorRecoveryRatio };
};

// Calcul des APRs dynamiques par Tranche
export const getTrancheAprs = (vault) => {
    const baseApr = parseFloat(vault.apr || 0);

    // Senior est protégé et reçoit moins (ex: 70% du rendement de base)
    const seniorApr = baseApr * 0.7;

    const senCap = vault.totalSeniorDeposits || 0;
    // Junior prend le risque First Loss et absorbe le reste du rendement
    const junCap = vault.totalJuniorDeposits > 0 ? vault.totalJuniorDeposits : (vault.juniorCapital || 1);

    const totalInvested = senCap + junCap;
    const totalYield = totalInvested * (baseApr / 100);
    const seniorCost = senCap * (seniorApr / 100);

    // Rendement restant pour Junior
    let juniorApr = ((totalYield - seniorCost) / junCap) * 100;

    // Fallback si vide
    if (senCap === 0 && vault.totalJuniorDeposits === 0) {
        juniorApr = baseApr;
    }

    return { seniorApr, juniorApr: Math.max(0, juniorApr) };
};

// Calcul complet du Payout (Retrait)
export const calculatePayoutDetails = (vault, userAddress) => {
    // 1. Récupérer les APRs actuels
    const { seniorApr, juniorApr } = getTrancheAprs(vault);

    // 2. Récupérer les balances utilisateur
    const userJunior = vault.balancesJunior ? (vault.balancesJunior[userAddress] || 0) : 0;
    const userSenior = vault.balancesSenior ? (vault.balancesSenior[userAddress] || 0) : 0;

    // 3. Calcul durée (Année fractionnelle)
    const start = parseAppDate(vault.startDate) || new Date();
    const end = parseAppDate(vault.maturityDate) || new Date();
    const diffTime = Math.max(0, Math.abs(end - start));
    const durationYear = diffTime / (1000 * 60 * 60 * 24 * 365);

    // 4. Calcul du Rendement (YIELD)
    const juniorYield = userJunior * (juniorApr / 100) * durationYear;
    const seniorYield = userSenior * (seniorApr / 100) * durationYear;
    const totalYield = juniorYield + seniorYield;

    // 5. Calcul du Principal (Capital) après pertes éventuelles
    let principalRecoveredJunior = userJunior;
    let principalRecoveredSenior = userSenior;
    let totalLoss = 0;

    if (vault.status === 'TRIGGERED') {
        const { juniorRecoveryRatio, seniorRecoveryRatio } = calculateClaimStats(vault);
        principalRecoveredJunior = userJunior * juniorRecoveryRatio;
        principalRecoveredSenior = userSenior * seniorRecoveryRatio;
        totalLoss = (userJunior - principalRecoveredJunior) + (userSenior - principalRecoveredSenior);
    }

    const principalRecovered = principalRecoveredJunior + principalRecoveredSenior;
    const totalPayout = principalRecovered + totalYield;

    return { principalRecovered, yieldPayout: totalYield, loss: totalLoss, totalPayout };
};

// Helper pour formulaire création
export const updateJunior = (cap, percent) => {
    const calculatedJunior = (parseFloat(cap || 0) * parseFloat(percent || 0)) / 100;
    return calculatedJunior;
};
