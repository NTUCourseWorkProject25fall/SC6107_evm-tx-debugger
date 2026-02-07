/**
 * @jest-environment node
 */
import { GET } from '@/app/api/analyze/route';
import { NextRequest } from 'next/server';

describe('/api/analyze', () => {
  const validTxHash = '0x' + 'a'.repeat(64);

  it('returns 400 when txHash is missing', async () => {
    const request = new NextRequest('http://localhost/api/analyze');
    const response = await GET(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Invalid transaction hash');
  });

  it('returns 400 when txHash is invalid', async () => {
    const request = new NextRequest(
      'http://localhost/api/analyze?txHash=not-a-hash'
    );
    const response = await GET(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Invalid transaction hash');
  });

  it('returns 200 with analysis result for valid txHash', async () => {
    const request = new NextRequest(
      `http://localhost/api/analyze?txHash=${validTxHash}`
    );
    const response = await GET(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.txHash).toBe(validTxHash);
    expect(data.traceAnalysis).toBeDefined();
    expect(Array.isArray(data.traceAnalysis.calls)).toBe(true);
    expect(data.gasProfile).toBeDefined();
    expect(data.gasProfile.gasUsed).toBeDefined();
    expect(data.stateDiff).toBeDefined();
    expect(data.vulnerabilityReport).toBeDefined();
    expect(data.timestamp).toBeDefined();
  });

  it('returns traceAnalysis with expected shape', async () => {
    const request = new NextRequest(
      `http://localhost/api/analyze?txHash=${validTxHash}`
    );
    const response = await GET(request);
    const data = await response.json();
    expect(data.traceAnalysis.totalGasUsed).toBeGreaterThanOrEqual(0);
    expect(data.traceAnalysis.depth).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(data.traceAnalysis.contractsInvolved)).toBe(true);
  });

  it('returns vulnerabilityReport with counts', async () => {
    const request = new NextRequest(
      `http://localhost/api/analyze?txHash=${validTxHash}`
    );
    const response = await GET(request);
    const data = await response.json();
    expect(typeof data.vulnerabilityReport.totalIssues).toBe('number');
    expect(typeof data.vulnerabilityReport.criticalCount).toBe('number');
    expect(typeof data.vulnerabilityReport.highCount).toBe('number');
  });
});
