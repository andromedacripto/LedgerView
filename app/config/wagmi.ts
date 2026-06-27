import { http, createConfig, createStorage, cookieStorage } from 'wagmi'
import { base } from 'wagmi/chains'
import { coinbaseWallet, metaMask } from 'wagmi/connectors'
import { Attribution } from 'ox/erc8021'

const DATA_SUFFIX = Attribution.toDataSuffix({ codes: ['bc_7wbyvrfn'] })

export const config = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({ appName: 'LedgerView', preference: 'smartWalletOnly' }),
    metaMask(),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
  dataSuffix: DATA_SUFFIX,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
