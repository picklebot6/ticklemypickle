export function getXPath() : string {
    const now = new Date();
    const pstNow = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
    );

    // Add 7 days
    const pst7DaysLater = new Date(pstNow.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get just the day (1–31)
    const dayOfMonth = pst7DaysLater.getDate();
    const xPath = `//div[@class='day_number' and text()='${dayOfMonth.toString()}']`
    return xPath
}

export function desiredTimePath(time: string) : string {
    return `//button[text()='${time}' and not(contains(@class,'basic red'))]`
}

export function playerPath(player : string) : string {
    return `//span[text()='${player}']/ancestor::div[@class='PlayerList']//button[text()='Add']`
}

export function courtPath(court : string) : string {
    return `//h2[text()='Select Detail']/..//button[contains(text(),'Pickleball ${court}')]`
}