'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Wallet, X, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export function ConnectWallet() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [showModal, setShowModal] = useState(false)

  if (isReconnecting) return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm text-blue-600 text-center">Reconnecting...</p>
    </div>
  )

  if (isConnected) return (
    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <div>
            <p className="text-xs text-gray-600">Connected Wallet</p>
            <p className="text-sm font-mono text-gray-800">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
          </div>
        </div>
        <button onClick={() => disconnect()} className="text-xs text-red-600 hover:text-red-700 underline">
          Disconnect
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Single connect button */}
      <button
        onClick={() => setShowModal(true)}
        disabled={isConnecting}
        className="w-full mb-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transform hover:scale-105"
      >
        <Wallet className="w-5 h-5" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {/* Wallet modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Connect Wallet</h2>
                <p className="text-xs text-gray-500">Base Mainnet</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Connectors */}
            <div className="p-4 space-y-2">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => {
                    connect({ connector })
                    setShowModal(false)
                  }}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-800 text-sm">{connector.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition" />
                </button>
              ))}
            </div>

            <div className="px-6 pb-5 pt-1">
              <p className="text-xs text-gray-400 text-center">
                By connecting, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}