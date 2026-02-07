import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionInput from '@/components/TransactionInput';

describe('TransactionInput', () => {
  const mockOnAnalyze = jest.fn();

  beforeEach(() => {
    mockOnAnalyze.mockClear();
  });

  it('renders input and analyze button', () => {
    render(<TransactionInput onAnalyze={mockOnAnalyze} isLoading={false} />);
    expect(screen.getByPlaceholderText(/transaction hash/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
  });

  it('calls onAnalyze with trimmed hash when form is submitted', () => {
    render(<TransactionInput onAnalyze={mockOnAnalyze} isLoading={false} />);
    const input = screen.getByPlaceholderText(/transaction hash/i);
    fireEvent.change(input, { target: { value: '  0x1234abcd  ' } });
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }));
    expect(mockOnAnalyze).toHaveBeenCalledWith('0x1234abcd');
  });

  it('does not call onAnalyze when input is empty', () => {
    render(<TransactionInput onAnalyze={mockOnAnalyze} isLoading={false} />);
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }));
    expect(mockOnAnalyze).not.toHaveBeenCalled();
  });

  it('disables button when isLoading is true', () => {
    render(<TransactionInput onAnalyze={mockOnAnalyze} isLoading={true} />);
    expect(screen.getByRole('button', { name: /analyzing/i })).toBeDisabled();
  });

  it('shows "Analyzing..." when loading', () => {
    render(<TransactionInput onAnalyze={mockOnAnalyze} isLoading={true} />);
    expect(screen.getByRole('button', { name: /analyzing/i })).toBeInTheDocument();
  });
});
