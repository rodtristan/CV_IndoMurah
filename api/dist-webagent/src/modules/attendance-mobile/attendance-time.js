"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OFFICE_TZ = void 0;
exports.officeParts = officeParts;
exports.attendanceDate = attendanceDate;
exports.minutesOf = minutesOf;
exports.distanceMeters = distanceMeters;
exports.OFFICE_TZ = 'Asia/Jakarta';
const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: exports.OFFICE_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
});
function officeParts(d) {
    const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]));
    return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}
function attendanceDate(localDate) {
    return new Date(`${localDate}T00:00:00.000Z`);
}
function minutesOf(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
}
function distanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const rad = (x) => (x * Math.PI) / 180;
    const dLat = rad(lat2 - lat1);
    const dLon = rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}
