import React, { useState } from 'react';
import { useStore } from '../../store';
import { calculateShortRunProgress } from '../../utils/progress';
import { Button } from '../ui';
import { ShortRunForm } from '../forms/ShortRunForm';
import { HorizontalTimeline } from '../timeline/HorizontalTimeline';
import './GeneralMode.css';

export const GeneralMode: React.FC = () => {
    const [isShortRunFormOpen, setIsShortRunFormOpen] = useState(false);
    const [draggedDateRange, setDraggedDateRange] = useState<{ start: string; end: string } | null>(
        null
    );
    const [editingShortRun, setEditingShortRun] = useState<string | undefined>(undefined);

    const {
        selectedLongRunId,
        longRuns,
        shortRuns,
        microRuns,
        tasks,
        setSelectedShortRun,
        setMode,
    } = useStore();

    const selectedLongRun = longRuns.find((lr) => lr.id === selectedLongRunId);
    const longRunShortRuns = shortRuns
        .filter((sr) => sr.longRunId === selectedLongRunId)
        .sort((a, b) => a.orderIndex - b.orderIndex);

    const handleSegmentClick = (segmentId: string) => {
        setSelectedShortRun(segmentId);
        setMode('hyper');
    };

    const handleEditShortRun = (segmentId: string) => {
        setEditingShortRun(segmentId);
        setIsShortRunFormOpen(true);
    };

    const handleTimelineRangeSelected = (startDate: string, endDate: string) => {
        setDraggedDateRange({ start: startDate, end: endDate });
        setEditingShortRun(undefined);
        setIsShortRunFormOpen(true);
    };

    if (!selectedLongRun) {
        return (
            <div className="general-mode general-mode--empty">
                <div className="empty-view">
                    <h2>Welcome to HyperRun</h2>
                    <p>Select a Long Run from the sidebar to get started, or create a new one.</p>
                </div>
            </div>
        );
    }

    const timelineSegments = longRunShortRuns.map((sr) => ({
        id: sr.id,
        title: sr.title,
        startDate: sr.startDate,
        endDate: sr.endDate,
        color: sr.color || selectedLongRun.color,
        progress: calculateShortRunProgress(sr, microRuns, tasks),
    }));

    return (
        <div className="general-mode">
            {longRunShortRuns.length === 0 ? (
                <div className="general-empty">
                    <div className="empty-icon">📅</div>
                    <h3>No Short Runs Yet</h3>
                    <p>Short Runs are the key phases or milestones within this Long Run.</p>
                    <p className="hint">Drag on the timeline bar to create your first one!</p>
                    <Button variant="primary" onClick={() => {
                        setEditingShortRun(undefined);
                        setIsShortRunFormOpen(true);
                    }}>
                        + Create First Short Run
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            import('../../utils/seed').then(({ seedStressTest }) => {
                                const { addLongRun, addShortRun, setSelectedLongRun } = useStore.getState();
                                const id = seedStressTest(addLongRun, addShortRun);
                                setSelectedLongRun(id);
                            });
                        }}
                        style={{ marginTop: 'var(--space-md)' }}
                    >
                        🌱 Seed Stress Test
                    </Button>
                </div>
            ) : (
                <>
                    <HorizontalTimeline
                        title={selectedLongRun.title}
                        startDate={selectedLongRun.startDate}
                        endDate={selectedLongRun.endDate}
                        segments={timelineSegments}
                        onSegmentClick={handleSegmentClick}
                        onEditSegment={handleEditShortRun}
                        onRangeSelected={handleTimelineRangeSelected}
                    />

                    <div className="general-footer">
                        <Button variant="secondary" onClick={() => {
                            setEditingShortRun(undefined);
                            setIsShortRunFormOpen(true);
                        }}>
                            + Add Short Run
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                import('../../utils/seed').then(({ seedStressTest }) => {
                                    const { addLongRun, addShortRun, setSelectedLongRun } = useStore.getState();
                                    const id = seedStressTest(addLongRun, addShortRun);
                                    setSelectedLongRun(id);
                                });
                            }}
                        >
                            🌱 Seed Stress Test
                        </Button>
                    </div>
                </>
            )}

            <ShortRunForm
                isOpen={isShortRunFormOpen}
                onClose={() => {
                    setIsShortRunFormOpen(false);
                    setDraggedDateRange(null);
                    setEditingShortRun(undefined);
                }}
                longRunId={selectedLongRun.id}
                shortRun={editingShortRun ? shortRuns.find(sr => sr.id === editingShortRun) : undefined}
                defaultStartDate={draggedDateRange?.start}
                defaultEndDate={draggedDateRange?.end}
                minDate={selectedLongRun.startDate}
                maxDate={selectedLongRun.endDate}
            />
        </div>
    );
};
