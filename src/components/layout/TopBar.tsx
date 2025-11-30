import React from 'react';
import { useStore } from '../../store';
import type { Mode } from '../../types';
import './TopBar.css';

export const TopBar: React.FC = () => {
    const { currentMode, setMode, selectedLongRunId, longRuns, user, updateUserSettings } = useStore();

    const selectedLongRun = longRuns.find((lr) => lr.id === selectedLongRunId);
    const isDark = user?.settings.theme === 'dark';

    const handleModeChange = (mode: Mode) => {
        setMode(mode);
    };

    const toggleTheme = () => {
        const newTheme = isDark ? 'light' : 'dark';
        updateUserSettings({ theme: newTheme });
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <div className="topbar">
            <div className="topbar-left">
                {selectedLongRun && (
                    <div className="topbar-breadcrumb">
                        <h1>{selectedLongRun.title}</h1>
                    </div>
                )}
            </div>

            <div className="topbar-center">
                <div className="mode-toggle">
                    <button
                        className={`mode-toggle-btn ${currentMode === 'general' ? 'mode-toggle-btn--active' : ''}`}
                        onClick={() => handleModeChange('general')}
                    >
                        General Mode
                    </button>
                    <button
                        className={`mode-toggle-btn ${currentMode === 'hyper' ? 'mode-toggle-btn--active' : ''}`}
                        onClick={() => handleModeChange('hyper')}
                    >
                        Hyper Mode
                    </button>
                </div>
            </div>

            <div className="topbar-right">
                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                >
                    {isDark ? '☀️' : '🌙'}
                </button>
            </div>
        </div>
    );
};
