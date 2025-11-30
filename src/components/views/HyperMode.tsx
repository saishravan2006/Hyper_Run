import React, { useState } from 'react';
import { useStore } from '../../store';
import type { Task } from '../../types';
import { calculateShortRunProgress, getOverdueTasks } from '../../utils/progress';
import { formatDateRange, getTodayISO, isDateInRange } from '../../utils/dates';
import { ProgressBar, Button } from '../ui';
import { TaskForm } from '../forms/TaskForm';
import { MicroRunForm } from '../forms/MicroRunForm';
import { NotificationsModal } from './NotificationsModal';
import { HorizontalTimeline } from '../timeline/HorizontalTimeline';
import './HyperMode.css';

export const HyperMode: React.FC = () => {
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [isMicroRunFormOpen, setIsMicroRunFormOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [showOverdueAlert, setShowOverdueAlert] = useState(true);
    const [draggedDateRange, setDraggedDateRange] = useState<{ start: string; end: string } | null>(
        null
    );
    const [editingMicroRun, setEditingMicroRun] = useState<string | undefined>(undefined);

    const {
        selectedLongRunId,
        selectedShortRunId,
        longRuns,
        shortRuns,
        microRuns,
        tasks,
        updateTask,
        setMode,
    } = useStore();

    const selectedLongRun = longRuns.find((lr) => lr.id === selectedLongRunId);
    const selectedShortRun = shortRuns.find((sr) => sr.id === selectedShortRunId);
    const shortRunMicroRuns = microRuns
        .filter((mr) => mr.shortRunId === selectedShortRunId)
        .sort((a, b) => a.orderIndex - b.orderIndex);

    if (!selectedLongRun || !selectedShortRun) {
        return (
            <div className="hyper-mode hyper-mode--empty">
                <div className="empty-view">
                    <h2>Hyper Mode</h2>
                    <p>Please select a Short Run to focus on.</p>
                    <Button onClick={() => setMode('general')}>
                        ← Back to General Mode
                    </Button>
                </div>
            </div>
        );
    }

    // Get all tasks for this short run
    const directTasks = tasks.filter(
        (t) => t.parentType === 'shortRun' && t.parentId === selectedShortRun.id
    );

    const microRunTasks = tasks.filter(
        (t) =>
            t.parentType === 'microRun' &&
            shortRunMicroRuns.some((mr) => mr.id === t.parentId)
    );

    const allTasks = [...directTasks, ...microRunTasks];
    const overdueTasks = getOverdueTasks(allTasks);
    const progress = calculateShortRunProgress(selectedShortRun, microRuns, tasks);

    // Calculate notification count
    const today = getTodayISO();
    const activeMicroRunsCount = microRuns.filter(run =>
        isDateInRange(today, run.startDate, run.endDate)
    ).length;

    const activeTasksCount = tasks.filter(task => {
        if (task.status === 'done') return false;
        return task.dueDate && task.dueDate <= today;
    }).length;

    const notificationCount = activeMicroRunsCount + activeTasksCount;

    const handleToggleTask = (task: Task) => {
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        updateTask(task.id, { status: newStatus });
    };

    const handleTimelineRangeSelected = (startDate: string, endDate: string) => {
        setDraggedDateRange({ start: startDate, end: endDate });
        setEditingMicroRun(undefined);
        setIsMicroRunFormOpen(true);
    };

    const handleEditMicroRun = (segmentId: string) => {
        setEditingMicroRun(segmentId);
        setIsMicroRunFormOpen(true);
    };

    const timelineSegments = shortRunMicroRuns.map((mr) => ({
        id: mr.id,
        title: mr.title,
        startDate: mr.startDate,
        endDate: mr.endDate,
        color: selectedShortRun.color || selectedLongRun.color,
        progress: { completed: 0, total: 0, percentage: 0 }, // TODO: Calculate MicroRun progress
    }));

    const renderTaskCard = () => {
        return (
            <div className="task-card-content">
                <div className="task-card-header">
                    <h4>Tasks for this Short Run</h4>
                    <Button size="sm" onClick={() => setIsTaskFormOpen(true)}>
                        + Add Task
                    </Button>
                </div>

                {allTasks.length === 0 ? (
                    <div className="task-card-empty">
                        <p>No tasks yet. Add your first task to get started!</p>
                    </div>
                ) : (
                    <div className="task-list">
                        {allTasks.map((task) => (
                            <div key={task.id} className={`task-item ${task.status === 'done' ? 'task-item--done' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={task.status === 'done'}
                                    onChange={() => handleToggleTask(task)}
                                    className="task-checkbox"
                                />
                                <div className="task-content">
                                    <div className="task-title">{task.title}</div>
                                    {task.description && (
                                        <div className="task-description">{task.description}</div>
                                    )}
                                    {task.dueDate && (
                                        <div className={`task-due ${overdueTasks.some((t) => t.id === task.id) ? 'task-due--overdue' : ''}`}>
                                            Due: {task.dueDate}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="hyper-mode">
            {/* Header */}
            <div className="hyper-header">
                <Button variant="ghost" onClick={() => setMode('general')}>
                    ← {selectedLongRun.title}
                </Button>
                <div className="hyper-title-section">
                    <h2>{selectedShortRun.title}</h2>
                    <p className="hyper-subtitle">
                        {formatDateRange(selectedShortRun.startDate, selectedShortRun.endDate)}
                    </p>
                    <ProgressBar value={progress.percentage} size="md" showLabel />
                </div>
            </div>

            {/* Overdue Alert */}
            {showOverdueAlert && overdueTasks.length > 0 && (
                <div className="alert alert-warning">
                    <div className="alert-content">
                        <strong>⚠️ {overdueTasks.length} task{overdueTasks.length > 1 ? 's are' : ' is'} overdue</strong>
                        <p>Choose to reschedule or mark them as done to stay on track.</p>
                    </div>
                    <button className="alert-close" onClick={() => setShowOverdueAlert(false)}>×</button>
                </div>
            )}

            {/* Timeline with Micro Runs */}
            <div className="hyper-timeline">
                <HorizontalTimeline
                    title="Micro Runs"
                    startDate={selectedShortRun.startDate}
                    endDate={selectedShortRun.endDate}
                    segments={timelineSegments}
                    onRangeSelected={handleTimelineRangeSelected}
                    onEditSegment={handleEditMicroRun}
                >
                    {renderTaskCard()}
                </HorizontalTimeline>
            </div>

            {/* Notification Icon */}
            <div
                className="notification-icon"
                title="Notifications"
                onClick={() => setIsNotificationsOpen(true)}
            >
                🔔
                {notificationCount > 0 && (
                    <span className="notification-badge">{notificationCount}</span>
                )}
            </div>

            <TaskForm
                isOpen={isTaskFormOpen}
                onClose={() => setIsTaskFormOpen(false)}
                parentId={selectedShortRun.id}
                parentType="shortRun"
            />

            <MicroRunForm
                isOpen={isMicroRunFormOpen}
                onClose={() => {
                    setIsMicroRunFormOpen(false);
                    setDraggedDateRange(null);
                    setEditingMicroRun(undefined);
                }}
                shortRunId={selectedShortRun.id}
                microRun={editingMicroRun ? microRuns.find(mr => mr.id === editingMicroRun) : undefined}
                defaultStartDate={draggedDateRange?.start}
                defaultEndDate={draggedDateRange?.end}
                minDate={selectedShortRun.startDate}
                maxDate={selectedShortRun.endDate}
            />

            <NotificationsModal
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
            />
        </div>
    );
};
