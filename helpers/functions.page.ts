export function getXPath() : string {
    const today = new Date();
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);
    const day = sevenDaysLater.getDate();
    const xPath = `//div[@class='day_number' and text()='${day.toString()}']`
    return xPath
}

export function desiredTimePath(time: string) : string {
    return `//button[text()='${time}' and not(contains(@class,'basic red'))]`
}

export function playerPath(player : string) : string {
    return `//span[text()='${player}']/ancestor::div[@class='PlayerList']//button[text()='Add']`
}