import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

async function generateFixturePdf(filename, label) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 400]);
  page.drawText(label, { x: 50, y: 300 });
  const pdfBytes = await pdfDoc.save();
  const filePath = path.join(process.cwd(), filename);
  fs.writeFileSync(filePath, pdfBytes);
  console.log(`Generated fixture: ${filePath}`);
  return filePath;
}

async function runSmokeTest() {
  console.log("=== PDFMinty E2E Smoke Test ===");

  const f1 = await generateFixturePdf("fixture_1.pdf", "Document Part One");
  const f2 = await generateFixturePdf("fixture_2.pdf", "Document Part Two");

  let browser;
  try {
    console.log("Launching headless browser...");
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    const targetUrl = "http://localhost:3000/merge-pdf";
    console.log(`Navigating to ${targetUrl}...`);

    // Verify if local dev server is active
    try {
      await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 8000 });
    } catch (err) {
      throw new Error(`Could not access Dev Server on ${targetUrl}. Make sure 'npm run dev' is running on port 3000 before executing smoke tests.`);
    }

    console.log("Locating file dropzone and upload input...");
    const fileInput = await page.$("input[type=file]");
    if (!fileInput) {
      throw new Error("Could not find file input element on /merge-pdf workspace!");
    }

    console.log("Uploading fixture files...");
    await fileInput.uploadFile(f1, f2);

    // Wait for files to resolve page counts locally
    console.log("Waiting for files to load in page viewport...");
    await page.waitForFunction(
      () => {
        // Confirm both files appear listed under loaded state
        const items = document.querySelectorAll(".shadow-sm");
        return items.length >= 2 || document.body.innerText.includes("Loaded 2 files");
      },
      { timeout: 7000 }
    );

    console.log("Triggering document compilation output...");
    // Find visual action/merge button and trigger click
    const actionButton = await page.$("button[type=button]");
    // Find the one with "Merge" or processing in inner text
    const buttons = await page.$$("button");
    let mergeBtn = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes("Merge PDF") || text.includes("Choose File(s)") === false && text.toLowerCase().includes("merge")) {
        mergeBtn = btn;
        break;
      }
    }

    if (!mergeBtn) {
      throw new Error("Could not locate the document action button!");
    }

    console.log("Clicking action button...");
    await mergeBtn.click();

    console.log("Waiting for success toast and download triggers...");
    await page.waitForFunction(
      () => {
        return document.body.innerText.includes("merged successfully") || document.body.innerText.includes("success");
      },
      { timeout: 20000 }
    );

    console.log("E2E Smoke Test Passed!");

  } catch (error) {
    console.error("E2E Smoke Test FAILED:", error.message);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
    // Cleanup files
    try {
      if (fs.existsSync(f1)) fs.unlinkSync(f1);
      if (fs.existsSync(f2)) fs.unlinkSync(f2);
      console.log("Temporary PDF fixtures purged successfully.");
    } catch (cleanupErr) {
      console.error("Warning: could not clean up fixture files:", cleanupErr.message);
    }
  }
}

runSmokeTest();
