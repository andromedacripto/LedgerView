'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { createPublicClient, http, formatUnits } from 'viem'
import { base } from 'wagmi/chains'
import {
  Wallet, TrendingUp, Activity, AlertCircle,
  GitBranch, Globe, X, Mail, User,
  MessageSquare, Send, ChevronDown, ChevronUp,
  Shield, FileText, HelpCircle, Book,
} from 'lucide-react'
import { ConnectWallet } from './ConnectWallet'
import { NftClaimSection } from './NftClaimSection'
import { TOKENS } from '../config/contracts'

const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
})

const erc20Abi = [{
  type: 'function', name: 'balanceOf',
  inputs: [{ name: 'account', type: 'address' }],
  outputs: [{ name: '', type: 'uint256' }],
  stateMutability: 'view',
}] as const

type Balances = { ETH?: number; USDT?: number | null; USDC?: number | null }

export function BaseWalletChecker() {
  const { address: connectedAddress } = useAccount()
  const [manualAddress, setManualAddress] = useState('')
  const [balances, setBalances] = useState<Balances>({})
  const [txCount, setTxCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [formStatus, setFormStatus] = useState<string | null>(null)

  const isValidEthAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr)

  async function checkBalances() {
    const addr = connectedAddress ?? manualAddress
    setError(null); setBalances({}); setTxCount(null)
    if (!addr || !isValidEthAddress(addr)) { setError('Invalid Ethereum/Base address!'); return }
    setLoading(true)
    try {
      const a = addr as `0x${string}`
      const [ethBal, usdtBal, usdcBal, count] = await Promise.all([
        publicClient.getBalance({ address: a }),
        publicClient.readContract({ address: TOKENS.USDT.address, abi: erc20Abi, functionName: 'balanceOf', args: [a] }).catch(() => null),
        publicClient.readContract({ address: TOKENS.USDC.address, abi: erc20Abi, functionName: 'balanceOf', args: [a] }).catch(() => null),
        publicClient.getTransactionCount({ address: a }),
      ])
      setBalances({
        ETH: Number(formatUnits(ethBal, 18)),
        USDT: usdtBal !== null ? Number(formatUnits(usdtBal as bigint, 6)) : null,
        USDC: usdcBal !== null ? Number(formatUnits(usdcBal as bigint, 6)) : null,
      })
      setTxCount(count)
    } catch { setError('Error fetching data.') }
    finally { setLoading(false) }
  }

  const fmt = (n?: number | null) => n == null ? 'Error' : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
  const balColor = (v?: number | null) => !v ? 'text-gray-500' : v < 1 ? 'text-red-600' : v < 10 ? 'text-yellow-600' : 'text-green-600'

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const { name, email, subject, message } = contactForm
    window.location.href = `mailto:andromedacripto17@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`
    setFormStatus('success'); setContactForm({ name: '', email: '', subject: '', message: '' })
    setTimeout(() => setFormStatus(null), 3000)
  }

  const faqData = [
    { question: 'What is LedgerView?', answer: 'LedgerView is a Base Network explorer to check wallet balances, transaction counts, and token holdings for ETH, USDT, and USDC.' },
    { question: 'How do I connect my wallet?', answer: 'Click Connect Wallet and approve via MetaMask or Base Account smart wallet.' },
    { question: 'What tokens are supported?', answer: 'ETH, USDT, and USDC on Base Mainnet.' },
    { question: 'Is my data secure?', answer: 'Yes. LedgerView only reads public blockchain data. We never access your private keys.' },
    { question: 'Can I check any wallet address?', answer: 'Yes — connect your wallet or paste any valid 0x address.' },
    { question: 'Is there a fee?', answer: 'No, LedgerView is completely free.' },
    { question: 'What network?', answer: 'Base Mainnet — a Layer 2 Ethereum scaling solution.' },
    { question: 'Can I see transaction history?', answer: 'Currently shows total tx count. Detailed history coming soon.' },
  ]

  const Modal = ({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon: React.ElementType }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3"><Icon className="w-6 h-6 text-white" /><h2 className="text-2xl font-bold text-white">{title}</h2></div>
                </div>
                <p className="text-gray-300 text-xs mt-4">Built with ❤️ for the Base community</p>
              </div>
            </div>
            <div className="border-t border-white/10 pt-6">
              <p className="text-gray-400 text-xs text-center">© 2026 LedgerView. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}