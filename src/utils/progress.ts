import type { Task, ShortRun, LongRun, MicroRun } from '../types';

export interface ProgressInfo {
    completed: number;
    total: number;
    percentage: number;
}

export function calculateTaskProgress(tasks: Task[]): ProgressInfo {
    const total = tasks.length;
    const completed = tasks.filter(
        (t) => t.status === 'done' || t.status === 'skipped'
    ).length;

    return {
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
}

export function calculateMicroRunProgress(microRun: MicroRun, tasks: Task[]): ProgressInfo {
    const microRunTasks = tasks.filter(
        (t) => t.parentType === 'microRun' && t.parentId === microRun.id
    );
    return calculateTaskProgress(microRunTasks);
}

export function calculateShortRunProgress(
    shortRun: ShortRun,
    microRuns: MicroRun[],
    tasks: Task[]
): ProgressInfo {
    const shortRunMicroRuns = microRuns.filter((mr) => mr.shortRunId === shortRun.id);

    // Get all tasks - direct tasks and tasks in micro runs
    const directTasks = tasks.filter(
        (t) => t.parentType === 'shortRun' && t.parentId === shortRun.id
    );

    const microRunTasks = tasks.filter(
        (t) =>
            t.parentType === 'microRun' &&
            shortRunMicroRuns.some((mr) => mr.id === t.parentId)
    );

    const allTasks = [...directTasks, ...microRunTasks];
    return calculateTaskProgress(allTasks);
}

export function calculateLongRunProgress(
    longRun: LongRun,
    shortRuns: ShortRun[],
    microRuns: MicroRun[],
    tasks: Task[]
): ProgressInfo {
    const longRunShortRuns = shortRuns.filter((sr) => sr.longRunId === longRun.id);

    if (longRunShortRuns.length === 0) {
        return { completed: 0, total: 0, percentage: 0 };
    }

    // Calculate aggregate progress across all short runs
    const progressData = longRunShortRuns.map((sr) =>
        calculateShortRunProgress(sr, microRuns, tasks)
    );

    const totalTasks = progressData.reduce((sum, p) => sum + p.total, 0);
    const completedTasks = progressData.reduce((sum, p) => sum + p.completed, 0);

    return {
        completed: completedTasks,
        total: totalTasks,
        percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
}

export function getOverdueTasks(tasks: Task[]): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.filter((task) => {
        if (!task.dueDate || task.status === 'done' || task.status === 'skipped') {
            return false;
        }

        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        return dueDate < today;
    });
}
