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