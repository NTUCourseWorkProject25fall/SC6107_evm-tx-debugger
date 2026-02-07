import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '@/app/page';
import { mockAnalysisResult } from './mockAnalysisResult';

describe('Home page', () => {
  it('renders title and description', () => {
    render(<Home />);
    expect(screen.getByText(/EVM Transaction Debugger & Analyzer/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Analyze Ethereum transactions at the EVM level/i)
    ).toBeInTheDocument();
  });

  it('renders transaction input', () => {
    render(<Home />);
    expect(screen.getByPlaceholderText(/transaction hash/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
  });

  it('shows analysis result after successful fetch', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalysisResult),
      })
    ) as jest.Mock;

    render(<Home />);
    const input = screen.getByPlaceholderText(/transaction hash/i);
    fireEvent.change(input, { target: { value: '0x' + 'a'.repeat(64) } });
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }));

    await waitFor(() => {
      expect(screen.getByText(/Transaction Analysis/i)).toBeInTheDocument();
    });
    expect(screen.getByText(mockAnalysisResult.txHash)).toBeInTheDocument();
  });

  it('shows error when fetch fails', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: false })
    ) as jest.Mock;

    render(<Home />);
    const input = screen.getByPlaceholderText(/transaction hash/i);
    fireEvent.change(input, { target: { value: '0x' + 'a'.repeat(64) } });
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }));

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
      expect(screen.getByText(/Failed to analyze transaction/)).toBeInTheDocument();
    });
  });
});
