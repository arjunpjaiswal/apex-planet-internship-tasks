import { createButton } from '../src/components/Button.js';

export default {
  title: 'Design System/Button',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'danger', 'success', 'ghost', 'icon']
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg']
    },
    disabled: { control: 'boolean' }
  }
};

export const Primary = {
  args: {
    label: 'Primary Action',
    variant: 'primary',
    size: 'md'
  },
  render: (args) => createButton(args)
};

export const Secondary = {
  args: {
    label: 'Secondary Action',
    variant: 'secondary',
    size: 'md'
  },
  render: (args) => createButton(args)
};

export const Outline = {
  args: {
    label: 'Outline Button',
    variant: 'outline',
    size: 'md'
  },
  render: (args) => createButton(args)
};

export const Danger = {
  args: {
    label: 'Delete Resource',
    variant: 'danger',
    size: 'md'
  },
  render: (args) => createButton(args)
};

export const Success = {
  args: {
    label: 'Confirm Order',
    variant: 'success',
    size: 'md'
  },
  render: (args) => createButton(args)
};

export const Ghost = {
  args: {
    label: 'Ghost Button',
    variant: 'ghost',
    size: 'md'
  },
  render: (args) => createButton(args)
};

export const IconVariant = {
  args: {
    label: 'Settings',
    variant: 'icon',
    size: 'md',
    icon: '⚙️'
  },
  render: (args) => createButton(args)
};
