import React, { useState, useRef, useCallback, useEffect } from 'react';
import { parseISO, differenceInDays, addDays, format } from 'date-fns';
import { toISODate } from '../../utils/dates';
import './DraggableTimeline.css';

interface DraggableTimelineProps {
    startDate: string;
    endDate: string;
    onRangeSelected: (startDate: string, endDate: string) => void;
    children: React.ReactNode;
}

export const DraggableTimeline: React.FC<DraggableTimelineProps> = ({
    startDate,
    endDate,
    onRangeSelected,
    children,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<number>(0);
    const [dragCurrent, setDragCurrent] = useState<number>(0);
    const lineRef = useRef<HTMLDivElement>(null);

    const calculateDateFromPosition = useCallback(
        (clientX: number): Date => {
            if (!lineRef.current) return parseISO(startDate);

            const rect = lineRef.current.getBoundingClientRect();
            const relativeX = clientX - rect.left;
            const percentage = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));

            const start = parseISO(startDate);
            const end = parseISO(endDate);
            const totalDays = differenceInDays(end, start);
            const daysFromStart = Math.round((percentage / 100) * totalDays);

            return addDays(start, daysFromStart);
        },
        [startDate, endDate]
    );

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!lineRef.current) return;

        // Only start drag on the timeline line itself  
        // const target = e.target as HTMLElement;
        // Allow dragging on the container or the line itself
        // if (!target.classList.contains('timeline-line')) return;

        e.preventDefault();
        setIsDragging(true);
        setDragStart(e.clientX);
        setDragCurrent(e.clientX);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        setDragCurrent(e.clientX);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);

        const distance = Math.abs(dragCurrent - dragStart);

        // Minimum drag threshold (5px)
        if (distance < 5) {
            // Default to 7 days for small drags
            const clickDate = calculateDateFromPosition(dragStart);
            const defaultEndDate = addDays(clickDate, 7);
            onRangeSelected(toISODate(clickDate), toISODate(defaultEndDate));
        } else {
            const date1 = calculateDateFromPosition(dragStart);
            const date2 = calculateDateFromPosition(dragCurrent);

            // Ensure start is before end
            const actualStart = date1 < date2 ? date1 : date2;
            const actualEnd = date1 < date2 ? date2 : date1;

            onRangeSelected(toISODate(actualStart), toISODate(actualEnd));
        }

        setDragStart(0);
        setDragCurrent(0);
    }, [dragStart, dragCurrent, calculateDateFromPosition, onRangeSelected]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const getDragHighlight = () => {
        if (!isDragging || !lineRef.current) return null;

        const rect = lineRef.current.getBoundingClientRect();
        const start = Math.min(dragStart, dragCurrent) - rect.left;
        const end = Math.max(dragStart, dragCurrent) - rect.left;
        const width = end - start;

        const startPercentage = (start / rect.width) * 100;
        const widthPercentage = (width / rect.width) * 100;

        return { left: `${startPercentage}%`, width: `${widthPercentage}%` };
    };

    const getTooltipContent = () => {
        if (!isDragging) return null;

        const date1 = calculateDateFromPosition(dragStart);
        const date2 = calculateDateFromPosition(dragCurrent);
        const actualStart = date1 < date2 ? date1 : date2;
        const actualEnd = date1 < date2 ? date2 : date1;

        return {
            start: format(actualStart, 'MMM dd, yyyy'),
            end: format(actualEnd, 'MMM dd, yyyy'),
        };
    };

    const highlight = getDragHighlight();
    const tooltip = getTooltipContent();

    return (
        <div className="draggable-timeline">
            <div ref={lineRef} className="draggable-timeline-line" onMouseDown={handleMouseDown}>
                {children}

                {isDragging && highlight && (
                    <div
                        className="drag-highlight"
                        style={{
                            left: highlight.left,
                            width: highlight.width,
                        }}
                    />
                )}

                {isDragging && tooltip && highlight && (
                    <>
                        <div
                            className="drag-date-label"
                            style={{
                                left: highlight.left,
                                transform: 'translateX(-50%)',
                            }}
                        >
                            <div className="drag-label-content">{tooltip.start}</div>
                            <div className="drag-label-arrow" />
                        </div>
                        <div
                            className="drag-date-label"
                            style={{
                                left: `calc(${highlight.left} + ${highlight.width})`,
                                transform: 'translateX(-50%)',
                            }}
                        >
                            <div className="drag-label-content">{tooltip.end}</div>
                            <div className="drag-label-arrow" />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
