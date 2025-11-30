import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import type { MicroRun } from '../../types';
import { generateMicroRunId } from '../../utils/id';
import { getTodayISO, getRelativeDate } from '../../utils/dates';
import { Modal, Button, Input, TextArea } from '../ui';

interface MicroRunFormProps {
    isOpen: boolean;
    onClose: () => void;
    shortRunId: string;
    microRun?: MicroRun;
    defaultStartDate?: string;
    defaultEndDate?: string;
    minDate?: string;
    maxDate?: string;
}

export const MicroRunForm: React.FC<MicroRunFormProps> = ({
    isOpen,
    onClose,
    shortRunId,
    microRun,
    defaultStartDate,
    defaultEndDate,
    minDate,
    maxDate,
}) => {
    const { addMicroRun, updateMicroRun, updateShortRun, microRuns } = useStore();
    const isEditing = !!microRun;

    const [title, setTitle] = useState(microRun?.title || '');
    const [description, setDescription] = useState(microRun?.description || '');
    const [startDate, setStartDate] = useState(
        microRun?.startDate || defaultStartDate || getTodayISO()
    );
    const [endDate, setEndDate] = useState(
        microRun?.endDate || defaultEndDate || getRelativeDate(7)
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
                `This Micro Run is outside the Short Run's timeline (${new Date(minDate!).toLocaleDateString()} - ${new Date(maxDate!).toLocaleDateString()}).`
            );
            return;
        }

        saveMicroRun();
    };

    const handleExtendAndCreate = () => {
        if (!minDate || !maxDate) return;

        const newShortRunStart = new Date(startDate) < new Date(minDate) ? startDate : minDate;
        const newShortRunEnd = new Date(endDate) > new Date(maxDate) ? endDate : maxDate;

        updateShortRun(shortRunId, {
            startDate: newShortRunStart,
            endDate: newShortRunEnd,
        });

        saveMicroRun();
    };

    const saveMicroRun = () => {
        if (isEditing && microRun) {
            updateMicroRun(microRun.id, {
                title: title.trim(),
                description: description.trim(),
                startDate,
                endDate,
            });
        } else {
            const nextOrderIndex = Math.max(0, ...microRuns.map((mr) => mr.orderIndex), 0) + 1;

            const newMicroRun: MicroRun = {
                id: generateMicroRunId(),
                shortRunId,
                title: title.trim(),
                description: description.trim(),
                startDate,
                endDate,
                status: 'not_started',
                orderIndex: nextOrderIndex,
            };
            addMicroRun(newMicroRun);
        }

        handleClose();
    };

    const handleClose = () => {
        if (!isEditing) {
            setTitle('');
            setDescription('');
            setStartDate(getTodayISO());
            setEndDate(getRelativeDate(7));
            setWarning(null);
        }
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEditing ? 'Edit Micro Run' : 'Create New Micro Run'}
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
                            {isEditing ? 'Save Changes' : 'Create Micro Run'}
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
                        <p>Do you want to extend the Short Run to fit this Micro Run?</p>
                    </div>
                )}

                <Input
                    label="Title *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Database Schema Design"
                    fullWidth
                    autoFocus
                />

                <TextArea
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Specific details for this micro run..."
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
