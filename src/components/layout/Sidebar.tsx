import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { calculateLongRunProgress } from '../../utils/progress';
import { formatDateRange } from '../../utils/dates';
import { ProgressBar } from '../ui';
import './Sidebar.css';

interface SidebarProps {
    onCreateLongRun: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCreateLongRun }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [hoverTimeout, setHoverTimeout] = useState<number | null>(null);

    const {
        longRuns,
        shortRuns,
        microRuns,
        tasks,
        selectedLongRunId,
        setSelectedLongRun,
    } = useStore();

    const handleMouseEnter = () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
        }
        if (!isLocked) {
            setIsExpanded(true);
        }
    };

    const handleMouseLeave = () => {
        if (!isLocked) {
            const timeout = setTimeout(() => {
                setIsExpanded(false);
            }, 300);
            setHoverTimeout(timeout);
        }
    };

    const toggleLock = () => {
        setIsLocked(!isLocked);
        if (!isLocked) {
            setIsExpanded(true);
        }
    };

    useEffect(() => {
        return () => {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
        };
    }, [hoverTimeout]);

    const getLongRunInitials = (title: string): string => {
        const words = title.split(' ');
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return title.substring(0, 2).toUpperCase();
    };

    return (
        <div
            className={`sidebar ${isExpanded ? 'sidebar--expanded' : 'sidebar--collapsed'} ${isLocked ? 'sidebar--locked' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Header */}
            <div className="sidebar-header">
                {isExpanded ? (
                    <div className="sidebar-brand">
                        <span className="brand-icon">⚡</span>
                        <span className="brand-text">HyperRun</span>
                    </div>
                ) : (
                    <div className="sidebar-brand-collapsed">
                        <span className="brand-icon">⚡</span>
                    </div>
                )}
            </div>

            {/* Long Runs List */}
            <div className="sidebar-content">
                {longRuns.length === 0 ? (
                    <div className="sidebar-empty">
                        {isExpanded && <p>No Long Runs yet</p>}
                    </div>
                ) : (
                    <div className="sidebar-list">
                        {longRuns.map((lr) => {
                            const progress = calculateLongRunProgress(lr, shortRuns, microRuns, tasks);
                            const isSelected = selectedLongRunId === lr.id;

                            return (
                                <div
                                    key={lr.id}
                                    className={`sidebar-item ${isSelected ? 'sidebar-item--selected' : ''}`}
                                    onClick={() => setSelectedLongRun(lr.id)}
                                >
                                    {isExpanded ? (
                                        <>
                                            <div
                                                className="sidebar-item-indicator"
                                                style={{ backgroundColor: lr.color }}
                                            />
                                            <div className="sidebar-item-content">
                                                <div className="sidebar-item-title">{lr.title}</div>
                                                <div className="sidebar-item-dates">
                                                    {formatDateRange(lr.startDate, lr.endDate)}
                                                </div>
                                                <ProgressBar value={progress.percentage} size="sm" />
                                            </div>
                                        </>
                                    ) : (
                                        <div
                                            className="sidebar-item-icon"
                                            style={{
                                                backgroundColor: lr.color,
                                                boxShadow: isSelected ? `0 0 0 2px var(--color-background), 0 0 0 4px ${lr.color}` : 'none'
                                            }}
                                            title={lr.title}
                                        >
                                            {getLongRunInitials(lr.title)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
                <button
                    className="sidebar-add-btn"
                    onClick={onCreateLongRun}
                    title="Create new Long Run"
                >
                    {isExpanded ? (
                        <>
                            <span className="add-icon">+</span>
                            <span>New Long Run</span>
                        </>
                    ) : (
                        <span className="add-icon-only">+</span>
                    )}
                </button>

                <button
                    className="sidebar-toggle-btn"
                    onClick={toggleLock}
                    title={isLocked ? 'Unlock sidebar' : 'Lock sidebar open'}
                >
                    {isExpanded ? (isLocked ? '📌' : '«') : '»'}
                </button>
            </div>
        </div>
    );
};
