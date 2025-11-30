import React, { useState, useRef, useEffect } from 'react';
import './QuickTaskAdd.css';

interface QuickTaskAddProps {
    onAdd: (title: string) => void;
}

export const QuickTaskAdd: React.FC<QuickTaskAddProps> = ({ onAdd }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [value, setValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isAdding && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAdding]);

    const handleAdd = () => {
        const trimmedValue = value.trim();
        if (trimmedValue) {
            onAdd(trimmedValue);
            setValue('');
            // Keep input open for adding more tasks
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    };

    const handleCancel = () => {
        setValue('');
        setIsAdding(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (isAdding) {
        return (
            <div className="quick-task-add quick-task-add--active">
                <span className="quick-task-bullet">+</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                        if (!value.trim()) {
                            handleCancel();
                        }
                    }}
                    placeholder="Type task and press Enter"
                    className="quick-task-input"
                />
            </div>
        );
    }

    return (
        <div className="quick-task-add" onClick={() => setIsAdding(true)}>
            <span className="quick-task-bullet">+</span>
            <span className="quick-task-text">Add task</span>
        </div>
    );
};
