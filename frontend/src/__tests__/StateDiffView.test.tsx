import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StateDiffView from '@/components/StateDiffView';
import type { StateDiff } from '@/types/analysis';

const stateDiffWithData: StateDiff = {
  storageChanges: [
    {
      contractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      slot: '0x00',
      before: '0x00',
      after: '0x01',
      description: 'Storage slot updated',
    },
  ],
  balanceChanges: [
    {
      account: '0x1234567890123456789012345678901234567890',
      before: '2000000000000000000',
      after: '1000000000000000000',
      delta: '-1000000000000000000',
    },
  ],
  tokenTransfers: [
    {
      token: '0x0000000000000000000000000000000000000000',
      from: '0x1234567890123456789012345678901234567890',
      to: '0x9876543210987654321098765432109876543210',
      amount: '1000000000000000000',
      tokenType: 'ETH',
    },
  ],
  totalStorageChanges: 1,
  totalBalanceChanges: 1,
  totalTransfers: 1,
};

const emptyStateDiff: StateDiff = {
  storageChanges: [],
  balanceChanges: [],
  tokenTransfers: [],
  totalStorageChanges: 0,
  totalBalanceChanges: 0,
  totalTransfers: 0,
};

describe('StateDiffView', () => {
  it('renders State Changes heading', () => {
    render(<StateDiffView stateDiff={stateDiffWithData} />);
    expect(screen.getByText(/State Changes/i)).toBeInTheDocument();
  });

  it('shows Storage, Balances, Transfers tabs', () => {
    render(<StateDiffView stateDiff={stateDiffWithData} />);
    expect(screen.getByRole('button', { name: /Storage \(1\)/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Balances \(1\)/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Transfers \(1\)/ })).toBeInTheDocument();
  });

  it('shows storage changes in storage tab', () => {
    render(<StateDiffView stateDiff={stateDiffWithData} />);
    expect(screen.getByText(/Storage slot updated/)).toBeInTheDocument();
    expect(screen.getByText(/0xabcdefabcdefabcdefabcdefabcdefabcdefabcd/)).toBeInTheDocument();
  });

  it('switches to balance tab and shows balance changes', () => {
    render(<StateDiffView stateDiff={stateDiffWithData} />);
    fireEvent.click(screen.getByRole('button', { name: /Balances \(1\)/ }));
    expect(screen.getByText(/0x1234567890123456789012345678901234567890/)).toBeInTheDocument();
    expect(screen.getByText(/Before/)).toBeInTheDocument();
    expect(screen.getByText(/After/)).toBeInTheDocument();
    expect(screen.getByText(/Delta/)).toBeInTheDocument();
    expect(screen.getAllByText(/ETH/).length).toBeGreaterThanOrEqual(1);
  });

  it('switches to transfers tab and shows token transfers', () => {
    render(<StateDiffView stateDiff={stateDiffWithData} />);
    fireEvent.click(screen.getByRole('button', { name: /Transfers \(1\)/ }));
    expect(screen.getByText('ETH')).toBeInTheDocument();
    expect(screen.getByText(/0x12345678/)).toBeInTheDocument();
    expect(screen.getByText(/0x98765432/)).toBeInTheDocument();
  });

  it('shows empty message when no storage changes', () => {
    render(<StateDiffView stateDiff={emptyStateDiff} />);
    expect(screen.getByText(/No storage changes detected/i)).toBeInTheDocument();
  });

  it('shows empty balances message when switching to balance tab with no data', () => {
    render(<StateDiffView stateDiff={emptyStateDiff} />);
    fireEvent.click(screen.getByRole('button', { name: /Balances \(0\)/ }));
    expect(screen.getByText(/No balance changes detected/i)).toBeInTheDocument();
  });
});
