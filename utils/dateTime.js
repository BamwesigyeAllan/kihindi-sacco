const UGANDA_TIME_ZONE = 'Africa/Kampala';

function asDate(value) {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatUgandaDate(value) {
    const date = asDate(value);
    if (!date) return '—';
    return new Intl.DateTimeFormat('en-GB', {
        timeZone: UGANDA_TIME_ZONE,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
}

function formatUgandaTime(value) {
    const date = asDate(value);
    if (!date) return '—';
    return new Intl.DateTimeFormat('en-UG', {
        timeZone: UGANDA_TIME_ZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(date);
}

module.exports = { formatUgandaDate, formatUgandaTime };