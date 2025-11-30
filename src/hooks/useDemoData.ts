import { useStore } from '../store';
import type { LongRun, ShortRun, Task } from '../types';
import { generateLongRunId, generateShortRunId, generateTaskId } from '../utils/id';
import { getTodayISO, getRelativeDate } from '../utils/dates';

export function useDemoData() {
    const { addLongRun, addShortRun, addTask } = useStore();

    const loadDemoData = () => {
        // Create a demo LongRun
        const demoLongRun: LongRun = {
            id: generateLongRunId(),
            title: 'Launch SaaS Product',
            description: 'Build and launch my first SaaS product to generate $10k MRR',
            startDate: getTodayISO(),
            endDate: getRelativeDate(180), // 6 months
            status: 'active',
            color: '#6366f1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        addLongRun(demoLongRun);

        // Create demo ShortRuns
        const shortRun1: ShortRun = {
            id: generateShortRunId(),
            longRunId: demoLongRun.id,
            title: 'MVP Development',
            description: 'Build core features and get first version live',
            startDate: getTodayISO(),
            endDate: getRelativeDate(60),
            status: 'active',
            orderIndex: 1,
            color: '#8b5cf6',
        };
        addShortRun(shortRun1);

        const shortRun2: ShortRun = {
            id: generateShortRunId(),
            longRunId: demoLongRun.id,
            title: 'Beta Testing & Feedback',
            description: 'Get 50 beta users and iterate based on feedback',
            startDate: getRelativeDate(61),
            endDate: getRelativeDate(120),
            status: 'not_started',
            orderIndex: 2,
            color: '#ec4899',
        };
        addShortRun(shortRun2);

        const shortRun3: ShortRun = {
            id: generateShortRunId(),
            longRunId: demoLongRun.id,
            title: 'Launch & Growth',
            description: 'Public launch and scale to first 1000 users',
            startDate: getRelativeDate(121),
            endDate: getRelativeDate(180),
            status: 'not_started',
            orderIndex: 3,
            color: '#10b981',
        };
        addShortRun(shortRun3);

        // Add some tasks to the first ShortRun
        const tasks: Task[] = [
            {
                id: generateTaskId(),
                parentType: 'shortRun',
                parentId: shortRun1.id,
                title: 'Design landing page mockups',
                description: 'Create high-fidelity designs for the main landing page',
                status: 'done',
                priority: 'high',
                dueDate: getRelativeDate(-2),
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
            },
            {
                id: generateTaskId(),
                parentType: 'shortRun',
                parentId: shortRun1.id,
                title: 'Set up authentication system',
                description: 'Implement user signup, login, and password reset',
                status: 'in_progress',
                priority: 'high',
                dueDate: getTodayISO(),
                createdAt: new Date().toISOString(),
            },
            {
                id: generateTaskId(),
                parentType: 'shortRun',
                parentId: shortRun1.id,
                title: 'Build dashboard UI',
                description: 'Create the main user dashboard with charts and metrics',
                status: 'todo',
                priority: 'high',
                dueDate: getRelativeDate(5),
                createdAt: new Date().toISOString(),
            },
            {
                id: generateTaskId(),
                parentType: 'shortRun',
                parentId: shortRun1.id,
                title: 'Implement payment integration',
                description: 'Set up Stripe for subscriptions and billing',
                status: 'todo',
                priority: 'high',
                dueDate: getRelativeDate(10),
                createdAt: new Date().toISOString(),
            },
            {
                id: generateTaskId(),
                parentType: 'shortRun',
                parentId: shortRun1.id,
                title: 'Write API documentation',
                description: 'Document all API endpoints for future reference',
                status: 'todo',
                priority: 'medium',
                dueDate: getRelativeDate(15),
                createdAt: new Date().toISOString(),
            },
            {
                id: generateTaskId(),
                parentType: 'shortRun',
                parentId: shortRun1.id,
                title: 'Set up analytics tracking',
                description: 'Implement Google Analytics and custom event tracking',
                status: 'todo',
                priority: 'medium',
                createdAt: new Date().toISOString(),
            },
        ];

        tasks.forEach((task) => addTask(task));

        return demoLongRun.id;
    };

    return { loadDemoData };
}
