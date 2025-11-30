import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import type { ShortRun } from '../../types';
import { generateShortRunId } from '../../utils/id';
import { getTodayISO, getRelativeDate } from '../../utils/dates';
import { Modal, Button, Input, TextArea } from '../ui';

interface ShortRunFormProps {
    isOpen: boolean;
    onClose: () => void;
    longRunId: string;
    shortRun?: ShortRun;
    defaultStartDate?: string;
    defaultEndDate?: string;
    minDate?: string;
    maxDate?: string;
}

export const ShortRunForm: React.FC<ShortRunFormProps> = ({
    isOpen,
    onClose,
    longRunId,
    shortRun,
    defaultStartDate,
    defaultEndDate,
    minDate,
    maxDate,
}) => {
    const { addShortRun, updateShortRun, updateLongRun, shortRuns } = useStore();
    const isEditing = !!shortRun;

    const [title, setTitle] = useState(shortRun?.title || '');
    const [description, setDescription] = useState(shortRun?.description || '');
    const [startDate, setStartDate] = useState(
        shortRun?.startDate || defaultStartDate || getTodayISO()
    );
    const [endDate, setEndDate] = useState(
        shortRun?.endDate || defaultEndDate || getRelativeDate(14)
    );
    const [warning, setWarning] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && !isEditing) {
            if (defaultStartDate) setStartDate(defaultStartDate);
            if (defaultEndDate) setEndDate(defaultEndDate);
        }
    }, [isOpen, isEditing, defaultStartDate, defaultEndDate]);

    const validateDates = (): boolean => {
        if (new Date(startDate) > new Date(endDate)) {
            alert('Start date must be before end date');
            return false;
        }
        return true;
    };

    const isOutOfBounds = () => {
        if (!minDate || !maxDate) return false;
        return new Date(startDate) < new Date(minDate) || new Date(endDate) > new Date(maxDate);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setWarning(null);

        if (!title.trim()) {
            alert('Please enter a title');
            return;
        }

        if (!validateDates()) return;

        if (isOutOfBounds()) {
            setWarning(
                `This Short Run is outside the Long Run's timeline (${new Date(minDate!).toLocaleDateString()} - ${new Date(maxDate!).toLocaleDateString()}).`
            );
            return;
        }

        saveShortRun();
    };

    const handleExtendAndCreate = () => {
        if (!minDate || !maxDate) return;

        const newLongRunStart = new Date(startDate) < new Date(minDate) ? startDate : minDate;
        const newLongRunEnd = new Date(endDate) > new Date(maxDate) ? endDate : maxDate;

        updateLongRun(longRunId, {
            startDate: newLongRunStart,
            endDate: newLongRunEnd,
        });

        saveShortRun();
    };

    const saveShortRun = () => {
        if (isEditing && shortRun) {
            updateShortRun(shortRun.id, {
                title: title.trim(),
                description: description.trim(),
                startDate,
                endDate,
            });
        } else {
            const nextOrderIndex = Math.max(0, ...shortRuns.map((sr) => sr.orderIndex), 0) + 1;

            const newShortRun: ShortRun = {
                id: generateShortRunId(),
                longRunId,
                title: title.trim(),
                description: description.trim(),
                startDate,
                endDate,
                status: 'not_started',
                orderIndex: nextOrderIndex,
            };
            addShortRun(newShortRun);
        }

        handleClose();
    };

    const handleClose = () => {
        if (!isEditing) {
            setTitle('');
            setDescription('');
            setStartDate(getTodayISO());
            setEndDate(getRelativeDate(14));
            setWarning(null);
        }
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEditing ? 'Edit Short Run' : 'Create New Short Run'}
            size="md"
            footer={
                <>
                    <Button variant="ghost" onClick={handleClose}>
                        Cancel
                    </Button>
                    {warning ? (
                        <Button variant="primary" onClick={handleExtendAndCreate}>
                            Extend Timeline & Create
                        </Button>
                    ) : (
                        <Button variant="primary" onClick={handleSubmit}>
                            {isEditing ? 'Save Changes' : 'Create Short Run'}
                        </Button>
                    )}
                </>
            }
        >
            <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
            >
                {warning && (
                    <div style={{
                        padding: 'var(--space-md)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid var(--color-warning)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-warning)',
                        fontSize: 'var(--font-size-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-sm)'
                    }}>
                        <strong>⚠️ Timeline Warning</strong>
                        <p>{warning}</p>
                        <p>Do you want to extend the Long Run to fit this Short Run?</p>
                    </div>
                )}

                <Input
                    label="Title *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. MVP Development"
                    fullWidth
                    autoFocus
                />

                <TextArea
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What will be accomplished in this phase?"
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
            </form>
        </Modal>
    );
};
