import React, { useState, useRef, useEffect } from 'react';
import './InlineEditableText.css';

interface InlineEditableTextProps {
    value: string;
    onSave: (newValue: string) => void;
    className?: string;
    placeholder?: string;
    showEditIcon?: boolean;
}

export const InlineEditableText: React.FC<InlineEditableTextProps> = ({
    value,
    onSave,
    className = '',
    placeholder = 'Enter text...',
    showEditIcon = true,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    useEffect(() => {
        setEditValue(value);
    }, [value]);

    const handleSave = () => {
        const trimmedValue = editValue.trim();
        if (trimmedValue && trimmedValue !== value) {
            onSave(trimmedValue);
        } else {
            setEditValue(value);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValue(value);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                placeholder={placeholder}
                className={`inline-editable-input ${className}`}
            />
        );
    }

    return (
        <div className={`inline-editable-text ${className}`} onClick={() => setIsEditing(true)}>
            <span className="inline-editable-value">{value}</span>
            {showEditIcon && (
                <button className="inline-edit-icon" onClick={() => setIsEditing(true)} title="Edit">
                    ✎
                </button>
            )}
        </div>
    );
};
