import { test, expect } from '@playwright/test';
import dotenv from "dotenv";
import * as selectors from "../helpers/selectors.page"
import * as functions from "../helpers/functions.page"
import { secureHeapUsed } from 'crypto';
dotenv.config();  //only needed for local dev

// Get current day in PST (short format like "Mon", "Tue", etc.)
const shortDay = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  timeZone: 'America/Los_Angeles',
}).format(new Date());

// Player schedule
const playerCombo = {
  Mon: 'Khoi Do',
  Tue: 'Khoi Do',
  Wed: 'Khoi Do',
  Thu: 'Chanel Jung',
  Fri: 'Patrick Jung',
};

// Debug logs
console.log("shortDay (PST):", shortDay);
console.log("Selected player:", playerCombo[shortDay]);

let username : string;
let password : string;
//set creds depending on day
if (shortDay == "Tue") {
  username = process.env.MY_USERNAME as string;
  password = process.env.PASSWORD as string;
} else {
  username = process.env.MY_USERNAME as string;
  password = process.env.PASSWORD as string;
}

test('bot', async ({ page }) => {
  test.setTimeout(15 * 60 * 1000); // 15 minutes = 900000 ms

  //initiate array of desired times
  //const desiredTimes : string[] = ['2-2:30pm','2:30-3pm','3-3:30pm','3:30-4pm']
  const desiredTimes : string[] = ['5-5:30pm']

  //const desiredTimes : string[] = ['6:30-7pm','7-7:30pm','7:30-8pm','8-8:30pm']

  //intiate array of best court
  const courtHierarchy : string[] = ['2','4','8','9','3','6','7','1','5','10']
  //navigate to website
  await page.goto('https://app.playbypoint.com/users/sign_in');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Login/);

  //enter creds
  await page.locator(selectors.usernameField).fill(username)
  await page.locator(selectors.passwordField).fill(password)
  await page.locator(selectors.loginButton).click()
  await expect(page).toHaveTitle(/Home/);


  //check for popup
  try {
    await page.locator(selectors.popup).click({timeout: 2500})
    console.log('popup existed and closed');

  } catch (e) {}

  //select facility (cerritos)
  await page.locator(selectors.iPickleCerritosButton).click()
  await page.locator(selectors.bookNow).click()

  //select next week
  await page.locator(functions.getXPath()).click()
  //select pickleball
  await page.locator(selectors.pickleballButton).click()
  await page.waitForTimeout(3000)

  //wait for countdown
  let count = await page.locator(selectors.messageUntilOpen).count();
  while (count > 0) {
    await page.waitForTimeout(1000)
    //check again
    count = await page.locator(selectors.messageUntilOpen).count();
    if (count < 1) {
      break;
    }
    //get amount of time remaining
    try {
      const hr = await page.$eval(selectors.hr, el => el.textContent)
      const min = await page.$eval(selectors.min, el => el.textContent)
      const sec = await page.$eval(selectors.sec, el => el.textContent)
      console.log(`time left remaining: ${hr}:${min}:${sec}`)
    } catch {}
  }

  //select times
  let selected : boolean = false
  for (const time of desiredTimes) {
    const locator = page.locator(functions.desiredTimePath(time));
    try {
      await locator.waitFor({ timeout: 500 });
      console.log(`${time} booked`);
      
      //select time
      await page.locator(functions.desiredTimePath(time)).click()
      selected = true;

    } catch {
      console.log(`${time} not available`);
      if (selected) {
        break;
      }
    }
  }
  await page.waitForTimeout(1000);

  let selectedCourts : string[] = []
  //select earliest court
  for (const court of courtHierarchy) {
      //add selected court to other array
      selectedCourts.push(court)
    try {
      await page.locator(functions.courtPath(court)).click({timeout: 500})
      console.log(`Court ${court} selected`)
      break;
    } catch {
      console.log(`Court ${court} not available`)
    }
  }

  try {
    await page.locator(selectors.nextButton).click({timeout: 3000})
  } catch {
    process.exit(0)
  }

  //select number of users
  await page.locator(selectors.twoPlayers).click()
  await page.locator(selectors.addUsers).click()

  //search users
  await page.locator(selectors.playerSearchField).fill(playerCombo[shortDay])
  await page.locator(functions.playerPath(playerCombo[shortDay])).click()
  await page.locator(selectors.userSelectionNext).click()

  //BOOK
  //await page.locator(selectors.bookButton).click()
  await page.waitForTimeout(3000)

  //check if booking worked
  let confirmationCount = await page.locator(selectors.confirmationNumber).count()
  while (confirmationCount < 1 && selectedCourts.length < courtHierarchy.length) { //if booking confirmation is not found
    //go back to court selection
    await page.locator(selectors.selectDateTime).click()
    //select a different court
    for (const court of courtHierarchy) {
      if (selectedCourts.includes(court)) {
        continue
      }
      //add selected court to other array
      selectedCourts.push(court)
      try {
        await page.locator(functions.courtPath(court)).click({timeout: 500})
        console.log(`Court ${court} selected`)
        break;
      } catch {
        console.log(`Court ${court} not available`)
      }
    }
    //go back to book
    await page.locator(selectors.checkout).click()
    //BOOK
    //await page.locator(selectors.bookButton).click()
    await page.waitForTimeout(3000)
    confirmationCount = await page.locator(selectors.confirmationNumber).count()
  }
  //extract confirmation number
  let confirmationNumber = await page.$eval(selectors.confirmationNumber, el => el.textContent)
  console.log(`Booking confirmed! Here's the confirmation number: ${confirmationNumber?.trim()}`)
  
});
