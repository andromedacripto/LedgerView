import React, { useState } from "react";
import { ethers } from "ethers";
import { Wallet, TrendingUp, Activity, AlertCircle, Github, Twitter, Globe, X, Mail, User, MessageSquare, Send, ChevronDown, ChevronUp, Shield, FileText, HelpCircle, Book } from 'lucide-react';

const TOKENS = {
  ETH: { symbol: "ETH", decimals: 18 },
  USDT: { 
    symbol: "USDT", 
    address: "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca", 
    decimals: 6 
  },
  USDC: { 
    symbol: "USDC", 
    address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", 
    decimals: 6 
  }
};

export default function BaseWalletChecker() {
  const [address, setAddress] = useState("");
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [balances, setBalances] = useState({});
  const [txCount, setTxCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [formStatus, setFormStatus] = useState(null);

  const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");

  const isValidEthAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setError("MetaMask not detected! Please install MetaMask.");
        return;
      }

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const walletAddress = accounts[0];
      
      setConnectedWallet(walletAddress);
      setAddress(walletAddress);
      setError(null);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError("Failed to connect wallet. Please try again.");
    }
  }

  function disconnectWallet() {
    setConnectedWallet(null);
    setAddress("");
    setBalances({});
    setTxCount(null);
    setError(null);
  }

  async function fetchBalance(addr) {
    try {
      let results = {};

      const ethBal = await provider.getBalance(addr);
      results["ETH"] = Number(ethers.formatUnits(ethBal, TOKENS.ETH.decimals));

      for (let key of ["USDT", "USDC"]) {
        try {
          const token = TOKENS[key];
          const abi = ["function balanceOf(address) view returns (uint256)"];
          const contract = new ethers.Contract(ethers.getAddress(token.address), abi, provider);
          const rawBal = await contract.balanceOf(addr);
          results[key] = Number(ethers.formatUnits(rawBal, token.decimals));
        } catch (errToken) {
          console.error(`Error fetching ${key}:`, errToken);
          results[key] = null;
        }
      }

      return results;
    } catch (err) {
      console.error("Error fetchBalance:", err);
      throw err;
    }
  }

  async function fetchTransactionCount(addr) {
    try {
      const count = await provider.getTransactionCount(addr);
      return count;
    } catch (err) {
      console.error("Error fetching tx count:", err);
      throw err;
    }
  }

  async function checkBalances() {
    setError(null);
    setBalances({});
    setTxCount(null);
    
    if (!isValidEthAddress(address)) {
      setError("Invalid Ethereum/Base address!");
      return;
    }

    setLoading(true);
    try {
      const [bals, count] = await Promise.all([
        fetchBalance(address),
        fetchTransactionCount(address)
      ]);
      setBalances(bals);
      setTxCount(count);
    } catch (err) {
      setError("Error fetching data. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  function formatNumber(num) {
    if (num === null) return "Error";
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  }

  const getBalanceColor = (val) => {
    if (val === undefined || val === null) return "text-gray-500";
    if (val < 1) return "text-red-600";
    if (val < 10) return "text-yellow-600";
    return "text-green-600";
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const { name, email, subject, message } = contactForm;
    
    const mailtoLink = `mailto:andromedacripto17@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
    window.location.href = mailtoLink;
    
    setFormStatus("success");
    setContactForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setFormStatus(null), 3000);
  };

  const faqData = [
    {
      question: "What is LedgerView?",
      answer: "LedgerView is a powerful Base Network explorer that allows you to check wallet balances, transaction counts, and token holdings for ETH, USDT, and USDC on the Base blockchain."
    },
    {
      question: "How do I connect my wallet?",
      answer: "Click the 'Connect Wallet' button and approve the connection in your MetaMask extension. Make sure you have MetaMask installed and are connected to the Base network."
    },
    {
      question: "What tokens are supported?",
      answer: "Currently, LedgerView supports ETH (native Base token), USDT, and USDC on the Base network. We're constantly working to add more tokens."
    },
    {
      question: "Is my data secure?",
      answer: "Yes! LedgerView only reads public blockchain data. We never store your private keys or have access to your funds. All wallet interactions happen directly through your MetaMask extension."
    },
    {
      question: "Can I check any wallet address?",
      answer: "Absolutely! You can either connect your own wallet or paste any valid Ethereum/Base address (starting with 0x) to check its balances and transaction history."
    },
    {
      question: "Is there a fee to use LedgerView?",
      answer: "No, LedgerView is completely free to use. There are no hidden fees or charges for checking wallet information."
    },
    {
      question: "What network does LedgerView use?",
      answer: "LedgerView is connected to the Base Mainnet, a Layer 2 Ethereum scaling solution that offers fast and low-cost transactions."
    },
    {
      question: "Can I see my transaction history?",
      answer: "Currently, LedgerView shows the total number of transactions for a wallet. Detailed transaction history features are coming in future updates!"
    }
  ];

  const Modal = ({ title, children, icon: Icon }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-6 h-6 text-white" />}
            <h2 className="text-2xl font-bold text-white">{title}</h2>
          </div>
          <button onClick={() => setActiveModal(null)} className="text-white hover:bg-white/20 p-2 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-40px) translateX(-10px); }
          75% { transform: translateY(-20px) translateX(15px); }
        }
      `}</style>

      {/* Modals */}
      {activeModal === 'documentation' && (
        <Modal title="Documentation" icon={Book}>
          <div className="space-y-6">
            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Getting Started</h3>
              <p className="text-gray-600 mb-4">LedgerView is your comprehensive Base Network explorer. Follow these steps to get started:</p>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Install MetaMask browser extension if you haven't already</li>
                <li>Connect to the Base network in MetaMask</li>
                <li>Click "Connect Wallet" or paste any Base address</li>
                <li>Click "Check Wallet" to view balances and transaction count</li>
              </ol>
            </section>

            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Features</h3>
              <div className="grid gap-3">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">🔗 Wallet Connection</h4>
                  <p className="text-sm text-blue-800">Seamlessly connect your MetaMask wallet with one click</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">💰 Token Balances</h4>
                  <p className="text-sm text-purple-800">View real-time balances for ETH, USDT, and USDC</p>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-pink-900 mb-2">📊 Transaction History</h4>
                  <p className="text-sm text-pink-800">See total transaction count for any address</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Technical Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <p><strong>Network:</strong> Base Mainnet</p>
                <p><strong>RPC:</strong> https://mainnet.base.org</p>
                <p><strong>Supported Tokens:</strong></p>
                <ul className="list-disc list-inside ml-4 text-gray-600">
                  <li>ETH (Native)</li>
                  <li>USDT: 0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca</li>
                  <li>USDC: 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913</li>
                </ul>
              </div>
            </section>
          </div>
        </Modal>
      )}

      {activeModal === 'privacy' && (
        <Modal title="Privacy Policy" icon={Shield}>
          <div className="space-y-4 text-gray-600">
            <p className="text-sm text-gray-500">Last updated: October 2025</p>
            
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-2">1. Information We Collect</h3>
              <p>LedgerView is a client-side application that does not collect, store, or transmit personal data. All interactions occur directly between your browser and the Base blockchain.</p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-2">2. Wallet Connection</h3>
              <p>When you connect your wallet, we only access your public address through MetaMask. We never have access to your private keys or seed phrases.</p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-2">3. Blockchain Data</h3>
              <p>All balance and transaction data is read directly from the public Base blockchain. This information is publicly available and not stored by LedgerView.</p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-2">4. Third-Party Services</h3>
              <p>We use the Base network RPC to query blockchain data. No personal information is shared with third parties.</p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-2">5. Security</h3>
              <p>Your security is our priority. LedgerView operates entirely in your browser with no backend servers storing user data.</p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-2">6. Contact</h3>
              <p>For privacy concerns, contact us at andromedacripto17@gmail.com</p>
            </section>
          </div>
        </Modal>
      )}

      {activeModal === 'terms' && (
        <Modal title="Terms of Service" icon={FileText}>
          <div className="space-y-4 text-gray-600">
            <p className="text-sm text-gray-500">Last updated: October 2025</p>
            
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-2">1. Acceptance of Terms</h3>
              <p>By accessing and using LedgerView, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-2">2. Use License</h3>
              <p>LedgerView is provided free of charge for personal and commercial use. You may not reverse engineer, decompile, or attempt to extract the source code.</p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-2">3. Disclaimer</h3>
              <p>LedgerView is provided "as is" without warranty of any kind. We do not guarantee the accuracy, completeness, or timeliness of blockchain data displayed.</p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-2">4. Limitations</h3>
              <p>LedgerView and its developers shall not be liable for any damages arising from the use or inability to use this service, including but not limited to loss of funds or data.</p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-2">5. User Responsibilities</h3>
              <p>You are responsible for:</p>
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>Maintaining the security of your wallet and private keys</li>
                <li>Verifying all transaction details before signing</li>
                <li>Using the service in compliance with applicable laws</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-2">6. Modifications</h3>
              <p>We reserve the right to modify these terms at any time. Continued use of LedgerView constitutes acceptance of modified terms.</p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-2">7. Contact</h3>
              <p>For questions about these terms, contact andromedacripto17@gmail.com</p>
            </section>
          </div>
        </Modal>
      )}

      {activeModal === 'contact' && (
        <Modal title="Contact Us" icon={Mail}>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Name
              </label>
              <input
                type="text"
                required
                value={contactForm.name}
                onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                required
                value={contactForm.email}
                onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Subject
              </label>
              <input
                type="text"
                required
                value={contactForm.subject}
                onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="What's this about?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                required
                value={contactForm.message}
                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Your message..."
              ></textarea>
            </div>

            {formStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">
                ✓ Your email client will open. Thank you for contacting us!
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Send className="w-5 h-5" />
              Send Message
            </button>
          </form>
        </Modal>
      )}

      {activeModal === 'faq' && (
        <Modal title="Frequently Asked Questions" icon={HelpCircle}>
          <div className="space-y-3">
            {faqData.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
                >
                  <span className="font-semibold text-gray-800 text-left">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="p-4 bg-white text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex-grow flex items-center justify-center p-4 py-8">
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full shadow-lg">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
                LedgerView
              </h1>
              <p className="text-center text-gray-600 mb-8">
                Base Network Explorer
              </p>

              {!connectedWallet ? (
                <div className="space-y-4 mb-6">
                  <button
                    onClick={connectWallet}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Wallet className="w-5 h-5" />
                    Connect Wallet
                  </button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or paste address</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="text-xs text-gray-600">Connected Wallet</p>
                        <p className="text-sm font-mono text-gray-800">
                          {connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="text-xs text-red-600 hover:text-red-700 underline"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="0x..."
                    disabled={connectedWallet !== null}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  onClick={checkBalances}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {loading ? (
                    <>
                      <Activity className="w-5 h-5 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      Check Wallet
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {txCount !== null && (
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Total Transactions
                    </p>
                    <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {txCount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </p>
                  </div>
                </div>
              )}

              {Object.keys(balances).length > 0 && (
                <div className="mt-6 space-y-3">
                  <h2 className="text-lg font-bold text-gray-800">💰 Balances:</h2>
                  {Object.keys(TOKENS).map((sym) => (
                    <div
                      key={sym}
                      className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            sym === 'ETH' ? 'bg-gradient-to-br from-purple-400 to-purple-600 text-white' : 
                            sym === 'USDT' ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' : 
                            'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                          }`}>
                            {sym[0]}
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">{sym}</p>
                            <p className={`text-lg font-bold ${getBalanceColor(balances[sym])}`}>
                              {formatNumber(balances[sym])}
                            </p>
                          </div>
                        </div>
                        {balances[sym] > 0 && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

        <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Connected to Base Mainnet • v1.0.0
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 bg-black/30 backdrop-blur-xl border-t border-white/10 mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
              {/* Brand Section */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">LedgerView</h3>
                </div>
                <p className="text-gray-300 text-sm">
                  Your trusted Base Network explorer for seamless wallet management and token tracking.
                </p>
              </div>

              {/* Quick Links */}
              <div className="text-center">
                <h4 className="text-white font-semibold mb-3">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <button onClick={() => setActiveModal('documentation')} className="text-gray-300 hover:text-white transition-colors">
                      Documentation
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveModal('faq')} className="text-gray-300 hover:text-white transition-colors">
                      FAQ
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveModal('privacy')} className="text-gray-300 hover:text-white transition-colors">
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveModal('terms')} className="text-gray-300 hover:text-white transition-colors">
                      Terms of Service
                    </button>
                  </li>
                </ul>
              </div>

               {/* Social Links */}
              <div className="text-center md:text-right">
                <h4 className="text-white font-semibold mb-3">Connect With Us</h4>
                <div className="flex flex-col items-center md:items-end gap-4">
                  <div className="flex items-center gap-4">
                    <a href="#" className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all hover:scale-110">
                      <Twitter className="w-5 h-5 text-white" />
                    </a>
                    <a href="https://github.com/andromedacripto/LedgerView" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all hover:scale-110">
                      <Github className="w-5 h-5 text-white" />
                    </a>
                    <a href="#" className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all hover:scale-110">
                      <Globe className="w-5 h-5 text-white" />
                    </a>
                  </div>
                  <button 
                    onClick={() => setActiveModal('contact')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Contact Us
                  </button>
                </div>
                <p className="text-gray-300 text-xs mt-4">
                  Built with ❤️ for the Base community
                </p>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-gray-400 text-xs">
                  © 2025 LedgerView. All rights reserved.
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}