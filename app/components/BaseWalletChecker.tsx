'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { createPublicClient, http, formatUnits } from 'viem'
import { base } from 'wagmi/chains'
import {
  Wallet, TrendingUp, Activity, AlertCircle,
  GitBranch, X, Mail, User,
  MessageSquare, Send, ChevronDown, ChevronUp,
  Shield, FileText, HelpCircle, Book,
} from 'lucide-react'
import { ConnectWallet } from './ConnectWallet'
import { NftClaimSection } from './NftClaimSection'
import { TOKENS } from '../config/contracts'
import { AgentChat } from './AgentChat'

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
    setFormStatus('success')
    setContactForm({ name: '', email: '', subject: '', message: '' })
    setTimeout(() => setFormStatus(null), 3000)
  }

  const faqData = [
    { question: 'What is LedgerView?', answer: 'LedgerView is a Base Network explorer to check wallet balances, transaction counts, and token holdings for ETH, USDT, and USDC.' },
    { question: 'How do I connect my wallet?', answer: 'Click Connect Wallet and approve via MetaMask or Coinbase Wallet.' },
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
          <button onClick={() => setActiveModal(null)} className="text-white hover:bg-white/20 p-2 rounded-lg"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )

  const displayAddr = connectedAddress ?? manualAddress

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: "url('/bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute w-2 h-2 bg-white rounded-full opacity-10"
              style={{ left: `${(i * 17 + 5) % 100}%`, top: `${(i * 23 + 10) % 100}%`, animation: `float ${5 + (i % 5) * 2}s ease-in-out infinite`, animationDelay: `${i % 5}s` }} />
          ))}
        </div>
      </div>

      {activeModal === 'documentation' && (
        <Modal title="Documentation" icon={Book}>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Getting Started</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Connect your wallet using MetaMask or Coinbase Wallet</li>
              <li>Or paste any Base address in the input field</li>
              <li>Click &quot;Check Wallet&quot; to view balances and tx count</li>
              <li>Eligible wallets can claim a free LVG Genesis NFT</li>
            </ol>
          </div>
        </Modal>
      )}
      {activeModal === 'privacy' && (
        <Modal title="Privacy Policy" icon={Shield}>
          <div className="space-y-4 text-gray-600">
            <p className="text-sm text-gray-500">Last updated: June 2026</p>
            <p>LedgerView is a client-side application that does not collect, store, or transmit personal data. We never have access to your private keys or seed phrases.</p>
          </div>
        </Modal>
      )}
      {activeModal === 'terms' && (
        <Modal title="Terms of Service" icon={FileText}>
          <div className="space-y-4 text-gray-600">
            <p className="text-sm text-gray-500">Last updated: June 2026</p>
            <p>LedgerView is provided &quot;as is&quot; without warranty. Use at your own risk. For questions: andromedacripto17@gmail.com</p>
          </div>
        </Modal>
      )}
      {activeModal === 'contact' && (
        <Modal title="Contact Us" icon={Mail}>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            {[
              { label: 'Name', icon: User, key: 'name', type: 'text', placeholder: 'Your name' },
              { label: 'Email', icon: Mail, key: 'email', type: 'email', placeholder: 'your@email.com' },
              { label: 'Subject', icon: MessageSquare, key: 'subject', type: 'text', placeholder: "What\'s this about?" },
            ].map(({ label, icon: Icon, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2"><Icon className="w-4 h-4 inline mr-2" />{label}</label>
                <input type={type} required value={contactForm[key as keyof typeof contactForm]}
                  onChange={e => setContactForm({ ...contactForm, [key]: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder={placeholder} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea required value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Your message..." />
            </div>
            {formStatus === 'success' && <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">✓ Email client will open. Thank you!</div>}
            <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
              <Send className="w-5 h-5" /> Send Message
            </button>
          </form>
        </Modal>
      )}
      {activeModal === 'faq' && (
        <Modal title="FAQ" icon={HelpCircle}>
          <div className="space-y-3">
            {faqData.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition">
                  <span className="font-semibold text-gray-800 text-left">{faq.question}</span>
                  {expandedFaq === i ? <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {expandedFaq === i && <div className="p-4 bg-white text-gray-600">{faq.answer}</div>}
              </div>
            ))}
          </div>
        </Modal>
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex-grow flex items-center justify-center p-4 py-8">
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full shadow-lg">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">LedgerView</h1>
              <p className="text-center text-gray-600 mb-8">Base Network Explorer</p>

              <ConnectWallet />

              {!connectedAddress && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">or paste address</span></div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
                    <input type="text" value={manualAddress} onChange={e => setManualAddress(e.target.value)}
                      placeholder="0x..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
                  </div>
                </>
              )}

              <button onClick={checkBalances} disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg transform hover:scale-105">
                {loading ? <><Activity className="w-5 h-5 animate-spin" /> Checking...</> : <><TrendingUp className="w-5 h-5" /> Check Wallet</>}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {txCount !== null && (
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 text-center">
                  <p className="text-sm text-gray-600 mb-2">Total Transactions</p>
                  <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">{txCount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{displayAddr.slice(0, 6)}...{displayAddr.slice(-4)}</p>
                </div>
              )}

              {Object.keys(balances).length > 0 && (
                <div className="mt-6 space-y-3">
                  <h2 className="text-lg font-bold text-gray-800">💰 Balances:</h2>
                  {(['ETH', 'USDT', 'USDC'] as const).map(sym => (
                    <div key={sym} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${sym === 'ETH' ? 'bg-gradient-to-br from-purple-400 to-purple-600' : sym === 'USDT' ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'}`}>{sym[0]}</div>
                          <div>
                            <p className="text-xs text-gray-600">{sym}</p>
                            <p className={`text-lg font-bold ${balColor(balances[sym])}`}>{fmt(balances[sym])}</p>
                          </div>
                        </div>
                        {(balances[sym] ?? 0) > 0 && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">Active</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <NftClaimSection />

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">Connected to Base Mainnet • v2.0.0</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="relative z-10 bg-black/30 backdrop-blur-xl border-t border-white/10 mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg"><Wallet className="w-5 h-5 text-white" /></div>
                  <h3 className="text-xl font-bold text-white">LedgerView</h3>
                </div>
                <p className="text-gray-300 text-sm">Your trusted Base Network explorer for wallet management and token tracking.</p>
              </div>
              <div className="text-center">
                <h4 className="text-white font-semibold mb-3">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  {[['documentation', 'Documentation'], ['faq', 'FAQ'], ['privacy', 'Privacy Policy'], ['terms', 'Terms of Service']].map(([key, label]) => (
                    <li key={key}><button onClick={() => setActiveModal(key)} className="text-gray-300 hover:text-white transition-colors">{label}</button></li>
                  ))}
                </ul>
              </div>
              <div className="text-center md:text-right">
                <h4 className="text-white font-semibold mb-3">Connect With Us</h4>
                <div className="flex items-center justify-center md:justify-end gap-4">
                  <a href="https://github.com/andromedacripto/LedgerView" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all hover:scale-110">
                    <GitBranch className="w-5 h-5 text-white" />
                  </a>
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

      <AgentChat />
    </div>
  )
}