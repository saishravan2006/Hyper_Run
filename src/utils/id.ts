export function generateId(prefix: string = ''): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`;
}

export function generateLongRunId(): string {
    return generateId('lr');
}

export function generateShortRunId(): string {
    return generateId('sr');
}

export function generateMicroRunId(): string {
    return generateId('mr');
}

export function generateTaskId(): string {
    return generateId('task');
}
