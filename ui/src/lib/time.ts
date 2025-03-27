import { formatRelative } from 'date-fns';

const singleFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
});

export function renderRealTimeRelative(target: Date, now: Date): string {
    return formatRelative(target, now);
}

export function renderRealTime(real: Date): string {
    return singleFormatter.format(real);
}
