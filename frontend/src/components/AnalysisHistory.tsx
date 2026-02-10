'use client';

import { useState, useEffect } from 'react';
import { History, Trash2, Clock, ExternalLink } from 'lucide-react';

export interface HistoryItem {
    txHash: string;
    timestamp: number;
    gasUsed?: number;
    vulnerabilityCount?: number;
}

interface AnalysisHistoryProps {
    onSelectHistory: (txHash: string) => void;
    currentTxHash?: string;
}

const HISTORY_KEY = 'evm-debugger-history';
const MAX_HISTORY_ITEMS = 10;

export function getHistory(): HistoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function addToHistory(item: HistoryItem): void {
    if (typeof window === 'undefined') return;
    try {
        let history = getHistory();
        // 去重：如果已存在相同 txHash，先移除旧的
        history = history.filter(h => h.txHash.toLowerCase() !== item.txHash.toLowerCase());
        // 添加到开头
        history.unshift(item);
        // 限制数量
        if (history.length > MAX_HISTORY_ITEMS) {
            history = history.slice(0, MAX_HISTORY_ITEMS);
        }
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
        // 忽略 localStorage 错误
    }
}

export function clearHistory(): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch {
        // 忽略错误
    }
}

export default function AnalysisHistory({ onSelectHistory, currentTxHash }: AnalysisHistoryProps) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);

    // 加载历史记录
    useEffect(() => {
        setHistory(getHistory());

        // 监听 storage 事件以同步多标签页
        const handleStorage = () => setHistory(getHistory());
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // 当 currentTxHash 变化时刷新历史
    useEffect(() => {
        setHistory(getHistory());
    }, [currentTxHash]);

    const handleClear = () => {
        clearHistory();
        setHistory([]);
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const truncateHash = (hash: string) => {
        return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
    };

    if (history.length === 0) {
        return null;
    }

    return (
        <div className="max-w-2xl mx-auto mt-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                {/* 标题栏 */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <History size={18} />
                        <span className="font-medium">Recent Analyses</span>
                        <span className="text-sm text-gray-500">({history.length})</span>
                    </div>
                    <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* 历史列表 */}
                {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700">
                        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                            {history.map((item, index) => (
                                <li
                                    key={`${item.txHash}-${index}`}
                                    className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors
                    ${currentTxHash?.toLowerCase() === item.txHash.toLowerCase()
                                            ? 'bg-primary-50 dark:bg-primary-900/20 border-l-2 border-primary-500'
                                            : ''}`}
                                    onClick={() => onSelectHistory(item.txHash)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <code className="text-sm font-mono text-primary-600 dark:text-primary-400">
                                                {truncateHash(item.txHash)}
                                            </code>
                                            <a
                                                href={`https://etherscan.io/tx/${item.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-gray-400 hover:text-primary-500"
                                                title="View on Etherscan"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            {item.gasUsed && (
                                                <span className="hidden sm:inline">⛽ {item.gasUsed.toLocaleString()}</span>
                                            )}
                                            {item.vulnerabilityCount !== undefined && item.vulnerabilityCount > 0 && (
                                                <span className="text-red-500">⚠️ {item.vulnerabilityCount}</span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {formatTime(item.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {/* 清除按钮 */}
                        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClear();
                                }}
                                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-colors"
                            >
                                <Trash2 size={14} />
                                Clear history
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
