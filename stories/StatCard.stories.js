import { createStatCard } from '../src/components/StatCard.js';

export default {
  title: 'Design System/StatCard',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    delta: { control: 'text' },
    isPositive: { control: 'boolean' },
    icon: { control: 'text' }
  }
};

export const Revenue = {
  args: {
    label: 'Total Revenue',
    value: '$128,450',
    delta: '+12.4% vs last month',
    isPositive: true,
    icon: '📈'
  },
  render: (args) => createStatCard(args)
};

export const ActiveUsers = {
  args: {
    label: 'Active Users',
    value: '42,890',
    delta: '+8.1% vs last week',
    isPositive: true,
    icon: '👥'
  },
  render: (args) => createStatCard(args)
};

export const ErrorRate = {
  args: {
    label: 'Error Rate',
    value: '0.04%',
    delta: '-15.2% vs benchmark',
    isPositive: false,
    icon: '🛡️'
  },
  render: (args) => createStatCard(args)
};
