import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TraceView from '@/components/TraceView';
import type { TraceAnalysis } from '@/types/analysis';

const emptyTrace: TraceAnalysis = {
  calls: [],
  events: [],
  totalGasUsed: 0,
  depth: 0,
  contractsInvolved: [],
};

const traceWithCalls: TraceAnalysis = {
  calls: [
    {
      from: '0x1234567890123456789012345678901234567890',
      to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      value: '1000000000000000000',
      data: '0x12345678',
      selector: '0x12345678',
      functionName: 'transfer(address,uint256)',
      callType: 'CALL',
      gasUsed: 65000,
      success: true,
    },
    {
      from: '0xa',
      to: '0xb',
      value: '0',
      data: '0x',
      selector: '0x00',
      functionName: '',
      callType: 'DELEGATECALL',
      gasUsed: 1000,
      success: false,
    },
  ],
  events: [],
  totalGasUsed: 66000,
  depth: 2,
  contractsInvolved: ['0x1234...', '0xabcd...'],
};

describe('TraceView', () => {
  it('renders Execution Trace heading', () => {
    render(<TraceView traceAnalysis={emptyTrace} />);
    expect(screen.getByText(/Execution Trace/i)).toBeInTheDocument();
  });

  it('shows Total Calls, Contracts Involved, Max Depth', () => {
    render(<TraceView traceAnalysis={traceWithCalls} />);
    expect(screen.getByText(/Total Calls/i)).toBeInTheDocument();
    expect(screen.getByText(/Contracts Involved/i)).toBeInTheDocument();
    expect(screen.getByText(/Max Depth/i)).toBeInTheDocument();
    const twos = screen.getAllByText('2');
    expect(twos.length).toBeGreaterThanOrEqual(1);
  });

  it('renders call list with function name and call type', () => {
    render(<TraceView traceAnalysis={traceWithCalls} />);
    expect(screen.getByText(/transfer\(address,uint256\)/)).toBeInTheDocument();
    expect(screen.getByText('CALL')).toBeInTheDocument();
    expect(screen.getByText('DELEGATECALL')).toBeInTheDocument();
    expect(screen.getByText(/65,000 gas/)).toBeInTheDocument();
  });

  it('shows FAILED badge for unsuccessful call', () => {
    render(<TraceView traceAnalysis={traceWithCalls} />);
    expect(screen.getByText('FAILED')).toBeInTheDocument();
  });

  it('expands call details on click', () => {
    render(<TraceView traceAnalysis={traceWithCalls} />);
    fireEvent.click(screen.getByText(/transfer\(address,uint256\)/));
    expect(screen.getByText(/From:/)).toBeInTheDocument();
    expect(screen.getByText(/To:/)).toBeInTheDocument();
  });

  it('renders empty state when no calls', () => {
    render(<TraceView traceAnalysis={emptyTrace} />);
    expect(screen.getByText(/Execution Trace/i)).toBeInTheDocument();
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
  });
});
