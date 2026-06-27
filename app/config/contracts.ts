import { Attribution } from 'ox/erc8021'

export const LVG_CONTRACT_ADDRESS = '0x595c48f98e69131a395B829A1873493EF5662596' as const

export const lvgAbi = [
  { type: 'function', name: 'mint', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'hasMinted', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'totalMinted', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'MAX_SUPPLY', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'paused', inputs: [], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
] as const

export const TOKENS = {
  ETH: { symbol: 'ETH', decimals: 18 },
  USDT: { symbol: 'USDT', address: '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca' as `0x${string}`, decimals: 6 },
  USDC: { symbol: 'USDC', address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' as `0x${string}`, decimals: 6 },
} as const

export const BUILDER_CODE = 'bc_7wbyvrfn'

export const DATA_SUFFIX = Attribution.toDataSuffix({ codes: [BUILDER_CODE] })