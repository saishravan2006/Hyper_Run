import React, { useState } from 'react';
import { useStore } from '../../store';
import type { LongRun } from '../../types';
import { generateLongRunId } from '../../utils/id';
import { getTodayISO, getRelativeDate } from '../../utils/dates';
import { Modal, Button, Input, TextArea } from '../ui';

interface LongRunFormProps {
    isOpen: boolean;
    onClose: () => void;
    longRun?: LongRun;
}

const PRESET_COLORS = [
    '#6366f1', // Indigo
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#06b6d4', // Cyan
];

export const LongRunForm: React.FC<LongRunFormProps> = ({
    isOpen,
    onClose,
    longRun,
}) => {
    const { addLongRun, updateLongRun } = useStore();
    const isEditing = !!longRun;

    const [title, setTitle] = useState(longRun?.title || '');
    const [description, setDescription] = useState(longRun?.description || '');
    const [startDate, setStartDate] = useState(longRun?.startDate || getTodayISO());
    const [endDate, setEndDate] = useState(longRun?.endDate || getRelativeDate(90));
    const [color, setColor] = useState(longRun?.color || PRESET_COLORS[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('Please enter a title');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            alert('Start date must be before end date');
            return;
        }

        if (isEditing && longRun) {
            updateLongRun(longRun.id, {
                title: title.trim(),
                description: description.trim(),
                startDate,
                endDate,
                color,
            });
        } else {
            const newLongRun: LongRun = {
                id: generateLongRunId(),
                title: title.trim(),
                description: description.trim(),
                startDate,
                endDate,
                status: 'not_started',
                color,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            addLongRun(newLongRun);
        }

        onClose();
    };

    const handleClose = () => {
        if (!isEditing) {
            setTitle('');
            setDescription('');
            setStartDate(getTodayISO());
            setEndDate(getRelativeDate(90));
            setColor(PRESET_COLORS[0]);
        }
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEditing ? 'Edit Long Run' : 'Create New Long Run'}
            size="md"
            footer={
                <>
                    <Button variant="ghost" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        {isEditing ? 'Save Changes' : 'Create Long Run'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="longrun-form">
                <Input
                    label="Title *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Launch my SaaS product"
                    fullWidth
                    autoFocus
                />

                <TextArea
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this long run aim to achieve?"
                    rows={3}
                    fullWidth
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    <Input
                        label="Start Date *"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        fullWidth
                    />

                    <Input
                        label="End Date *"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        fullWidth
                    />
                </div>

                <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', display: 'block', marginBottom: 'var(--space-sm)' }}>
                        Color
                    </label>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                        {PRESET_COLORS.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: 'var(--radius-md)',
                                    border: color === c ? '3px solid var(--color-primary)' : '2px solid var(--color-border)',
                                    backgroundColor: c,
                                    cursor: 'pointer',
                                    transition: 'all var(--transition-fast)',
                                    transform: color === c ? 'scale(1.1)' : 'scale(1)',
                                }}
                            />
                        ))}
                    </div>
                </div>
            </form>
        </Modal>
    );
};
