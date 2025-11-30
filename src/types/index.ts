export type Status = 'not_started' | 'active' | 'completed' | 'on_hold';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'skipped';
export type Priority = 'low' | 'medium' | 'high';
export type Mode = 'general' | 'hyper';
export type Theme = 'light' | 'dark' | 'auto';
export type ParentType = 'shortRun' | 'microRun';

export interface User {
    id: string;
    name: string;
    email?: string;
    settings: UserSettings;
}

export interface UserSettings {
    defaultMode: Mode;
    theme: Theme;
    timezone: string;
    firstDayOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
}

export interface LongRun {
    id: string;
    title: string;
    description: string;
    startDate: string; // ISO date string
    endDate: string;
    status: Status;
    color: string;
    createdAt: string;
    updatedAt: string;
}

export interface ShortRun {
    id: string;
    longRunId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: Status;
    orderIndex: number;
    color?: string; // Inherits from LongRun if not set
}

export interface MicroRun {
    id: string;
    shortRunId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: Status;
    orderIndex: number;
}

export interface Task {
    id: string;
    parentType: ParentType;
    parentId: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: Priority;
    dueDate?: string;
    estimatedDurationMinutes?: number;
    createdAt: string;
    completedAt?: string;
}
