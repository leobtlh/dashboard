// Version "No-Build" compatible navigateur
// Pas d'imports externes, tout est inclus ici.

const { useState, useEffect } = React;

// --- COMPOSANTS ICONS (SVG Directs pour éviter les imports Lucide) ---
const IconWrapper = ({ children, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

const Shield = ({ className }) => <IconWrapper className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></IconWrapper>;
const Wind = ({ className }) => <IconWrapper className={className}><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></IconWrapper>;
const Activity = ({ className }) => <IconWrapper className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></IconWrapper>;
const Wallet = ({ className }) => <IconWrapper className={className}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></IconWrapper>;
const AlertTriangle = ({ className }) => <IconWrapper className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></IconWrapper>;
const TrendingUp = ({ className }) => <IconWrapper className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></IconWrapper>;
const Lock = ({ className }) => <IconWrapper className={className}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></IconWrapper>;
const Plus = ({ className }) => <IconWrapper className={className}><path d="M5 12h14"/><path d="M12 5v14"/></IconWrapper>;
const ArrowRight = ({ className }) => <IconWrapper className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></IconWrapper>;
const CheckCircle2 = ({ className }) => <IconWrapper className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></IconWrapper>;
const Building2 = ({ className }) => <IconWrapper className={className}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></IconWrapper>;

// --- DONNÉES MOCK ---
const INITIAL_VAULTS = [
  {
    id: "0x742...d439",
    name: "Florida Wind Season 2026",
    insurer: "State Farm Re",
    totalCapacity: 40000000,
    currentAssets: 4330000,
    juniorCapital: 4000000,
    premium: 330000,
    maturityDate: "18 Jan 2026",
    apy: 25.4,
    status: "OPEN",
    userBalance: 0,
    triggerValue: 250
  },
  {
    id: "0x891...a122",
    name: "Tokyo Earthquake Bond",
    insurer: "Japan Post Insurance",
    totalCapacity: 100000000,
    currentAssets: 0,
    juniorCapital: 10000000,
    premium: 0,
    maturityDate: "En attente",
    apy: 0,
    status: "PENDING",
    userBalance: 0,
    triggerValue: 7.5
  }
];

// --- APP COMPONENT ---
function App() {
  const [activeRole, setActiveRole] = useState('investor');
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [vaults, setVaults] = useState(INITIAL_VAULTS);
  const [selectedVault, setSelectedVault] = useState(null);

  const [depositAmount, setDepositAmount] = useState('');
  const [newVaultData, setNewVaultData] = useState({
    name: '',
    cap: 40000000,
    coverage: 20000000,
    duration: 30,
    junior: 4000000,
    premium: 330000
  });

  const connectWallet = () => {
    setWalletConnected(true);
    setUserAddress('0x71C...9A23');
  };

  const handleCreateVault = (e) => {
    e.preventDefault();
    const newVault = {
      id: `0x${Math.floor(Math.random()*10000)}...new`,
      name: newVaultData.name || "Nouveau Cat Bond",
      insurer: "Moi (Assureur)",
      totalCapacity: parseInt(newVaultData.cap),
      currentAssets: 0,
      juniorCapital: parseInt(newVaultData.junior),
      premium: 0,
      maturityDate: "En attente",
      apy: 0,
      status: "PENDING",
      userBalance: 0,
      triggerValue: 0
    };
    setVaults([...vaults, newVault]);
    alert("Smart Contract déployé avec succès via HPIVFactory !");
    setNewVaultData({...newVaultData, name: ''});
  };

  const handleInitializeVault = (vaultId) => {
    const updatedVaults = vaults.map(v => {
      if (v.id === vaultId) {
        return {
          ...v,
          status: "OPEN",
          premium: newVaultData.premium,
          currentAssets: v.juniorCapital + newVaultData.premium,
          apy: ((newVaultData.premium * 100 * 365) / ((v.totalCapacity - v.juniorCapital) * 30)).toFixed(2),
          maturityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
        };
      }
      return v;
    });
    setVaults(updatedVaults);
    alert(`Vault ${vaultId} initialisé ! Capital Junior et Prime transférés.`);
  };

  const handleDeposit = () => {
    if (!selectedVault || !depositAmount) return;

    const amount = parseFloat(depositAmount);
    const updatedVaults = vaults.map(v => {
      if (v.id === selectedVault.id) {
        return {
          ...v,
          currentAssets: v.currentAssets + amount,
          userBalance: v.userBalance + amount
        };
      }
      return v;
    });
    setVaults(updatedVaults);
    alert(`Dépôt de ${formatCurrency(amount)} confirmé sur la blockchain !`);
    setDepositAmount('');
    setSelectedVault(null);
  };

  const handleTriggerOracle = (vaultId) => {
    const updatedVaults = vaults.map(v => {
      if (v.id === vaultId) {
        return { ...v, status: "TRIGGERED" };
      }
      return v;
    });
    setVaults(updatedVaults);
    alert("⚠️ ORACLE ALERT : Catastrophe validée. Soft Default activé.");
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans animate-fade-in">

      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-lg text-white">
                <Shield className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
                HPIV Protocol
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveRole('investor')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeRole === 'investor' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Investisseur
                </button>
                <button
                  onClick={() => setActiveRole('insurer')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeRole === 'insurer' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Assureur
                </button>
                <button
                  onClick={() => setActiveRole('oracle')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeRole === 'oracle' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Oracle
                </button>
              </div>

              <button
                onClick={connectWallet}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors border ${walletConnected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-900 text-white hover:bg-slate-800 border-transparent'}`}
              >
                <Wallet className="h-4 w-4" />
                {walletConnected ? userAddress : "Connecter Wallet"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* STATS GLOBALES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Value Locked (TVL)</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">$44.3M</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full">
              <TrendingUp className="h-3 w-3 mr-1" /> +2.4% this week
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Rendement Moyen (APY)</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">18.5%</h3>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-500">
              Boosté par les primes d'assurance
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Capital Sécurisé</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">100%</h3>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl">
                <Lock className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-500">
              Modèle Fully Funded (VUSA)
            </div>
          </div>
        </div>

        {/* --- VUE INVESTISSEUR --- */}
        {activeRole === 'investor' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Opportunités de Vaults</h2>
                <p className="text-slate-500 mt-1">Investissez dans des risques paramétriques sécurisés par la blockchain.</p>
              </div>
              <div className="text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-full flex items-center gap-2">
                <Shield className="h-4 w-4" /> Audité & Régulé
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {vaults.map((vault) => (
                <div key={vault.id} className={`group relative bg-white rounded-2xl border transition-all ${vault.status === 'TRIGGERED' ? 'border-red-200 bg-red-50/50' : 'border-slate-200 hover:border-blue-300 hover:shadow-lg'}`}>
                  {/* Badge Status */}
                  <div className="absolute top-6 right-6">
                    {vault.status === 'OPEN' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> OPEN</span>}
                    {vault.status === 'PENDING' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 flex items-center gap-1"><Activity className="h-3 w-3" /> PENDING</span>}
                    {vault.status === 'TRIGGERED' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> CATASTROPHE</span>}
                  </div>

                  <div className="p-8">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{vault.name}</h3>
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                        <Building2 className="h-3 w-3" /> Assureur: {vault.insurer}
                      </p>
                    </div>

                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Rendement (APY)</p>
                        <p className={`text-4xl font-bold ${vault.status === 'OPEN' ? 'text-green-600' : 'text-slate-400'}`}>
                          {vault.apy}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500 mb-1">Levée de Fonds</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {formatCurrency(vault.currentAssets)} <span className="text-slate-400 text-sm font-normal">/ {formatCurrency(vault.totalCapacity)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${vault.status === 'TRIGGERED' ? 'bg-red-500' : 'bg-blue-600'}`}
                        style={{ width: `${(vault.currentAssets / vault.totalCapacity) * 100}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Protection Junior</p>
                        <p className="font-semibold text-slate-900">{formatCurrency(vault.juniorCapital)}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Maturité</p>
                        <p className="font-semibold text-slate-900">{vault.maturityDate}</p>
                      </div>
                    </div>

                    {vault.status === 'OPEN' ? (
                      <button
                        onClick={() => setSelectedVault(vault)}
                        className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-medium hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
                      >
                        Investir Maintenant <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button disabled className="w-full bg-slate-100 text-slate-400 py-3.5 rounded-xl font-medium cursor-not-allowed">
                        {vault.status === 'PENDING' ? 'En attente d\'ouverture' : 'Investissements Fermés'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* MODALE DE DÉPÔT */}
            {selectedVault && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
                <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl transform transition-all scale-100">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-slate-900">Investir</h3>
                    <button onClick={() => setSelectedVault(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                    <div className="flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-blue-600 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-blue-900 mb-1">Profil de Risque</p>
                        <p className="text-xs text-blue-700 leading-relaxed">
                          En investissant dans {selectedVault.name}, vous acceptez le risque de perte partielle (~45%) en cas de catastrophe. En contrepartie, vous visez un rendement de {selectedVault.apy}%.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Montant à déposer (USDC)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full pl-4 pr-16 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium text-lg"
                          placeholder="0.00"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">USDC</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500 px-1">
                      <span>Solde disponible:</span>
                      <span>50,000.00 USDC</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedVault(null)}
                      className="flex-1 px-4 py-3.5 border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleDeposit}
                      className="flex-[2] bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                    >
                      Confirmer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- VUE ASSUREUR --- */}
        {activeRole === 'insurer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            {/* Sidebar création */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Nouveau Vault</h2>
                    <p className="text-xs text-slate-500">Déploiement Factory</p>
                  </div>
                </div>

                <form onSubmit={handleCreateVault} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nom du Risque</label>
                    <input
                      type="text"
                      value={newVaultData.name}
                      onChange={e => setNewVaultData({...newVaultData, name: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Ex: Florida Wind 2026"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Capacité (USDC)</label>
                      <input
                        type="number"
                        value={newVaultData.cap}
                        onChange={e => setNewVaultData({...newVaultData, cap: e.target.value})}
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Junior (10%)</label>
                      <input
                        type="number"
                        value={newVaultData.junior}
                        readOnly
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Prime à Payer (Yield Boost)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={newVaultData.premium}
                        onChange={e => setNewVaultData({...newVaultData, premium: e.target.value})}
                        className="w-full p-3 pl-3 pr-16 border border-green-200 bg-green-50/30 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-green-800 font-medium"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 text-xs font-bold">USDC</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Montant versé immédiatement pour booster l'APY des investisseurs.
                    </p>
                  </div>

                  <button type="submit" className="w-full mt-4 bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                    Déployer le Contrat
                  </button>
                </form>
              </div>

              {/* Status Card */}
              <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 opacity-80" />
                  <h3 className="font-bold">Espace VUSA</h3>
                </div>
                <p className="text-indigo-100 text-sm mb-4 leading-relaxed">
                  Votre statut d'assureur est vérifié (Whitelist). Vos fonds Junior Tranche sont verrouillés en "First Loss" jusqu'à maturité.
                </p>
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="opacity-70">STATUS</span>
                    <span className="text-green-300">VERIFIED</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="opacity-70">ENTITY</span>
                    <span>State Farm Re</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content Assureur */}
            <div className="lg:col-span-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Vos Vaults Gérés</h3>

              <div className="space-y-4">
                {vaults.map((vault) => (
                  <div key={vault.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-slate-900">{vault.name}</h4>
                        {vault.status === 'PENDING' && <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md">PENDING</span>}
                        {vault.status === 'OPEN' && <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">ACTIVE</span>}
                      </div>
                      <div className="flex gap-6 text-sm text-slate-500">
                        <span>Capacité: <strong>{formatCurrency(vault.totalCapacity)}</strong></span>
                        <span>Junior: <strong>{formatCurrency(vault.juniorCapital)}</strong></span>
                      </div>
                    </div>

                    {vault.status === 'PENDING' ? (
                      <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                        <div className="text-right">
                          <p className="text-xs text-slate-500 mb-1">Total à financer (Junior + Prime)</p>
                          <p className="font-bold text-slate-900">{formatCurrency(vault.juniorCapital + vault.premium)}</p>
                        </div>
                        <button
                          onClick={() => handleInitializeVault(vault.id)}
                          className="w-full md:w-auto px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                        >
                          Financer & Ouvrir
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Fonds levés</p>
                          <p className="font-bold text-slate-700">{formatCurrency(vault.currentAssets)}</p>
                        </div>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">APY Public</p>
                          <p className="font-bold text-green-600">{vault.apy}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- VUE ORACLE --- */}
        {activeRole === 'oracle' && (
          <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                <Wind className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Oracle Dashboard</h2>
              <p className="text-slate-500 mt-2">Interface de surveillance des triggers paramétriques</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Flux de Données en Temps Réel
                </h3>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {vaults.filter(v => v.status === 'OPEN').map(vault => (
                  <div key={vault.id} className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-xl font-bold text-slate-900">{vault.name}</h4>
                        <p className="text-xs font-mono text-slate-400 mt-1">{vault.id}</p>
                      </div>
                      <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600 border border-slate-200">
                        MONITORING ACTIVE
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Seuil de Déclenchement</p>
                        <p className="text-2xl font-mono font-bold text-slate-900">
                          {vault.triggerValue} <span className="text-sm font-sans font-normal text-slate-500">unités</span>
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border-2 border-green-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                          <Activity className="h-16 w-16 text-green-600" />
                        </div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Donnée Capteur (Live)</p>
                        <p className="text-2xl font-mono font-bold text-green-600">
                          {Math.floor(vault.triggerValue * 0.2)} <span className="text-sm font-sans font-normal text-slate-400">/ {vault.triggerValue}</span>
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                      <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                        <div className="p-2 bg-white rounded-full border border-red-100 shadow-sm">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-red-900">Zone de Test (Simulation)</p>
                          <p className="text-xs text-red-700">
                            Simuler une catastrophe envoie une transaction `triggerCatastrophe()` au Smart Contract.
                          </p>
                        </div>
                        <button
                          onClick={() => handleTriggerOracle(vault.id)}
                          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-red-200 transition-all active:scale-95"
                        >
                          SIMULER CRASH
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {vaults.filter(v => v.status === 'OPEN').length === 0 && (
                  <div className="p-12 text-center">
                    <p className="text-slate-400 mb-2">Aucun vault actif à surveiller.</p>
                    <button onClick={() => setActiveRole('insurer')} className="text-blue-600 hover:underline text-sm">
                      Créer un vault en tant qu'assureur
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// Initialisation React 18
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
