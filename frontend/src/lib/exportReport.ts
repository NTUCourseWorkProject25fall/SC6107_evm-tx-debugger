import type { TransactionAnalysisResult } from '@/types/analysis';

export function exportAsJson(result: TransactionAnalysisResult): string {
  return JSON.stringify(result, null, 2);
}

export function exportAsMarkdown(result: TransactionAnalysisResult): string {
  const r = result;
  const lines: string[] = [
    '# Transaction Analysis Report',
    '',
    `**Transaction Hash:** \`${r.txHash}\``,
    `**Timestamp:** ${new Date(r.timestamp).toISOString()}`,
    '',
    '## Summary',
    '',
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Gas Used | ${r.gasProfile.gasUsed.toLocaleString()} |`,
    `| Gas Limit | ${r.gasProfile.gasLimit.toLocaleString()} |`,
    `| Efficiency | ${r.gasProfile.efficiency}% |`,
    `| Vulnerabilities | ${r.vulnerabilityReport.totalIssues} |`,
    '',
    '## Execution Trace',
    '',
    `Total calls: ${r.traceAnalysis.calls.length} | Depth: ${r.traceAnalysis.depth}`,
    '',
  ];
  r.traceAnalysis.calls.forEach((c, i) => {
    lines.push(`### Call ${i + 1}: ${c.functionName || c.selector}`);
    lines.push(`- **Type:** ${c.callType} | **Gas:** ${c.gasUsed.toLocaleString()} | **Success:** ${c.success}`);
    lines.push(`- **From:** \`${c.from}\``);
    lines.push(`- **To:** \`${c.to}\``);
    if (c.value !== '0' && c.value !== '0x0') lines.push(`- **Value:** ${c.value}`);
    lines.push('');
  });
  lines.push('## Gas Profile', '');
  r.gasProfile.functionAnalyses.forEach((f) => {
    lines.push(`- **${f.functionName}**: ${f.totalGas.toLocaleString()} gas (${f.callCount} call(s))`);
  });
  if (r.gasProfile.globalHints.length > 0) {
    lines.push('', '### Optimization Hints', '');
    r.gasProfile.globalHints.forEach((h) => {
      lines.push(`- **${h.category}:** ${h.description}`);
      lines.push(`  - ${h.recommendation}`);
    });
  }
  lines.push('', '## State Diff', '');
  lines.push(`Storage changes: ${r.stateDiff.totalStorageChanges} | Balance changes: ${r.stateDiff.totalBalanceChanges} | Transfers: ${r.stateDiff.totalTransfers}`);
  lines.push('');
  if (r.vulnerabilityReport.vulnerabilities.length > 0) {
    lines.push('## Vulnerability Report', '');
    r.vulnerabilityReport.vulnerabilities.forEach((v) => {
      lines.push(`### ${v.name} [${v.severity}]`);
      lines.push(v.description);
      lines.push(`**Recommendation:** ${v.recommendation}`);
      lines.push('');
    });
  }
  return lines.join('\n');
}

export function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
