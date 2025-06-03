import { test, expect } from '@playwright/test';
import dotenv from "dotenv";
import * as selectors from "../helpers/selectors.page"
import * as functions from "../helpers/functions.page"
import { secureHeapUsed } from 'crypto';
dotenv.config();  //only needed for local dev

// Get Input Variables
const path = process.env.PATH_MODE ?? 'pj'; //default to pat if path empty

//Set all variables depending on path
const pstDay : string = functions.getPstDay();
let username : string;
let password : string;
let courtHierarchy : string[];
let desiredTimes : string[];
let secondary : string;
//set creds depending on day
if (path == 'pj') {
  //creds
  username = process.env.MY_USERNAME as string;
  password = process.env.PASSWORD as string;
  //court hierarachy
  courtHierarchy = ['6','2','8','3','7','5','4','9','1','10']
  //desired times
  desiredTimes = ['6:30-7pm','7-7:30pm','7:30-8pm','8-8:30pm']
  //secondary player
  secondary = 'Matthew Lim'
} else if (path == 'cj') {
  //creds
  username = process.env.MY_USERNAME2 as string;
  password = process.env.PASSWORD2 as string;
  //court hierarachy
  courtHierarchy = ['3','8','7','1','2','5','4','9','6','10']
  //desired times
  desiredTimes = ['7-7:30pm','7:30-8pm','8-8:30pm','8:30-9pm']
  //secondary player
  secondary = 'Tiffany La'
} else if (path == 'el') {
  //creds
  username = process.env.MY_USERNAME3 as string;
  password = process.env.PASSWORD3 as string;
  //court hierarachy
  courtHierarchy = ['9','4','6','10','1','2','8','3','7','5']
  //desired times
  desiredTimes = ['6-6:30pm','6:30-7pm','7-7:30pm','7:30-8pm']
  //secondary player
  secondary = 'Jimmy Le'
} else if (path == 'jc') {
  //creds
  username = process.env.MY_USERNAME4 as string;
  password = process.env.PASSWORD4 as string;
  //court hierarachy
  courtHierarchy = ['3','2','10','1','4','6','8','9','7','5']
  //desired times
  desiredTimes = ['8-8:30pm','8:30-9pm','9-9:30pm','9:30-10pm']
  //secondary player
  secondary = 'sherry yi'
}

test('bot', async ({ page }) => {
  // Log out env vars
  console.log(`Day: ${[pstDay]}`);
  console.log(`Path: ${path}`);
  console.log(`Courts: ${courtHierarchy}`);
  console.log(`Times: ${desiredTimes}`);
  console.log(`Secondary Player: ${secondary}`);

  //set array for testing
  // desiredTimes = ['2-2:30pm','2:30-3pm','3-3:30pm','3:30-4pm']

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
  try {
    await page.locator(selectors.iPickleCerritosButton).click({timeout: 2500})
  } catch (e) {}
  await page.locator(selectors.bookNow).click()

  //select next week
  await page.locator(functions.getXPath()).click()
  //select pickleball
  await page.locator(selectors.pickleballButton).click()
  await page.waitForTimeout(1000)

  //wait for countdown
  let count = await page.locator(selectors.messageUntilOpen).count();
  let loopCounter = 0;
  while (count > 0) {
    await page.waitForTimeout(200)
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
      if (loopCounter%10 == 0) {
        console.log(`time left remaining: ${hr}:${min}:${sec}`)
      }
    } catch {}
    loopCounter++
  }

  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight / 2);
  });
  
  //on wednesday, wait 1 sec except for jc
  if (pstDay == 'Wed' && path != 'jc') {
    console.log("Waitng 1 sec for JC to book first.")
    await page.waitForTimeout(1000)
  }

  //select times
  let selected : boolean = false
  for (const time of desiredTimes) {
    const locator = page.locator(functions.desiredTimePath(time));
    try {
      await locator.waitFor({ timeout: 100 });
      console.log(`${time} selected`);
      
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
  await page.waitForTimeout(100);

  let selectedCourts : string[] = []
  //select earliest court
  for (const court of courtHierarchy) {
      //add selected court to other array
      selectedCourts.push(court)
    try {
      await page.locator(functions.courtPath(court)).click({timeout: 100})
      console.log(`Court ${court} selected`)
      break;
    } catch {
      console.log(`Court ${court} not available`)
    }
  }

  //depending on day and path
  if (path == 'jc' && pstDay != 'Tue') {
    console.log("Skipping JC because it's not Wednesday.")
    //don't want the bot doing anything
  } else {
    //Next
    await page.locator(selectors.nextButton).click({timeout: 5000})

    //select number of users
    await page.locator(selectors.twoPlayers).click()
    await page.locator(selectors.addUsers).click()

    //search users
    await page.locator(functions.playerPath(secondary)).click()
    await page.locator(selectors.userSelectionNext).click()

    //listen for alert
    let alertAppeared = false;

    page.once('dialog', async dialog => {
      alertAppeared = true;
      console.log('Alert:', dialog.message());
      await dialog.accept();
    });

    //BOOK
    await page.locator(selectors.bookButton).click()
    await page.waitForTimeout(1000)

    console.log(alertAppeared ? '❌ Alert appeared' : '✅ No alert appeared');

    //check if booking worked
    let confirmationCount = await page.locator(selectors.confirmationNumber).count()
    while (confirmationCount < 1 && selectedCourts.length < courtHierarchy.length) { //if booking confirmation is not found
      //go back to court selection
      try{
        await page.locator(selectors.selectDateTime).click({timeout:5000})
      } catch {
        break;  //if it errors out here, that means reservation was successful, the page just didn't load in time
      }
      //select a different court
      for (const court of courtHierarchy) {
        if (selectedCourts.includes(court)) {
          continue
        }
        //add selected court to other array
        selectedCourts.push(court)
        try {
          await page.locator(functions.courtPath(court)).click({timeout: 100})
          console.log(`Court ${court} selected`)
          break;
        } catch {
          console.log(`Court ${court} not available`)
        }
      }
      //go back to book
      await page.locator(selectors.checkout).click()
      //BOOK
      await page.locator(selectors.bookButton).click()
      await page.waitForTimeout(1000)
      confirmationCount = await page.locator(selectors.confirmationNumber).count()
    }

    //extract confirmation number
    let confirmationNumber = await page.$eval(selectors.confirmationNumber, el => el.textContent)
    console.log(`Booking confirmed! Here's the confirmation number: ${confirmationNumber?.trim()}`)
    await page.waitForTimeout(5000)
    // await page.pause()
  }
});
