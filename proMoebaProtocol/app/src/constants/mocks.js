export const AVAILABLE_CHAINS = ['Base', 'Ethereum', 'Polygon', 'Arbitrum', 'Optimism'];
export const AVAILABLE_ASSETS = ['USDC', 'USDT', 'DAI', 'WETH'];

export const CHAIN_LOGOS = {
    'Base': 'https://avatars.githubusercontent.com/u/108554348?s=200&v=4',
    'Ethereum': 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=026',
    'Polygon': 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=026',
    'Arbitrum': 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=026',
    'Optimism': 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg?v=026'
};

export const TOKEN_MAP = {
    'Ethereum': {
        'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    },
    'Base': {
        'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        'WETH': '0x4200000000000000000000000000000000000006'
    },
    'Polygon': {
        'USDC': '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
        'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
    },
    'Arbitrum': {
        'USDC': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
    }
};

export const MONTHS = [
    { name: 'January', days: 31 }, { name: 'February', days: 29 }, { name: 'March', days: 31 },
    { name: 'April', days: 30 }, { name: 'May', days: 31 }, { name: 'June', days: 30 },
    { name: 'July', days: 31 }, { name: 'August', days: 31 }, { name: 'September', days: 30 },
    { name: 'October', days: 31 }, { name: 'November', days: 30 }, { name: 'December', days: 31 }
];

export const INITIAL_VAULTS = [
    {
        id: '0x8f2a...e12b',
        name: 'Atlantic Hurricane 2025',
        description: 'Parametric coverage against category 4+ hurricanes in Florida. Triggered if wind speed exceeds 210 km/h at NOAA certified stations.',
        insurer: 'Axa Climate',
        insurerAddress: '0x123...', // Placeholder
        totalCapacity: 10000000,
        claimAmount: 10000000,
        currentAssets: 10000000,
        juniorCapital: 1000000,
        premium: 800000,
        startDate: '01 January 2025',
        maturityDate: '31 December 2025',
        apr: '12.50',
        riskProb: '5.2',
        status: 'MATURED',
        chain: 'Ethereum',
        asset: 'USDC',
        userBalance: 5000,
        balances: { '0x...': 5000 },
        balancesJunior: {},
        balancesSenior: { '0x...': 5000 },
        totalJuniorDeposits: 0,
        totalSeniorDeposits: 8200000,
        triggerValue: 210,
        triggers: [
            { id: 'windSpeed', name: 'Wind', unit: 'km/h', color: '#8884d8' }
        ],
        history: [
            { date: '01/08', risk: 10, windSpeed: 45 },
            { date: '15/09', risk: 45, windSpeed: 160 },
            { date: '30/10', risk: 5, windSpeed: 60 }
        ]
    },
    {
        id: '0x3c4d...9a12',
        name: 'California Quake 2026',
        description: 'Protection against earthquakes > 7.0 Richter in Southern California. USGS Oracle with Chainlink redundancy. Subscription period open.',
        insurer: 'Munich Re',
        insurerAddress: '0x456...', // Placeholder
        totalCapacity: 5000000,
        claimAmount: 5000000,
        currentAssets: 1500000,
        juniorCapital: 500000,
        premium: 450000,
        startDate: '01 January 2026',
        maturityDate: '31 March 2026',
        apr: '8.75',
        riskProb: '3.1',
        status: 'OPEN',
        chain: 'Base',
        asset: 'USDC',
        userBalance: 0,
        balances: {},
        balancesJunior: {},
        balancesSenior: {},
        totalJuniorDeposits: 0,
        totalSeniorDeposits: 550000,
        triggerValue: 7.0,
        triggers: [
            { id: 'magnitude', name: 'Magnitude', unit: 'R', color: '#82ca9d' }
        ],
        history: [
            { date: '01/01', risk: 1.5, magnitude: 2.1 },
            { date: '05/01', risk: 1.8, magnitude: 2.4 },
            { date: '10/01', risk: 1.2, magnitude: 1.9 }
        ]
    }
];
