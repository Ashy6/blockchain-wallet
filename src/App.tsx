import { WalletConnect } from './components/WalletConnect'
import { WalletPanel } from './components/WalletPanel'
import { GraphDataDisplay } from './components/GraphDataDisplay'
import { NetworkSwitch } from './components/NetworkSwitch'
import { Wallet, Activity, Zap } from 'lucide-react'

function App() {
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Hero Section */}
            <div className="mb-8">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neon-blue/20 via-neon-purple/20 to-neon-pink/20 border border-neon-blue/30 p-8">
                {/* Animated background elements */}
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
                    Connect your wallet, explore multiple blockchain networks,
                    send transactions, and view real-time DeFi data from The Graph.
                  </p>
                  <div className="flex items-center gap-6 mt-6">
                    <div className="flex items-center gap-2">
                      <Activity size={20} className="text-neon-green" />
                      <span className="text-sm text-gray-400">Real-time Data</span>
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
              {/* Network Switch */}
              <div className="lg:col-span-1">
                <NetworkSwitch />
              </div>

              {/* Graph Data Display */}
              <div className="lg:col-span-1">
                <GraphDataDisplay />
              </div>
            </div>

            {/* Features Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-glow rounded-lg p-6">
                <div className="w-12 h-12 bg-neon-blue/10 rounded-lg flex items-center justify-center mb-4">
                  <Wallet size={24} className="text-neon-blue" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Multi-Wallet Support
                </h3>
                <p className="text-sm text-gray-400">
                  Connect with MetaMask, WalletConnect, or any injected wallet provider.
                </p>
              </div>

              <div className="card-glow rounded-lg p-6">
                <div className="w-12 h-12 bg-neon-purple/10 rounded-lg flex items-center justify-center mb-4">
                  <Activity size={24} className="text-neon-purple" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  The Graph Integration
                </h3>
                <p className="text-sm text-gray-400">
                  Query real-time blockchain data from decentralized subgraphs.
                </p>
              </div>

              <div className="card-glow rounded-lg p-6">
                <div className="w-12 h-12 bg-neon-green/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap size={24} className="text-neon-green" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Fast Transactions
                </h3>
                <p className="text-sm text-gray-400">
                  Send transactions across multiple chains with optimal gas fees.
                </p>
              </div>
            </div>
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
