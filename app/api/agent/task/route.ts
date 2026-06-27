import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, formatUnits, isAddress } from 'viem'
import { base } from 'viem/chains'
import Groq from 'groq-sdk'

const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
})

const erc20Abi = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

const lvgAbi = [
  {
    type: 'function',
    name: 'hasMinted',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
] as const

const LVG_CONTRACT = '0x595c48f98e69131a395B829A1873493EF5662596' as `0x${string}`
const USDC_CONTRACT = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' as `0x${string}`

async function getWalletData(address: `0x${string}`) {
  const zero = BigInt(0)
  const [ethBal, usdcBal, txCount, hasMinted] = await Promise.all([
    publicClient.getBalance({ address }),
    publicClient
      .readContract({ address: USDC_CONTRACT, abi: erc20Abi, functionName: 'balanceOf', args: [address] })
      .catch(() => zero),
    publicClient.getTransactionCount({ address }),
    publicClient
      .readContract({ address: LVG_CONTRACT, abi: lvgAbi, functionName: 'hasMinted', args: [address] })
      .catch(() => false),
  ])

  return {
    eth: Number(formatUnits(ethBal, 18)).toFixed(6),
    usdc: Number(formatUnits(usdcBal as bigint, 6)).toFixed(2),
    txCount,
    hasMinted,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message: string = body?.message ?? ''

    if (!message.trim()) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    const addressMatch = message.match(/0x[a-fA-F0-9]{40}/)
    let walletContext = ''

    if (addressMatch && isAddress(addressMatch[0])) {
      const addr = addressMatch[0] as `0x${string}`
      try {
        const data = await getWalletData(addr)
        walletContext = `
Live wallet data fetched from Base Mainnet for ${addr}:
- ETH Balance: ${data.eth} ETH
- USDC Balance: ${data.usdc} USDC
- Total Transactions: ${data.txCount}
- LedgerView Genesis NFT: ${data.hasMinted ? 'Already minted ✓' : 'Not minted yet'}
`
      } catch {
        walletContext = `\nCould not fetch on-chain data for ${addr} — RPC may be temporarily unavailable.\n`
      }
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 512,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: `You are LedgerView Agent, an AI blockchain analytics assistant for the Base network (Base Mainnet, chainId 8453).
You help users analyze wallets, token balances, transactions, and on-chain activity on Base.
Be concise, accurate, and friendly. Format token amounts clearly.
If on-chain wallet data is provided below, use it to answer the user accurately.
Never make up balances or transaction counts.
${walletContext}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
    })

    const response = completion.choices[0]?.message?.content ?? 'No response generated.'

    return NextResponse.json({
      response,
      agent: 'LedgerView',
      network: 'Base Mainnet',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[agent/task] error:', err)
    return NextResponse.json({ error: 'Agent error. Please try again.' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    agent: 'LedgerView Agent',
    status: 'online',
    model: 'llama-3.1-8b-instant',
    network: 'Base Mainnet',
    capabilities: ['wallet-analysis', 'token-balances', 'transaction-count', 'nft-check'],
  })
}