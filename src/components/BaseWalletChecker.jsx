import React, { useState } from "react";
import { ethers } from "ethers";

// Contratos USDT e USDC na Base (rede L2 da Coinbase)
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
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // RPC público da Base
  const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");

  const isValidEthAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  async function fetchBalance(addr) {
    try {
      let results = {};

      // ETH
      const ethBal = await provider.getBalance(addr);
      results["ETH"] = Number(ethers.formatUnits(ethBal, TOKENS.ETH.decimals));

      // ERC20 (USDT / USDC)
      for (let key of ["USDT", "USDC"]) {
        try {
          const token = TOKENS[key];
          const abi = ["function balanceOf(address) view returns (uint256)"];
          const contract = new ethers.Contract(ethers.getAddress(token.address), abi, provider);
          const rawBal = await contract.balanceOf(addr);
          results[key] = Number(ethers.formatUnits(rawBal, token.decimals));
        } catch (errToken) {
          console.error(`Erro fetching ${key}:`, errToken);
          results[key] = null; // marca erro como null
        }
      }

      return results;
    } catch (err) {
      console.error("Erro fetchBalance:", err);
      throw err;
    }
  }

  async function checkBalances() {
    setError(null);
    setBalances({});
    if (!isValidEthAddress(address)) {
      setError("⚠️ Invalid Ethereum/Base address!");
      return;
    }

    setLoading(true);
    try {
      const bals = await fetchBalance(address);
      setBalances(bals);
    } catch (err) {
      setError("⚠️ Error fetching balances. Check console for details.");
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-black">
      <div className="max-w-md w-full space-y-6 text-center shadow-lg p-6 rounded-xl bg-white">
        <header className="flex items-center justify-center gap-3">
          <img src="/base-logo.png" alt="Logo" className="w-20 h-20" />
          <h1 className="text-3xl font-bold">LedgerView</h1>
        </header>

        <input
          type="text"
          placeholder="Paste your Ethereum/Base address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-3 border border-gray-400 rounded text-black"
        />

        <button
          onClick={checkBalances}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
        >
          {loading ? "⏳ Checking..." : "Check Balances"}
        </button>

        {error && <p className="text-red-600 mt-2">{error}</p>}

        {Object.keys(balances).length > 0 && (
          <div className="mt-4 space-y-3">
            <h2 className="text-xl font-semibold mb-2">💰 Balances:</h2>
            {Object.keys(TOKENS).map((sym) => (
              <p key={sym} className={`text-lg font-bold ${getBalanceColor(balances[sym])}`}>
                {sym}: {formatNumber(balances[sym])}
              </p>
            ))}
          </div>
        )}

        <footer className="mt-10 border-t pt-4 text-gray-600 text-sm">
          ©2025 LedgerView. Powered by{" "}
          <a
            href="https://github.com/andromedacripto"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-600"
          >
            GitHub
          </a>{" "}
          • v0.1.1
        </footer>
      </div>
    </div>
  );
}
