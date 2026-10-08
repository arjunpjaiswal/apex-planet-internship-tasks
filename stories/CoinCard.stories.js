import { createCoinCard } from '../src/components/CoinCard.js';

export default {
  title: 'Design System/CoinCard',
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    symbol: { control: 'text' },
    price: { control: 'text' },
    change24h: { control: 'text' },
    isPositive: { control: 'boolean' }
  }
};

export const Bitcoin = {
  args: {
    name: 'Bitcoin',
    symbol: 'BTC',
    price: '$68,420.00',
    change24h: '+3.45%',
    isPositive: true,
    icon: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    sparkline: [62000, 63400, 62800, 64200, 66100, 65800, 68420]
  },
  render: (args) => createCoinCard(args)
};

export const Ethereum = {
  args: {
    name: 'Ethereum',
    symbol: 'ETH',
    price: '$3,540.20',
    change24h: '+5.12%',
    isPositive: true,
    icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    sparkline: [3300, 3350, 3420, 3390, 3480, 3510, 3540]
  },
  render: (args) => createCoinCard(args)
};

export const SolanaDip = {
  args: {
    name: 'Solana',
    symbol: 'SOL',
    price: '$178.60',
    change24h: '-2.18%',
    isPositive: false,
    icon: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    sparkline: [186, 184, 185, 180, 181, 177, 178.6]
  },
  render: (args) => createCoinCard(args)
};
