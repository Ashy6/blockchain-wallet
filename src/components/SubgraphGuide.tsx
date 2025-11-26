import { useState } from 'react'
import { BookOpen, Code, GitBranch, Rocket, CheckCircle, ExternalLink } from 'lucide-react'

export function SubgraphGuide() {
  const [activeSection, setActiveSection] = useState<'schema' | 'mapping' | 'deploy'>('schema')

  const schemaCode = `# schema.graphql - Define your data structure
type Transfer @entity {
  id: ID!                    # Unique ID (transaction hash + log index)
  from: Bytes!               # Sender address
  to: Bytes!                 # Receiver address
  amount: BigInt!            # Transfer amount
  timestamp: BigInt!         # Block timestamp
  blockNumber: BigInt!       # Block number
  transactionHash: Bytes!    # Transaction hash
}

type DataUpdate @entity {
  id: ID!                    # Unique ID
  user: Bytes!               # User address
  oldValue: BigInt!          # Previous value
  newValue: BigInt!          # New value
  timestamp: BigInt!         # Block timestamp
  blockNumber: BigInt!       # Block number
  transactionHash: Bytes!    # Transaction hash
}

type User @entity {
  id: ID!                    # User address
  totalTransfers: BigInt!    # Total number of transfers
  totalVolume: BigInt!       # Total volume transferred
  lastActivity: BigInt!      # Last activity timestamp
}`

  const mappingCode = `// mapping.ts - Process blockchain events
import { Transfer as TransferEvent, DataUpdated } from "../generated/Contract/Contract"
import { Transfer, DataUpdate, User } from "../generated/schema"

export function handleTransfer(event: TransferEvent): void {
  // Create unique ID
  let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString()

  // Create Transfer entity
  let transfer = new Transfer(id)
  transfer.from = event.params.from
  transfer.to = event.params.to
  transfer.amount = event.params.value
  transfer.timestamp = event.block.timestamp
  transfer.blockNumber = event.block.number
  transfer.transactionHash = event.transaction.hash
  transfer.save()

  // Update User entities
  updateUser(event.params.from, event.params.value, event.block.timestamp)
  updateUser(event.params.to, event.params.value, event.block.timestamp)
}

export function handleDataUpdated(event: DataUpdated): void {
  let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString()

  let dataUpdate = new DataUpdate(id)
  dataUpdate.user = event.params.user
  dataUpdate.oldValue = event.params.oldValue
  dataUpdate.newValue = event.params.newValue
  dataUpdate.timestamp = event.block.timestamp
  dataUpdate.blockNumber = event.block.number
  dataUpdate.transactionHash = event.transaction.hash
  dataUpdate.save()
}

function updateUser(address: Bytes, amount: BigInt, timestamp: BigInt): void {
  let user = User.load(address.toHex())

  if (user == null) {
    user = new User(address.toHex())
    user.totalTransfers = BigInt.fromI32(0)
    user.totalVolume = BigInt.fromI32(0)
  }

  user.totalTransfers = user.totalTransfers.plus(BigInt.fromI32(1))
  user.totalVolume = user.totalVolume.plus(amount)
  user.lastActivity = timestamp
  user.save()
}`

  const deployCommands = `# Install Graph CLI
npm install -g @graphprotocol/graph-cli

# Initialize subgraph project
graph init --studio my-subgraph

# Update subgraph.yaml with your contract details
# Update schema.graphql with your entities
# Update mapping.ts with your event handlers

# Generate code from schema
graph codegen

# Build subgraph
graph build

# Deploy to The Graph Studio (for mainnet/testnet)
graph deploy --studio my-subgraph

# Or deploy to local Graph Node (for development)
graph create my-subgraph --node http://localhost:8020
graph deploy my-subgraph --node http://localhost:8020 --ipfs http://localhost:5001`

  const queryExample = `# Example GraphQL queries for your frontend

# Query recent transfers
query GetRecentTransfers {
  transfers(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    from
    to
    amount
    timestamp
    transactionHash
  }
}

# Query user statistics
query GetUserStats($userAddress: Bytes!) {
  user(id: $userAddress) {
    id
    totalTransfers
    totalVolume
    lastActivity
  }
}

# Query data updates
query GetDataUpdates($userAddress: Bytes!) {
  dataUpdates(where: { user: $userAddress }, orderBy: timestamp, orderDirection: desc) {
    id
    user
    oldValue
    newValue
    timestamp
    transactionHash
  }
}`

  const sections = [
    { id: 'schema', label: 'Schema', icon: Code, content: schemaCode },
    { id: 'mapping', label: 'Mapping', icon: GitBranch, content: mappingCode },
    { id: 'deploy', label: 'Deploy', icon: Rocket, content: deployCommands },
  ]

  return (
    <div className="card-glow rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen size={24} className="text-neon-blue" />
        <div>
          <h2 className="text-xl font-bold text-white">The Graph Subgraph Guide</h2>
          <p className="text-sm text-gray-400">Create custom subgraphs for your contracts</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-neon-blue/10 border border-neon-blue/30 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle size={20} className="text-neon-blue flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-semibold text-white mb-2">What is The Graph?</p>
            <p className="mb-2">
              The Graph is a decentralized protocol for indexing and querying blockchain data.
              It allows you to efficiently query contract events and state without scanning the entire blockchain.
            </p>
            <a
              href="https://thegraph.com/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-neon-blue hover:text-neon-purple"
            >
              <span>View Documentation</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id as typeof activeSection)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-300 ${
              activeSection === id
                ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                : 'bg-gray-900/50 text-gray-400 border border-gray-800 hover:border-gray-700'
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Code Display */}
      <div className="relative">
        <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 overflow-x-auto text-sm text-gray-300 max-h-[500px] overflow-y-auto">
          <code>{sections.find(s => s.id === activeSection)?.content}</code>
        </pre>
      </div>

      {/* Query Example */}
      {activeSection === 'deploy' && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Code size={20} className="text-neon-purple" />
            Query Examples
          </h3>
          <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 overflow-x-auto text-sm text-gray-300 max-h-[400px] overflow-y-auto">
            <code>{queryExample}</code>
          </pre>
        </div>
      )}

      {/* Steps */}
      <div className="mt-6 space-y-3">
        <h3 className="text-lg font-bold text-white mb-3">Quick Start Steps</h3>
        {[
          { step: 1, text: 'Define your data schema in schema.graphql' },
          { step: 2, text: 'Write event handlers in mapping.ts' },
          { step: 3, text: 'Deploy your subgraph to The Graph Studio' },
          { step: 4, text: 'Query your data using GraphQL in your frontend' },
        ].map(({ step, text }) => (
          <div
            key={step}
            className="flex items-center gap-3 p-3 bg-gray-900/50 border border-gray-800 rounded-lg"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-neon-blue/20 border border-neon-blue/30 rounded-full flex items-center justify-center text-neon-blue font-bold">
              {step}
            </div>
            <p className="text-gray-300">{text}</p>
          </div>
        ))}
      </div>

      {/* Links */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <a
          href="https://thegraph.com/studio/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-3 bg-gray-900/50 border border-gray-800 hover:border-neon-blue/50 rounded-lg text-gray-300 hover:text-neon-blue transition-all duration-300"
        >
          <span>The Graph Studio</span>
          <ExternalLink size={14} />
        </a>
        <a
          href="https://thegraph.com/docs/en/developing/creating-a-subgraph/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-3 bg-gray-900/50 border border-gray-800 hover:border-neon-blue/50 rounded-lg text-gray-300 hover:text-neon-blue transition-all duration-300"
        >
          <span>Creating Subgraphs</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  )
}
