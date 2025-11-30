import { format, parseISO, isValid, addDays, addWeeks, startOfDay } from 'date-fns';

export function formatDate(dateString: string, formatStr: string = 'MMM d, yyyy'): string {
    try {
        const date = parseISO(dateString);
        if (!isValid(date)) return 'Invalid date';
        return format(date, formatStr);
    } catch {
        return 'Invalid date';
    }
}

export function formatDateRange(startDate: string, endDate: string): string {
    try {
        const start = parseISO(startDate);
        const end = parseISO(endDate);

        if (!isValid(start) || !isValid(end)) return 'Invalid date range';

        // Same year, show abbreviated format
        if (start.getFullYear() === end.getFullYear()) {
            // Same month
            if (start.getMonth() === end.getMonth()) {
                return `${format(start, 'MMM d')} → ${format(end, 'd, yyyy')}`;
            }
            return `${format(start, 'MMM d')} → ${format(end, 'MMM d, yyyy')}`;
        }

        return `${format(start, 'MMM d, yyyy')} → ${format(end, 'MMM d, yyyy')}`;
    } catch {
        return 'Invalid date range';
    }
}

export function toISODate(date: Date): string {
    return format(date, 'yyyy-MM-dd');
}

export function getTodayISO(): string {
    return toISODate(startOfDay(new Date()));
}

export function getRelativeDate(offset: number, unit: 'day' | 'week' = 'day'): string {
    const today = startOfDay(new Date());
    const addFn = unit === 'day' ? addDays : addWeeks;
    return toISODate(addFn(today, offset));
}

export function isDateInRange(date: string, start: string, end: string): boolean {
    try {
        const d = parseISO(date);
        const s = parseISO(start);
        const e = parseISO(end);

        if (!isValid(d) || !isValid(s) || !isValid(e)) return false;

        return d >= s && d <= e;
    } catch {
        return false;
    }
}

export function daysUntil(dateString: string): number {
    try {
        const target = startOfDay(parseISO(dateString));
        const today = startOfDay(new Date());

        if (!isValid(target)) return 0;

        const diff = target.getTime() - today.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    } catch {
        return 0;
    }
}
