export function getXPath(): string {
    const now = new Date();
    const pstNowString = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    const pstNow = new Date(pstNowString);
    const sevenDaysLater = new Date(pstNow.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dayOfMonth = sevenDaysLater.getDate().toString().padStart(2, '0');
    return `//div[@class='day_number' and text()='${dayOfMonth}']`;
}
 
export function getPstDay(): string {
    const now = new Date();
    const weekday = now.toLocaleDateString('en-US', {
        weekday: 'short',
        timeZone: 'America/Los_Angeles',
    });
    return weekday
}

export function desiredTimePath(time: string) : string {
    return `//button[text()='${time}' and not(contains(@class,'basic red'))]`
}

export function playerPath(player : string) : string {
    return `//span[text()='${player}']/ancestor::div[contains(@class,'spcbtw')]//button[text()='Add']`
}

export function courtPath(court : string) : string {
    return `//h2[text()='Select Detail']/..//button[contains(text(),'Pickleball ${court}')]`
}
export function parseTimeSlots(timeSlots: string[]): { startTime: string, endTime: string } {
    // Get first slot start time - need to preserve AM/PM from the slot
    const firstSlot = timeSlots[0]; // e.g. "7-7:30pm"
    const startTime = firstSlot.split('-')[0]; // "7"

    // Get last slot end time
    const lastSlot = timeSlots[timeSlots.length - 1]; // e.g. "8:30-9pm"  
    const endTime = lastSlot.split('-')[1]; // "9pm"

    // For start time, infer AM/PM from the slot
    let startTimeWithPeriod = startTime;
    if (firstSlot.includes('pm')) {
        startTimeWithPeriod = startTime + 'pm';
    } else if (firstSlot.includes('am')) {
        startTimeWithPeriod = startTime + 'am';
    }

    return { startTime: startTimeWithPeriod, endTime };
}
export function convertTo24Hour(timeStr: string): string {
    const isPM = timeStr.includes('pm');
    const isAM = timeStr.includes('am');
    const cleanTime = timeStr.replace(/(am|pm)/g, '').trim();

    let hour: string, minute: string;
    if (cleanTime.includes(':')) {
        [hour, minute] = cleanTime.split(':');
    } else {
        hour = cleanTime;
        minute = '00';
    }

    let hour24 = parseInt(hour, 10);
    if (isPM && hour24 !== 12) {
        hour24 += 12;
    } else if (isAM && hour24 === 12) {
        hour24 = 0;
    }

    return `${hour24.toString().padStart(2, '0')}:${minute}:00`;
}
