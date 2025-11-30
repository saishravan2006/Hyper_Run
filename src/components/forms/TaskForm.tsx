import React, { useState } from 'react';
import { useStore } from '../../store';
import type { Task, Priority, ParentType } from '../../types';
import { generateTaskId } from '../../utils/id';
import { Modal, Button, Input, TextArea } from '../ui';

interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    parentId: string;
    parentType: ParentType;
    task?: Task;
    defaultEndDate?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
    isOpen,
    onClose,
    parentId,
    parentType,
    task,
    defaultEndDate,
}) => {
    const { addTask, updateTask } = useStore();
    const isEditing = !!task;

    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [priority, setPriority] = useState<Priority>(task?.priority || 'medium');
    const [dueDate, setDueDate] = useState(task?.dueDate || defaultEndDate || '');
    const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(
        task?.estimatedDurationMinutes?.toString() || ''
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('Please enter a task title');
            return;
        }

        if (isEditing && task) {
            updateTask(task.id, {
                title: title.trim(),
                description: description.trim(),
                priority,
                dueDate: dueDate || undefined,
                estimatedDurationMinutes: estimatedDurationMinutes
                    ? parseInt(estimatedDurationMinutes)
                    : undefined,
            });
        } else {
            const newTask: Task = {
                id: generateTaskId(),
                parentType,
                parentId,
                title: title.trim(),
                description: description.trim(),
                status: 'todo',
                priority,
                dueDate: dueDate || undefined,
                estimatedDurationMinutes: estimatedDurationMinutes
                    ? parseInt(estimatedDurationMinutes)
                    : undefined,
                createdAt: new Date().toISOString(),
            };
            addTask(newTask);
        }

        handleClose();
    };

    const handleClose = () => {
        if (!isEditing) {
            setTitle('');
            setDescription('');
            setPriority('medium');
            setDueDate('');
            setEstimatedDurationMinutes('');
        }
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEditing ? 'Edit Task' : 'Create New Task'}
            size="md"
            footer={
                <>
                    <Button variant="ghost" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        {isEditing ? 'Save Changes' : 'Create Task'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <Input
                    label="Title *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Design landing page"
                    fullWidth
                    autoFocus
                />

                <TextArea
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Additional details about this task..."
                    rows={3}
                    fullWidth
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    <div>
                        <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', display: 'block', marginBottom: 'var(--space-xs)' }}>
                            Priority
                        </label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as Priority)}
                            style={{
                                width: '100%',
                                padding: 'var(--space-sm) var(--space-md)',
                                fontFamily: 'var(--font-family)',
                                fontSize: 'var(--font-size-base)',
                                color: 'var(--color-text-primary)',
                                backgroundColor: 'var(--color-background)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                            }}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <Input
                        label="Due Date"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        fullWidth
                    />
                </div>

                <Input
                    label="Estimated Duration (minutes)"
                    type="number"
                    value={estimatedDurationMinutes}
                    onChange={(e) => setEstimatedDurationMinutes(e.target.value)}
                    placeholder="e.g. 120"
                    fullWidth
                />
            </form>
        </Modal>
    );
};
