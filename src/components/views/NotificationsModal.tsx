import React from 'react';
import { Modal } from '../ui/Modal';
import { useStore } from '../../store';
import { getTodayISO, isDateInRange } from '../../utils/dates';
import './NotificationsModal.css';

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
    const { microRuns, tasks, updateTask } = useStore();
    const today = getTodayISO();

    // Filter Micro Runs active today
    const activeMicroRuns = microRuns.filter(run =>
        isDateInRange(today, run.startDate, run.endDate)
    );

    const activeMicroRunIds = new Set(activeMicroRuns.map(mr => mr.id));

    // Filter Tasks:
    // 1. Due today or overdue
    // 2. OR belonging to a Micro Run that is active today
    // 3. INCLUDE completed tasks if they meet the above criteria
    const activeTasks = tasks.filter(task => {
        // Check date/context criteria first
        let matchesCriteria = false;

        // Explicit due date
        if (task.dueDate && task.dueDate <= today) matchesCriteria = true;
        // Implicitly due (part of active Micro Run)
        else if (task.parentType === 'microRun' && activeMicroRunIds.has(task.parentId)) matchesCriteria = true;
        // Implicitly due (Short Run task, but Short Run has active Micro Run today)
        else if (task.parentType === 'shortRun') {
            const shortRunHasActiveMicroRun = activeMicroRuns.some(mr => mr.shortRunId === task.parentId);
            if (shortRunHasActiveMicroRun) matchesCriteria = true;
        }

        return matchesCriteria;
    });

    const handleToggleTask = (taskId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'done' ? 'todo' : 'done';
        updateTask(taskId, { status: newStatus });
    };

    const hasWork = activeMicroRuns.length > 0 || activeTasks.length > 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Today's Focus"
            size="md"
        >
            <div className="notifications-modal-content">
                {!hasWork && (
                    <div className="notification-empty">
                        No active work scheduled for today. Enjoy your freedom!
                    </div>
                )}

                {activeMicroRuns.length > 0 && (
                    <div className="notification-section">
                        <div className="notification-section-title">Active Micro Runs</div>
                        <div className="notification-list">
                            {activeMicroRuns.map(run => (
                                <div key={run.id} className="notification-item">
                                    <div className="notification-item-content">
                                        <div className="notification-item-title">{run.title}</div>
                                        <div className="notification-item-subtitle">
                                            {new Date(run.startDate).toLocaleDateString()} - {new Date(run.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <span className="notification-tag">Micro Run</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTasks.length > 0 && (
                    <div className="notification-section">
                        <div className="notification-section-title">Tasks Due</div>
                        <div className="notification-list">
                            {activeTasks.map(task => (
                                <div key={task.id} className={`notification-item ${task.status === 'done' ? 'notification-item--done' : ''}`}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                        <input
                                            type="checkbox"
                                            checked={task.status === 'done'}
                                            onChange={() => handleToggleTask(task.id, task.status)}
                                            className="notification-checkbox"
                                        />
                                        <div className="notification-item-content">
                                            <div className="notification-item-title">{task.title}</div>
                                            <div className="notification-item-subtitle">
                                                Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="notification-tag" style={{
                                        backgroundColor: task.status !== 'done' && task.dueDate && task.dueDate < today ? 'rgba(239, 68, 68, 0.2)' : undefined,
                                        color: task.status !== 'done' && task.dueDate && task.dueDate < today ? '#fca5a5' : undefined,
                                        opacity: task.status === 'done' ? 0.5 : 1
                                    }}>
                                        {task.status === 'done' ? 'Done' : (task.dueDate && task.dueDate < today ? 'Overdue' : 'Due Today')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
