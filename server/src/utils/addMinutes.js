export function addMinutes(date, mins) {
    return new Date(date.getTime() + mins * 60000);
}