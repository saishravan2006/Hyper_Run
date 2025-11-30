import React, { useState, useRef, useEffect } from 'react';
import './InlineEditableTask.css';

interface InlineEditableTaskProps {
    task: {
        id: string;
        title: string;
        status: 'todo' | 'in_progress' | 'done' | 'skipped';
    };
    onToggle: () => void;
    onUpdate: (title: string) => void;
    onDelete?: () => void;
    onFocus?: () => void;
    showFocusStar?: boolean;
    isFocused?: boolean;
}

export const InlineEditableTask: React.FC<InlineEditableTaskProps> = ({
    task,
    onToggle,
    onUpdate,
    onDelete,
    onFocus,
    showFocusStar = false,
    isFocused = false,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(task.title);
    const [showMenu, setShowMenu] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleStartEdit = () => {
        setEditValue(task.title);
        setIsEditing(true);
        setShowMenu(false);
    };

    const handleSave = () => {
        const trimmedValue = editValue.trim();
        if (trimmedValue && trimmedValue !== task.title) {
            onUpdate(trimmedValue);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValue(task.title);
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

    return (
        <div className={`editable-task ${task.status === 'done' ? 'editable-task--done' : ''}`}>
            <input
                type="checkbox"
                checked={task.status === 'done'}
                onChange={onToggle}
                className="task-checkbox"
            />

            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    className="task-edit-input"
                />
            ) : (
                <span className="task-title" onClick={handleStartEdit}>
                    {task.title}
                </span>
            )}

            <div className="task-actions">
                {showFocusStar && onFocus && (
                    <button
                        className={`task-focus-btn ${isFocused ? 'task-focus-btn--active' : ''}`}
                        onClick={onFocus}
                        title={isFocused ? "Remove from Today's Focus" : "Add to Today's Focus"}
                    >
                        ★
                    </button>
                )}

                <button
                    className="task-edit-btn"
                    onClick={handleStartEdit}
                    title="Edit task"
                >
                    ✎
                </button>

                <div className="task-menu-wrapper">
                    <button
                        className="task-menu-btn"
                        onClick={() => setShowMenu(!showMenu)}
                        title="More options"
                    >
                        ⋯
                    </button>

                    {showMenu && (
                        <div className="task-menu">
                            <button onClick={() => { handleStartEdit(); setShowMenu(false); }}>
                                ✎ Rename
                            </button>
                            <button onClick={() => { onToggle(); setShowMenu(false); }}>
                                {task.status === 'done' ? '↻ Mark as todo' : '✓ Mark as done'}
                            </button>
                            {onDelete && (
                                <button onClick={() => { onDelete(); setShowMenu(false); }} className="task-menu-delete">
                                    🗑 Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
