import React from 'react';
import { render, screen } from '@testing-library/react';
import GasProfileView from '@/components/GasProfileView';
import type { GasProfile } from '@/types/analysis';

const profileWithData: GasProfile = {
  totalGas: 70000,
  gasLimit: 100000,
  gasUsed: 70000,
  efficiency: 70,
  functionAnalyses: [
    {
      selector: '0x12345678',
      functionName: 'transfer(address,uint256)',
      totalGas: 65000,
      callCount: 1,
      breakdown: {
        storageOperations: 20000,
        externalCalls: 21000,
        memoryOperations: 10000,
        computation: 14000,
        other: 0,
      },
      hints: [],
    },
  ],
  globalHints: [
    {
      category: 'Storage',
      description: 'Use memory for temp values',
      estimatedSavings: 5000,
      recommendation: 'Use memory instead of storage',
    },
  ],
};

const profileEmpty: GasProfile = {
  totalGas: 0,
  gasLimit: 0,
  gasUsed: 0,
  efficiency: 0,
  functionAnalyses: [],
  globalHints: [],
};

describe('GasProfileView', () => {
  it('renders Gas Profile heading', () => {
    render(<GasProfileView gasProfile={profileWithData} />);
    expect(screen.getByText(/Gas Profile/i)).toBeInTheDocument();
  });

  it('shows gas efficiency and total gas', () => {
    render(<GasProfileView gasProfile={profileWithData} />);
    expect(screen.getByText(/70%/)).toBeInTheDocument();
    expect(screen.getByText(/70,000/)).toBeInTheDocument();
  });

  it('shows Top Gas-Consuming Functions', () => {
    render(<GasProfileView gasProfile={profileWithData} />);
    expect(screen.getByText(/Top Gas-Consuming Functions/i)).toBeInTheDocument();
  });

  it('shows Optimization Hints when present', () => {
    render(<GasProfileView gasProfile={profileWithData} />);
    expect(screen.getByText(/Optimization Hints/i)).toBeInTheDocument();
    expect(screen.getByText(/Storage/)).toBeInTheDocument();
    expect(screen.getByText(/Use memory for temp values/)).toBeInTheDocument();
    expect(screen.getByText(/5,000 gas/)).toBeInTheDocument();
  });

  it('renders without hints when globalHints is empty', () => {
    render(<GasProfileView gasProfile={profileEmpty} />);
    expect(screen.getByText(/Gas Profile/i)).toBeInTheDocument();
    expect(screen.queryByText(/Optimization Hints/i)).not.toBeInTheDocument();
  });

  it('shows Gas Efficiency and Total Gas labels', () => {
    render(<GasProfileView gasProfile={profileWithData} />);
    expect(screen.getByText(/Gas Efficiency/)).toBeInTheDocument();
    expect(screen.getByText(/Total Gas/)).toBeInTheDocument();
  });
});
