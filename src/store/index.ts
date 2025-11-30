import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    User,
    LongRun,
    ShortRun,
    MicroRun,
    Task,
    Mode,
    UserSettings
} from '../types';

interface AppState {
    // User
    user: User | null;
    updateUserSettings: (settings: Partial<UserSettings>) => void;

    // Mode
    currentMode: Mode;
    setMode: (mode: Mode) => void;

    // Selected entities
    selectedLongRunId: string | null;
    selectedShortRunId: string | null;
    setSelectedLongRun: (id: string | null) => void;
    setSelectedShortRun: (id: string | null) => void;

    // LongRuns
    longRuns: LongRun[];
    addLongRun: (longRun: LongRun) => void;
    updateLongRun: (id: string, updates: Partial<LongRun>) => void;
    deleteLongRun: (id: string) => void;

    // ShortRuns
    shortRuns: ShortRun[];
    addShortRun: (shortRun: ShortRun) => void;
    updateShortRun: (id: string, updates: Partial<ShortRun>) => void;
    deleteShortRun: (id: string) => void;
    getShortRunsByLongRun: (longRunId: string) => ShortRun[];

    // MicroRuns
    microRuns: MicroRun[];
    addMicroRun: (microRun: MicroRun) => void;
    updateMicroRun: (id: string, updates: Partial<MicroRun>) => void;
    deleteMicroRun: (id: string) => void;
    getMicroRunsByShortRun: (shortRunId: string) => MicroRun[];

    // Tasks
    tasks: Task[];
    addTask: (task: Task) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    getTasksByParent: (parentId: string, parentType: 'shortRun' | 'microRun') => Task[];

    // Today's Focus
    todaysFocusTasks: string[]; // Task IDs
    setTodaysFocus: (taskIds: string[]) => void;

    // Initialize with default user
    initializeUser: () => void;
}

const defaultUser: User = {
    id: 'default-user',
    name: 'Solo Founder',
    settings: {
        defaultMode: 'general',
        theme: 'light',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        firstDayOfWeek: 1,
    },
};

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            currentMode: 'general',
            selectedLongRunId: null,
            selectedShortRunId: null,
            longRuns: [],
            shortRuns: [],
            microRuns: [],
            tasks: [],
            todaysFocusTasks: [],

            // User methods
            initializeUser: () => {
                const { user } = get();
                if (!user) {
                    set({ user: defaultUser });
                }
            },

            updateUserSettings: (settings) => {
                set((state) => ({
                    user: state.user ? {
                        ...state.user,
                        settings: { ...state.user.settings, ...settings },
                    } : null,
                }));
            },

            // Mode methods
            setMode: (mode) => set({ currentMode: mode }),

            // Selection methods
            setSelectedLongRun: (id) => set({ selectedLongRunId: id, selectedShortRunId: null }),
            setSelectedShortRun: (id) => set({ selectedShortRunId: id }),

            // LongRun methods
            addLongRun: (longRun) => {
                set((state) => ({
                    longRuns: [...state.longRuns, longRun],
                    selectedLongRunId: longRun.id,
                }));
            },

            updateLongRun: (id, updates) => {
                set((state) => ({
                    longRuns: state.longRuns.map((lr) =>
                        lr.id === id ? { ...lr, ...updates, updatedAt: new Date().toISOString() } : lr
                    ),
                }));
            },

            deleteLongRun: (id) => {
                set((state) => {
                    // Also delete all child short runs, micro runs, and tasks
                    const shortRunIds = state.shortRuns
                        .filter((sr) => sr.longRunId === id)
                        .map((sr) => sr.id);

                    const microRunIds = state.microRuns
                        .filter((mr) => shortRunIds.includes(mr.shortRunId))
                        .map((mr) => mr.id);

                    return {
                        longRuns: state.longRuns.filter((lr) => lr.id !== id),
                        shortRuns: state.shortRuns.filter((sr) => sr.longRunId !== id),
                        microRuns: state.microRuns.filter((mr) => !shortRunIds.includes(mr.shortRunId)),
                        tasks: state.tasks.filter(
                            (t) =>
                                !shortRunIds.includes(t.parentId) && !microRunIds.includes(t.parentId)
                        ),
                        selectedLongRunId: state.selectedLongRunId === id ? null : state.selectedLongRunId,
                    };
                });
            },

            // ShortRun methods
            addShortRun: (shortRun) => {
                set((state) => ({
                    shortRuns: [...state.shortRuns, shortRun],
                }));
            },

            updateShortRun: (id, updates) => {
                set((state) => ({
                    shortRuns: state.shortRuns.map((sr) =>
                        sr.id === id ? { ...sr, ...updates } : sr
                    ),
                }));
            },

            deleteShortRun: (id) => {
                set((state) => {
                    const microRunIds = state.microRuns
                        .filter((mr) => mr.shortRunId === id)
                        .map((mr) => mr.id);

                    return {
                        shortRuns: state.shortRuns.filter((sr) => sr.id !== id),
                        microRuns: state.microRuns.filter((mr) => mr.shortRunId !== id),
                        tasks: state.tasks.filter(
                            (t) => t.parentId !== id && !microRunIds.includes(t.parentId)
                        ),
                        selectedShortRunId: state.selectedShortRunId === id ? null : state.selectedShortRunId,
                    };
                });
            },

            getShortRunsByLongRun: (longRunId) => {
                return get().shortRuns.filter((sr) => sr.longRunId === longRunId);
            },

            // MicroRun methods
            addMicroRun: (microRun) => {
                set((state) => ({
                    microRuns: [...state.microRuns, microRun],
                }));
            },

            updateMicroRun: (id, updates) => {
                set((state) => ({
                    microRuns: state.microRuns.map((mr) =>
                        mr.id === id ? { ...mr, ...updates } : mr
                    ),
                }));
            },

            deleteMicroRun: (id) => {
                set((state) => ({
                    microRuns: state.microRuns.filter((mr) => mr.id !== id),
                    tasks: state.tasks.filter((t) => t.parentId !== id || t.parentType !== 'microRun'),
                }));
            },

            getMicroRunsByShortRun: (shortRunId) => {
                return get().microRuns.filter((mr) => mr.shortRunId === shortRunId);
            },

            // Task methods
            addTask: (task) => {
                set((state) => ({
                    tasks: [...state.tasks, task],
                }));
            },

            updateTask: (id, updates) => {
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id
                            ? {
                                ...t,
                                ...updates,
                                completedAt:
                                    updates.status === 'done' && !t.completedAt
                                        ? new Date().toISOString()
                                        : t.completedAt,
                            }
                            : t
                    ),
                }));
            },

            deleteTask: (id) => {
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                    todaysFocusTasks: state.todaysFocusTasks.filter((tid) => tid !== id),
                }));
            },

            getTasksByParent: (parentId, parentType) => {
                return get().tasks.filter(
                    (t) => t.parentId === parentId && t.parentType === parentType
                );
            },

            // Today's focus methods
            setTodaysFocus: (taskIds) => {
                set({ todaysFocusTasks: taskIds.slice(0, 3) }); // Max 3 tasks
            },
        }),
        {
            name: 'hyperrun-storage',
        }
    )
);
