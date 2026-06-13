'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Wallet } from 'lucide-react'

export function ConnectWallet() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isReconnecting) return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm text-blue-600">Reconnecting...</p>
    </div>
  )

  if (!isConnected) return (
    <div className="space-y-3 mb-6">
      {connectors.map((connector) => (
        <button key={connector.uid} onClick={() => connect({ connector })} disabled={isConnecting}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
          <Wallet className="w-5 h-5" />
          {isConnecting ? 'Connecting...' : `Connect ${connector.name}`}
        </button>
      ))}
    </div>
  )

  return (
    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <div>
            <p className="text-xs text-gray-600">Connected Wallet</p>
            <p className="text-sm font-mono text-gray-800">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
          </div>
        </div>
        <button onClick={() => disconnect()} className="text-xs text-red-600 hover:text-red-700 underline">Disconnect</button>
      </div>
    </div>
  )
}