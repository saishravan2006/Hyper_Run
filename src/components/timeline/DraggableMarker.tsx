import React, { useState, useRef } from 'react';
import './DraggableMarker.css';

interface DraggableMarkerProps {
    color?: string;
    onDragComplete?: () => void;
    children?: React.ReactNode;
}

export const DraggableMarker: React.FC<DraggableMarkerProps> = ({
    color,
    onDragComplete,
    children,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragDistance, setDragDistance] = useState(0);
    const markerRef = useRef<HTMLDivElement>(null);
    const startY = useRef<number>(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        startY.current = e.clientY;
        setDragDistance(0);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        const distance = Math.max(0, e.clientY - startY.current);
        setDragDistance(distance);
    };

    const handleMouseUp = () => {
        if (!isDragging) return;

        setIsDragging(false);

        // Only trigger if dragged down at least 30px
        if (dragDistance > 30 && onDragComplete) {
            onDragComplete();
        }

        setDragDistance(0);
    };

    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragDistance]);

    return (
        <div
            ref={markerRef}
            className={`draggable-marker ${isDragging ? 'draggable-marker--dragging' : ''}`}
            onMouseDown={handleMouseDown}
        >
            {/* Vertical line */}
            <div
                className="draggable-marker-line"
                style={{ borderColor: color }}
            />

            {/* Intersection dot */}
            <div
                className="draggable-marker-dot"
                style={{ backgroundColor: color }}
            />

            {/* Ghost placeholder during drag */}
            {isDragging && dragDistance > 10 && (
                <div
                    className="drag-ghost"
                    style={{
                        top: `${dragDistance}px`,
                    }}
                >
                    <div className="drag-ghost-card">
                        <div className="drag-ghost-label">Create new task...</div>
                        <div className="drag-ghost-indicator" />
                    </div>
                </div>
            )}

            {/* Cursor label */}
            {isDragging && (
                <div
                    className="drag-cursor-label"
                    style={{
                        top: `${dragDistance + 20}px`,
                        left: '30px',
                    }}
                >
                    ✨ Create new task
                </div>
            )}

            {children}
        </div>
    );
};
