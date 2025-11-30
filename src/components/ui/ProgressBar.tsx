import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
    value: number; // 0-100
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    size = 'md',
    showLabel = false,
    className = '',
}) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
        <div className={`progress-wrapper ${className}`}>
            <div className={`progress progress--${size}`}>
                <div
                    className="progress-fill"
                    style={{ width: `${clampedValue}%` }}
                    role="progressbar"
                    aria-valuenow={clampedValue}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
            {showLabel && (
                <span className="progress-label">{Math.round(clampedValue)}%</span>
            )}
        </div>
    );
};
