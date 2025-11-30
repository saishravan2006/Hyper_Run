import React from 'react';
import { parseISO, differenceInDays } from 'date-fns';
import { DraggableTimeline } from './DraggableTimeline';
import './HorizontalTimeline.css';

interface TimelineSegment {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    color?: string;
    progress?: { completed: number; total: number; percentage: number };
}

interface HorizontalTimelineProps {
    title: string;
    startDate: string;
    endDate: string;
    segments: TimelineSegment[];
    onSegmentClick?: (segmentId: string) => void;
    onEditSegment?: (segmentId: string) => void;
    onRangeSelected?: (startDate: string, endDate: string) => void;
    children?: React.ReactNode;
}

export const HorizontalTimeline: React.FC<HorizontalTimelineProps> = ({
    title,
    startDate,
    endDate,
    segments,
    onSegmentClick,
    onEditSegment,
    onRangeSelected,
    children,
}) => {
    const calculatePosition = (segmentStartDate: string): number => {
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        const segStart = parseISO(segmentStartDate);

        const totalDays = differenceInDays(end, start);
        const daysFromStart = differenceInDays(segStart, start);

        if (totalDays === 0) return 0;
        return Math.max(0, Math.min(100, (daysFromStart / totalDays) * 100));
    };

    const calculateWidth = (segStartDate: string, segEndDate: string): number => {
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        const segStart = parseISO(segStartDate);
        const segEnd = parseISO(segEndDate);

        const totalDays = differenceInDays(end, start);
        const segmentDays = differenceInDays(segEnd, segStart);

        if (totalDays === 0) return 10;
        return Math.max(10, Math.min(100, (segmentDays / totalDays) * 100));
    };

    const handleRangeSelected = (rangeStart: string, rangeEnd: string) => {
        onRangeSelected?.(rangeStart, rangeEnd);
    };

    // Smart packing algorithm to assign lanes
    const assignLanes = (segments: TimelineSegment[]): (TimelineSegment & { laneIndex: number })[] => {
        // Sort by start date
        const sortedSegments = [...segments].sort((a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );

        const lanes: { endDate: number }[] = [];
        const processedSegments: (TimelineSegment & { laneIndex: number })[] = [];

        sortedSegments.forEach(segment => {
            const segmentStart = new Date(segment.startDate).getTime();
            const segmentEnd = new Date(segment.endDate).getTime();

            let assignedLane = -1;

            // Find the first lane where this segment fits
            for (let i = 0; i < lanes.length; i++) {
                // Add a small buffer (e.g., 1 day) to avoid visual crowding
                if (lanes[i].endDate < segmentStart) {
                    assignedLane = i;
                    lanes[i].endDate = segmentEnd;
                    break;
                }
            }

            // If no lane found, create a new one
            if (assignedLane === -1) {
                assignedLane = lanes.length;
                lanes.push({ endDate: segmentEnd });
            }

            processedSegments.push({ ...segment, laneIndex: assignedLane });
        });

        return processedSegments;
    };

    const processedSegments = assignLanes(segments);
    const LANE_HEIGHT = 80;
    const BASE_OFFSET = 40; // Distance from timeline base to first lane

    const [longPressTimer, setLongPressTimer] = React.useState<NodeJS.Timeout | null>(null);
    const isLongPress = React.useRef(false);

    const handleSegmentMouseDown = (segmentId: string, e: React.MouseEvent | React.TouchEvent) => {
        // Only left click or touch
        if ('button' in e && e.button !== 0) return;

        isLongPress.current = false;
        const timer = setTimeout(() => {
            isLongPress.current = true;
            if (onEditSegment) {
                onEditSegment(segmentId);
            }
        }, 500);
        setLongPressTimer(timer);
    };

    const handleSegmentMouseUp = (segmentId: string, e: React.MouseEvent | React.TouchEvent) => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }

        // If it wasn't a long press, treat as click
        if (!isLongPress.current) {
            onSegmentClick?.(segmentId);
        }
        // Reset flag
        isLongPress.current = false;
    };

    const handleSegmentLeave = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
        isLongPress.current = false;
    };

    return (
        <div className="horizontal-timeline">
            {title && (
                <div className="timeline-header">
                    <h2 className="timeline-title">{title}</h2>
                </div>
            )}

            <div className="timeline-container">
                <div className="timeline-scroll">
                    {/* Main timeline bar */}
                    <div className="timeline-base">
                        <DraggableTimeline
                            startDate={startDate}
                            endDate={endDate}
                            onRangeSelected={handleRangeSelected}
                        >
                            <div className="timeline-line" />
                        </DraggableTimeline>
                        <div className="timeline-date-label timeline-date-start">
                            {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="timeline-date-label timeline-date-end">
                            {new Date(endDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </div>
                    </div>

                    {/* Short Run bars below timeline */}
                    <div
                        className="timeline-bars-area"
                        style={{ height: `${Math.max(400, processedSegments.length * LANE_HEIGHT + 100)}px` }}
                    >
                        {processedSegments.map((segment) => {
                            const left = calculatePosition(segment.startDate);
                            const width = calculateWidth(segment.startDate, segment.endDate);
                            const top = segment.laneIndex * LANE_HEIGHT;

                            // Calculate connector height to reach the timeline base
                            // The timeline base bottom is roughly at -BASE_OFFSET from the first lane top
                            const connectorHeight = top + BASE_OFFSET;

                            return (
                                <div
                                    key={segment.id}
                                    className="short-run-bar"
                                    style={{
                                        left: `${left}%`,
                                        width: `${width}%`,
                                        top: `${top}px`,
                                    }}
                                    onMouseDown={(e) => handleSegmentMouseDown(segment.id, e)}
                                    onMouseUp={(e) => handleSegmentMouseUp(segment.id, e)}
                                    onMouseLeave={handleSegmentLeave}
                                    onTouchStart={(e) => handleSegmentMouseDown(segment.id, e)}
                                    onTouchEnd={(e) => handleSegmentMouseUp(segment.id, e)}
                                >
                                    {/* Connector line from timeline */}
                                    <div
                                        className="bar-connector"
                                        style={{
                                            height: `${connectorHeight}px`,
                                            top: `-${connectorHeight}px`
                                        }}
                                    />

                                    {/* The horizontal bar itself */}
                                    <div
                                        className="bar-strip"
                                        style={{ backgroundColor: segment.color || '#6366f1' }}
                                    >
                                        <div className="bar-content">
                                            <div className="bar-header">
                                                <div className="bar-title">{segment.title}</div>
                                                {onEditSegment && (
                                                    <button
                                                        className="bar-edit-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEditSegment(segment.id);
                                                        }}
                                                        title="Edit Short Run"
                                                    >
                                                        ✎
                                                    </button>
                                                )}
                                            </div>
                                            <div className="bar-dates">
                                                {new Date(segment.startDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                                {' - '}
                                                {new Date(segment.endDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </div>
                                            {segment.progress && (
                                                <div className="bar-progress">
                                                    {segment.progress.completed}/{segment.progress.total} tasks
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};
