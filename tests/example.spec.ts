import { test, expect } from '@playwright/test';
import dotenv from "dotenv";
import * as selectors from "../helpers/selectors.page"
dotenv.config();

const username = process.env.MY_USERNAME as string;
const password = process.env.PASSWORD as string;

test('bot', async ({ page }) => {
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
    await page.locator(selectors.popup).click({timeout: 5000})

  } catch (e) {
    console.log('popup did not exist');
  }
  const verify = await page.$eval(selectors.bookings, el => el.textContent)

  console.log(verify)
  await page.pause();
});

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
