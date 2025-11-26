import { useState } from 'react'
import { WalletConnect } from './components/WalletConnect'
import { WalletPanel } from './components/WalletPanel'
import { GraphDataDisplay } from './components/GraphDataDisplay'
import { NetworkSwitch } from './components/NetworkSwitch'
import { DataLoggerPanel } from './components/DataLoggerPanel'
import { TokenTransfer } from './components/TokenTransfer'
import { TransactionHistory } from './components/TransactionHistory'
import { SubgraphGuide } from './components/SubgraphGuide'
import { Wallet, Activity, Zap, FileText, Coins, History, BookOpen } from 'lucide-react'

type TabId = 'overview' | 'datalogger' | 'token' | 'history' | 'subgraph'

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'datalogger', label: 'DataLogger', icon: FileText },
    { id: 'token', label: 'Token Transfer', icon: Coins },
    { id: 'history', label: 'History', icon: History },
    { id: 'subgraph', label: 'Subgraph', icon: BookOpen },
  ] as const

  return (
    <div className="min-h-screen flex">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Wallet size={32} className="text-neon-blue" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-neon">
                    Cyber Wallet
                  </h1>
                  <p className="text-xs text-gray-500">
                    Powered by wagmi & The Graph
                  </p>
                </div>
              </div>

              {/* Wallet Connect */}
              <WalletConnect />
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-800 bg-gray-900/30">
          <div className="container mx-auto px-6">
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-3 font-semibold whitespace-nowrap transition-all duration-300 border-b-2 ${
                    activeTab === id
                      ? 'border-neon-blue text-neon-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {activeTab === 'overview' && (
              <>
                {/* Hero Section */}
                <div className="mb-8">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neon-blue/20 via-neon-purple/20 to-neon-pink/20 border border-neon-blue/30 p-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/10 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-neon-purple/10 rounded-full blur-3xl animate-pulse-slow animation-delay-200" />

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <Zap size={28} className="text-neon-blue" />
                        <h2 className="text-3xl font-bold text-white">
                          Welcome to the Future of DeFi
                        </h2>
                      </div>
                      <p className="text-gray-300 text-lg max-w-2xl">
                        Connect your wallet, interact with smart contracts, transfer tokens,
                        and query blockchain data using The Graph.
                      </p>
                      <div className="flex items-center gap-6 mt-6">
                        <div className="flex items-center gap-2">
                          <Activity size={20} className="text-neon-green" />
                          <span className="text-sm text-gray-400">Real-time Events</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                          <span className="text-sm text-gray-400">Secure & Fast</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wallet size={20} className="text-neon-blue" />
                          <span className="text-sm text-gray-400">Multi-Chain Support</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <NetworkSwitch />
                  <GraphDataDisplay />
                </div>

                {/* Features Section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card-glow rounded-lg p-6">
                    <div className="w-12 h-12 bg-neon-blue/10 rounded-lg flex items-center justify-center mb-4">
                      <FileText size={24} className="text-neon-blue" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Contract Interaction
                    </h3>
                    <p className="text-sm text-gray-400">
                      Read and write to smart contracts with real-time event monitoring.
                    </p>
                  </div>

                  <div className="card-glow rounded-lg p-6">
                    <div className="w-12 h-12 bg-neon-purple/10 rounded-lg flex items-center justify-center mb-4">
                      <Coins size={24} className="text-neon-purple" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Token Management
                    </h3>
                    <p className="text-sm text-gray-400">
                      Transfer ERC-20 tokens and track transaction history across chains.
                    </p>
                  </div>

                  <div className="card-glow rounded-lg p-6">
                    <div className="w-12 h-12 bg-neon-green/10 rounded-lg flex items-center justify-center mb-4">
                      <BookOpen size={24} className="text-neon-green" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      The Graph Integration
                    </h3>
                    <p className="text-sm text-gray-400">
                      Query blockchain data efficiently with custom subgraphs.
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'datalogger' && (
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <DataLoggerPanel />
              </div>
            )}

            {activeTab === 'token' && (
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <TokenTransfer />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <TransactionHistory />
              </div>
            )}

            {activeTab === 'subgraph' && (
              <div className="grid grid-cols-1 gap-6">
                <SubgraphGuide />
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-md py-6">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                Built with{' '}
                <span className="text-neon-blue font-semibold">wagmi</span>,{' '}
                <span className="text-neon-purple font-semibold">viem</span>, and{' '}
                <span className="text-neon-pink font-semibold">The Graph</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Right Sidebar - Wallet Panel */}
      <WalletPanel />
    </div>
  )
}

export default App
