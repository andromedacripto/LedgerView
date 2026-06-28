'use client'

import { useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContracts, useAccount, useChainId, useSwitchChain } from 'wagmi'
import { base } from 'wagmi/chains'
import { Sparkles, CheckCircle, AlertCircle, Loader, ExternalLink } from 'lucide-react'
import { LVG_CONTRACT_ADDRESS, lvgAbi, DATA_SUFFIX } from '../config/contracts'

export function NftClaimSection() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { address: LVG_CONTRACT_ADDRESS, abi: lvgAbi, functionName: 'paused' },
      { address: LVG_CONTRACT_ADDRESS, abi: lvgAbi, functionName: 'totalMinted' },
      { address: LVG_CONTRACT_ADDRESS, abi: lvgAbi, functionName: 'MAX_SUPPLY' },
      { address: LVG_CONTRACT_ADDRESS, abi: lvgAbi, functionName: 'hasMinted', args: address ? [address] : undefined },
    ],
    query: { enabled: isConnected && !!address },
  })

  const paused = data?.[0]?.result as boolean | undefined
  const totalMinted = data?.[1]?.result as bigint | undefined
  const maxSupply = data?.[2]?.result as bigint | undefined
  const hasMinted = data?.[3]?.result as boolean | undefined
  const isSoldOut = totalMinted !== undefined && maxSupply !== undefined && totalMinted >= maxSupply

  const { data: txHash, isPending, writeContract, error: writeError, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  useEffect(() => { if (isSuccess) refetch() }, [isSuccess, refetch])

  if (!isConnected) return null

  if (chainId !== base.id) return (
    <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-5">
      <div className="flex items-center gap-2 text-yellow-800 text-sm mb-3">
        <AlertCircle className="w-4 h-4" /> Please switch to Base Mainnet to mint.
      </div>
      <button onClick={() => switchChain({ chainId: base.id })} disabled={isSwitching}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg transition text-sm">
        {isSwitching ? 'Switching...' : 'Switch to Base Mainnet'}
      </button>
    </div>
  )

  function handleMint() {
    if (!address) return
    writeContract({
      address: LVG_CONTRACT_ADDRESS,
      abi: lvgAbi,
      functionName: 'mint',
      dataSuffix: DATA_SUFFIX,
    })
  }

  return (
    <div className="mt-6 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-white" />
          <span className="text-white font-bold text-sm tracking-wide">LedgerView Genesis NFT</span>
        </div>
        {totalMinted !== undefined && (
          <span className="text-white/80 text-xs font-mono">{totalMinted.toString()} / {maxSupply?.toString() ?? '100'} minted</span>
        )}
      </div>

      <div className="px-5 py-4">
        {isLoading && <div className="flex items-center gap-2 text-gray-500 text-sm"><Loader className="w-4 h-4 animate-spin" /> Checking eligibility...</div>}
        {!isLoading && paused && <div className="flex items-center gap-2 text-sm text-gray-700"><AlertCircle className="w-4 h-4 text-yellow-500" /> Minting is temporarily paused.</div>}
        {!isLoading && !paused && isSoldOut && <div className="flex items-center gap-2 text-sm text-gray-700"><AlertCircle className="w-4 h-4 text-orange-500" /> All NFTs have been claimed.</div>}
        {!isLoading && !paused && !isSoldOut && hasMinted && <div className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle className="w-4 h-4 text-green-500" /> This wallet already holds a Genesis NFT.</div>}

        {!isLoading && !paused && !isSoldOut && hasMinted === false && !isSuccess && (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">Your wallet is eligible to claim a free <strong>LVG Genesis NFT</strong>. One per wallet, no cost — just gas.</p>
            <button onClick={handleMint} disabled={isPending || isConfirming}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50">
              {isPending ? <><Loader className="w-4 h-4 animate-spin" /> Confirm in Wallet...</>
                : isConfirming ? <><Loader className="w-4 h-4 animate-spin" /> Confirming...</>
                : <><Sparkles className="w-4 h-4" /> Claim Free NFT</>}
            </button>
            {txHash && <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-purple-600 hover:underline"><ExternalLink className="w-3 h-3" /> View transaction</a>}
          </div>
        )}

        {isSuccess && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-700 font-semibold text-sm"><CheckCircle className="w-5 h-5 text-green-500" /> NFT claimed successfully!</div>
            <p className="text-xs text-gray-600">Your LedgerView Genesis NFT is now in your wallet.</p>
            {txHash && <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-purple-600 hover:underline"><ExternalLink className="w-3 h-3" /> View on Basescan</a>}
          </div>
        )}

        {writeError && (
          <div className="space-y-2 mt-3">
            <div className="flex items-start gap-2 text-sm text-red-700"><AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{writeError.message.includes('User rejected') ? 'Transaction cancelled.' : 'Mint failed. Try again or use a browser wallet.'}</span>
            </div>
            <button onClick={reset} className="text-xs text-purple-600 hover:underline">Try again</button>
          </div>
        )}
      </div>

      <div className="px-5 pb-3">
        <a href={`https://basescan.org/address/${LVG_CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-600 transition">
          <ExternalLink className="w-3 h-3" /> View contract on Basescan
        </a>
      </div>
    </div>
  )
}