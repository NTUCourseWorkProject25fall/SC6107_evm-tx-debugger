'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>('system');
    const [mounted, setMounted] = useState(false);

    // 初始化主题
    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem('theme') as Theme | null;
        if (stored) {
            setTheme(stored);
        }
    }, []);

    // 应用主题
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;

        if (theme === 'system') {
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.toggle('dark', systemDark);
        } else {
            root.classList.toggle('dark', theme === 'dark');
        }

        localStorage.setItem('theme', theme);
    }, [theme, mounted]);

    // 监听系统主题变化
    useEffect(() => {
        if (!mounted) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                document.documentElement.classList.toggle('dark', mediaQuery.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, mounted]);

    const cycleTheme = () => {
        const themes: Theme[] = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    // 防止服务端渲染不匹配
    if (!mounted) {
        return (
            <button className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 w-10 h-10" aria-label="Theme toggle">
                <span className="sr-only">Loading theme</span>
            </button>
        );
    }

    const getIcon = () => {
        switch (theme) {
            case 'light':
                return <Sun size={20} className="text-yellow-500" />;
            case 'dark':
                return <Moon size={20} className="text-blue-400" />;
            case 'system':
                return <Monitor size={20} className="text-gray-500 dark:text-gray-400" />;
        }
    };

    const getLabel = () => {
        switch (theme) {
            case 'light':
                return 'Light mode';
            case 'dark':
                return 'Dark mode';
            case 'system':
                return 'System theme';
        }
    };

    return (
        <button
            onClick={cycleTheme}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 
                 transition-colors flex items-center gap-2"
            aria-label={`Current theme: ${getLabel()}. Click to change.`}
            title={getLabel()}
        >
            {getIcon()}
            <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300">
                {getLabel()}
            </span>
        </button>
    );
}
