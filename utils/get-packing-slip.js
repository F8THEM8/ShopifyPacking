import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { uploadToGoogleDrive } from '../utils/googleDrive.js';  // Assuming you are still using this for Google Drive upload

export async function downloadPackingSlip(orderNumber) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Login to Shopify Admin
  await page.goto('https://7r4f3s-11.myshopify.com');
  await page.type('#LoginEmail', process.env.SHOPIFY_EMAIL);
  await page.type('#LoginPassword', process.env.SHOPIFY_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  // Navigate to Orders page
  await page.goto(`https://7r4f3s-11.myshopify.com/orders/${orderNumber}`);

  // Click on "Print" and "Add Packing Slip"
  await page.click('button[aria-label="Print"]');
  await page.click('button[aria-label="Add Packing Slip"]');
  
  // Wait for the packing slip to be generated and ready for download
  await page.waitForSelector('.download-link');  // Ensure the download link is visible

  // Download the packing slip
  const packingSlipUrl = await page.$eval('.download-link', el => el.href);

  // Download the file and save it
  const fileName = `${orderNumber}_PackingSlip.pdf`;
  const filePath = path.join(__dirname, fileName);
  const response = await page.goto(packingSlipUrl);
  const buffer = await response.buffer();
  fs.writeFileSync(filePath, buffer);

  // Upload to Google Drive
  await uploadToGoogleDrive(filePath, fileName);

  // Clean up
  await browser.close();
  fs.unlinkSync(filePath);
}
