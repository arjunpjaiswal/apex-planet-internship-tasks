import { createCard } from '../src/components/Card.js';

export default {
  title: 'Design System/Card',
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    content: { control: 'text' },
    footer: { control: 'text' },
    variant: {
      control: { type: 'select' },
      options: ['default', 'elevated', 'outlined']
    }
  }
};

export const Default = {
  args: {
    title: 'Standard Card',
    content: '<p>This is a standard card designed with minimal border and crisp elevation.</p>',
    footer: '<button class="btn btn-primary btn-sm">Action</button>',
    variant: 'default'
  },
  render: (args) => createCard(args)
};

export const Elevated = {
  args: {
    title: 'Elevated Card',
    content: '<p>Features a prominent drop-shadow for modal-style or emphasized content.</p>',
    footer: '<button class="btn btn-secondary btn-sm">Dismiss</button>',
    variant: 'elevated'
  },
  render: (args) => createCard(args)
};

export const Outlined = {
  args: {
    title: 'Outlined Card',
    content: '<p>Zero shadow with an accentuated border for dense dashboards.</p>',
    footer: '<span>Status: Active</span>',
    variant: 'outlined'
  },
  render: (args) => createCard(args)
};
