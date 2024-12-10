import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { uploadToGoogleDrive } from '../utils/googleDrive.js'; // Assuming you're still using this
import chromium from 'chrome-aws-lambda';

export async function downloadPackingSlip(orderNumber) {
  let browser;
  try {
    // Launch Puppeteer
    browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.NODE_ENV === 'production' ? await chromium.executablePath : undefined,
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Login to Shopify Admin
    await page.goto('https://7r4f3s-11.myshopify.com');
    await page.type('#LoginEmail', process.env.SHOPIFY_EMAIL);
    await page.type('#LoginPassword', process.env.SHOPIFY_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });

    // Navigate to Orders page
    await page.goto(`https://7r4f3s-11.myshopify.com/orders/${orderNumber}`);

    // Click on "Print" and "Add Packing Slip"
    await page.click('button[aria-label="Print"]');
    await page.click('button[aria-label="Add Packing Slip"]');
    await page.waitForSelector('.download-link');

    // Download the packing slip
    const packingSlipUrl = await page.$eval('.download-link', el => el.href);
    const fileName = `${orderNumber}_PackingSlip.pdf`;
    const filePath = path.resolve(process.cwd(), fileName);
    const response = await page.goto(packingSlipUrl);

    if (!response || !response.ok()) {
      throw new Error(`Failed to download the packing slip from URL: ${packingSlipUrl}`);
    }

    const buffer = await response.buffer();
    fs.writeFileSync(filePath, buffer);

    // Upload to Google Drive
    await uploadToGoogleDrive(filePath, fileName);

    // Clean up
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error(`Error generating packing slip for order ${orderNumber}:`, error.message);
    if (browser) {
      await browser.close(); // Ensure browser is closed in case of error
    }
    throw error;
  } finally {
    if (browser) await browser.close(); // Always close the browser
  }
}
