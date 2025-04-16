import { test, expect } from '@playwright/test';
import dotenv from "dotenv";
import * as selectors from "../helpers/selectors.page"
import * as functions from "../helpers/functions.page"
import { secureHeapUsed } from 'crypto';
dotenv.config();  //only needed for local dev

//get current date
const todayPST = new Date().toLocaleString('en-US', {
  timeZone: 'America/Los_Angeles',
});

const pstDate = new Date(todayPST);
const shortDay = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  timeZone: 'America/Los_Angeles',
}).format(pstDate);

//get player combo
const playerCombo  = {
  "Mon": "Khoi Do",
  "Tue": "Chanel Jung",
  "Wed": "Tiffany La",
  "Thu": "Charlee Liu",
  "Fri": "Patrick Jung"
}

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
  //initiate array of desired times
  const desiredTimes : string[] = ['5-5:30pm','5:30-6pm','6-6:30pm']

  // const desiredTimes : string[] = ['6-6:30pm','6:30-7pm','7-7:30pm','7:30-8pm','8-8:30pm','8:30-9pm']

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
  let isVisible = false;
  try {
    await page.locator(selectors.popup).click({timeout: 2500})

  } catch (e) {
    console.log('popup did not exist');
  }
  const verify = await page.$eval(selectors.bookings, el => el.textContent)

  //select facility (cerritos)
  await page.locator(selectors.iPickleCerritosButton).click()
  await page.locator(selectors.bookNow).click()

  //select next week
  await page.locator(functions.getXPath()).click()
  //select pickleball
  await page.locator(selectors.pickleballButton).click()

  //select times
  for (const time of desiredTimes) {
    const locator = page.locator(functions.desiredTimePath(time));
    try {
      await locator.waitFor({ timeout: 1000 });
      console.log(`${time} exists`);
      
      //select time
      await page.locator(functions.desiredTimePath(time)).click()

    } catch {
      console.log(`${time} does not exist`);
      break;
    }
  }

  //select earliest court
  await page.locator(selectors.courtSelection).click()
  await page.locator(selectors.nextButton).click()

  //select number of users
  await page.locator(selectors.twoPlayers).click()
  await page.locator(selectors.addUsers).click()

  //search users
  await page.locator(selectors.playerSearchField).fill(playerCombo[shortDay])
  await page.locator(functions.playerPath(playerCombo[shortDay])).click()
  await page.locator(selectors.userSelectionNext).click()

  //BOOK
  await page.locator(selectors.userSelectionNext).click()

  await page.pause();
});
