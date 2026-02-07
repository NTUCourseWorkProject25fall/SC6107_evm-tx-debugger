import React from 'react';
import { render, screen } from '@testing-library/react';
import TransactionAnalysis from '@/components/TransactionAnalysis';
import { mockAnalysisResult } from './mockAnalysisResult';

describe('TransactionAnalysis', () => {
  it('renders transaction hash and summary', () => {
    render(<TransactionAnalysis result={mockAnalysisResult} />);
    expect(screen.getByText(/Transaction Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(mockAnalysisResult.txHash)).toBeInTheDocument();
    expect(screen.getAllByText(/70,000/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Vulnerabilities Found/i)).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
  });

  it('renders TraceView section', () => {
    render(<TransactionAnalysis result={mockAnalysisResult} />);
    expect(screen.getByText(/Execution Trace/i)).toBeInTheDocument();
  });

  it('renders Gas Profile section', () => {
    render(<TransactionAnalysis result={mockAnalysisResult} />);
    expect(screen.getByText(/Gas Profile/i)).toBeInTheDocument();
  });

  it('renders State Changes section', () => {
    render(<TransactionAnalysis result={mockAnalysisResult} />);
    expect(screen.getByText(/State Changes/i)).toBeInTheDocument();
  });

  it('renders Vulnerability Report section', () => {
    render(<TransactionAnalysis result={mockAnalysisResult} />);
    expect(screen.getByText(/Vulnerability Report/i)).toBeInTheDocument();
  });

  it('renders Export JSON and Export Markdown buttons', () => {
    render(<TransactionAnalysis result={mockAnalysisResult} />);
    expect(screen.getByRole('button', { name: /Export JSON/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export Markdown/i })).toBeInTheDocument();
  });
});
