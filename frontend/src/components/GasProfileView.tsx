'use client';

import { GasProfile } from '@/types/analysis';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle } from 'lucide-react';

interface GasProfileViewProps {
  gasProfile: GasProfile;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function GasProfileView({ gasProfile }: GasProfileViewProps) {
  const topFunctions = gasProfile.functionAnalyses
    .sort((a, b) => b.totalGas - a.totalGas)
    .slice(0, 5);

  const chartData = topFunctions.map((func) => ({
    name: func.functionName || func.selector.slice(0, 8),
    gas: func.totalGas,
  }));

  const breakdownData = [
    { name: 'Storage', value: gasProfile.functionAnalyses.reduce((sum, f) => sum + f.breakdown.storageOperations, 0) },
    { name: 'External Calls', value: gasProfile.functionAnalyses.reduce((sum, f) => sum + f.breakdown.externalCalls, 0) },
    { name: 'Memory', value: gasProfile.functionAnalyses.reduce((sum, f) => sum + f.breakdown.memoryOperations, 0) },
    { name: 'Computation', value: gasProfile.functionAnalyses.reduce((sum, f) => sum + f.breakdown.computation, 0) },
  ].filter(item => item.value > 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Gas Profile
      </h3>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Top Gas-Consuming Functions
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="gas" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {breakdownData.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Gas Breakdown by Category
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={breakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {gasProfile.globalHints.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <AlertTriangle size={16} className="text-yellow-500" />
              Optimization Hints
            </h4>
            <div className="space-y-2">
              {gasProfile.globalHints.map((hint, index) => (
                <div
                  key={index}
                  className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                >
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                    {hint.category}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {hint.description}
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    💡 {hint.recommendation}
                  </p>
                  {hint.estimatedSavings > 0 && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      Estimated savings: {hint.estimatedSavings.toLocaleString()} gas
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gas Efficiency</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {gasProfile.efficiency}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Gas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {gasProfile.totalGas.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
