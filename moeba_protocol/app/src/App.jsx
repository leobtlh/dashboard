import { useState, useEffect } from 'react';

// --- 1. CONTEXTES GLOBAUX (Gestion d'état) ---
// Remplacent les states 'walletConnected', 'notification', 'isDarkMode' de app.html
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Web3Provider } from './context/Web3Context';
import { DataProvider } from './context/DataContext'; // Pour gérer les 'vaults' et 'requests'

// --- 2. LAYOUT & NAVIGATION ---
// Remplacent le bloc <header>, <nav> et la gestion des onglets (activeRole)
import MainLayout from './components/Layout/MainLayout';
import Navbar from './components/Layout/Navbar';

// --- 3. PAGES (VUES PRINCIPALES) ---
// Correspondent aux gros blocs conditionnels {activeRole === '...'}
import MarketplacePage from './pages/MarketplacePage';       // Vue "Investor" par défaut
import PortfolioPage from './pages/PortfolioPage';           // Vue "Dashboard" / "Active Positions"
import InsurerDashboardPage from './pages/InsurerDashboardPage'; // Vue "Insurer" + Formulaire création
import OracleDashboardPage from './pages/OracleDashboardPage';   // Vue "Oracle" (Monitoring)
import VaultDetailsPage from './pages/VaultDetailsPage';     // Vue "Selected Vault"

// --- 4. COMPOSANTS UI (Design System) ---
// Correspondent aux définitions SVG et petits composants utilitaires
import {
  Shield, Wind, Activity, Wallet, AlertTriangle, TrendingUp, Lock, Plus,
  ArrowRight, ArrowLeft, CheckCircle2, Building2, Coins, FileText, Info,
  X, LogOut, RefreshCw, Zap, UserCheck, Minimize2, LayoutGrid, List,
  ChevronDown, Search, Calendar, Globe, Sun, Moon
} from './components/ui/Icons';
import {
  RabbyIcon, ZerionIcon, MetaMaskIcon, WalletConnectIcon, SimulationIcon
} from './components/ui/WalletIcons';
import Loader from './components/ui/Loader';
import NotificationToast from './components/ui/NotificationToast';

// --- 5. COMPOSANTS MÉTIER (Business Logic Components) ---
// Extraits des blocs spécifiques de app.html
import RiskChart from './components/Charts/RiskChart';       // Le composant Recharts
import VaultCard from './components/Vaults/VaultCard';       // Les cartes de la liste
import VaultWaterfall from './components/Vaults/VaultWaterfall'; // Visualisation des tranches
import TrancheSelector from './components/Vaults/TrancheSelector'; // Sélecteur Senior/Junior

// --- 6. MODALES ---
// Correspondent aux composants "Modal" définis dans le script HTML
import ConnectWalletModal from './components/Modals/ConnectWalletModal';
import InsurerRegistrationModal from './components/Modals/InsurerRegistrationModal';
import InvestorKYCModal from './components/Modals/InvestorKYCModal';

// --- 7. UTILS & HELPERS (Logique pure) ---
// Correspondent aux fonctions JS isolées (calculatePayout, formatDate, etc.)
import {
  calculateClaimStats,
  getTrancheAprs,
  calculatePayoutDetails,
  updateJunior
} from './utils/finance';
import {
  formatCurrency,
  parseAppDate,
  calculateDaysRemaining,
  isValidDayInMonth
} from './utils/formatting';
import {
  generateMockHistory
} from './utils/generators';

// --- 8. CONSTANTES & CONFIGURATION ---
// Correspondent aux constantes définies en haut du script HTML
import {
  INITIAL_VAULTS,
  MONTHS,
  AVAILABLE_CHAINS,
  AVAILABLE_ASSETS,
  CHAIN_LOGOS,
  TOKEN_MAP
} from './constants/mocks';
import {
  FACTORY_ADDRESS_LIVE,
  FACTORY_ABI_EXTENDED,
  ERC20_ABI
} from './constants/abis';


function App() {
  // --- STATE DE NAVIGATION INTERNE ---
  // Sert uniquement à switcher entre les grandes "Pages" importées ci-dessus
  const [activeView, setActiveView] = useState('marketplace'); // 'marketplace', 'portfolio', 'insurer', 'oracle', 'details'
  const [selectedVaultId, setSelectedVaultId] = useState(null);

  /**
   * Fonction pour naviguer vers les détails d'un Vault
   * Cette fonction sera passée en prop aux pages Marketplace et Portfolio
   */
  const handleNavigateToVault = (vaultId) => {
    setSelectedVaultId(vaultId);
    setActiveView('details');
  };

  return (
    // Les Providers enveloppent l'application pour rendre les données accessibles partout
    <ThemeProvider>
      <ToastProvider>
        <Web3Provider>
          <DataProvider>

            <MainLayout
              activeView={activeView}
              setActiveView={setActiveView}
            >

              {/* ROUTING SIMPLE (Switch) */}
              {activeView === 'marketplace' && (
                <MarketplacePage onVaultSelect={handleNavigateToVault} />
              )}

              {activeView === 'portfolio' && (
                <PortfolioPage onVaultSelect={handleNavigateToVault} />
              )}

              {activeView === 'insurer' && (
                <InsurerDashboardPage />
              )}

              {activeView === 'oracle' && (
                <OracleDashboardPage />
              )}

              {activeView === 'details' && selectedVaultId && (
                <VaultDetailsPage
                  vaultId={selectedVaultId}
                  onBack={() => setActiveView('marketplace')}
                />
              )}

            </MainLayout>

            {/* Les modales sont souvent gérées via un Context,
                mais peuvent être placées ici si gérées localement */}
            {/* <ConnectWalletModal /> */}
            {/* <InsurerRegistrationModal /> */}
            {/* <InvestorKYCModal /> */}

          </DataProvider>
        </Web3Provider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
