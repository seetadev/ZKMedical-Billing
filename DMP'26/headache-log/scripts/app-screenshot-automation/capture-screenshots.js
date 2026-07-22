import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load configuration file
const configPath = path.join(__dirname, 'screenshot-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Viewports requested by Apple App Store submissions, using CSS logical sizes, scaling factors, and mobile Safari user agents
const devices = {
  iphone69: {
    width: 440,
    height: 956,
    scale: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    name: 'iPhone-6.9-inch'
  },
  iphone65: {
    width: 428,
    height: 926,
    scale: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    name: 'iPhone-6.5-inch'
  },
  iphone61: {
    width: 390,
    height: 844,
    scale: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    name: 'iPhone-6.1-inch'
  },
  ipad13: {
    width: 1032,
    height: 1376,
    scale: 2,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    name: 'iPad-13-inch'
  },
  ipad11: {
    width: 834,
    height: 1194,
    scale: 2,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    name: 'iPad-11-inch'
  },
};

// Target running instance of the app (default to local Vite dev server)
const baseUrl = process.env.APP_URL || config.baseUrl || 'http://localhost:3000';

// Helper to slugify filenames for URL matching (matches how React/Ionic routes files)
function getFileSlug(filename) {
  return filename.replace(/\s+/g, '-');
}

async function run() {
  // Parse CLI arguments
  const args = process.argv.slice(2);
  const headed = args.includes('--headed') || args.includes('-h');

  // Find if a specific device key was passed
  const targetDeviceKey = args.find(arg => arg !== '--headed' && arg !== '-h' && devices[arg]);

  const devicesToCapture = {};
  if (targetDeviceKey) {
    devicesToCapture[targetDeviceKey] = devices[targetDeviceKey];
  } else {
    Object.assign(devicesToCapture, devices);
  }

  console.log(`Starting App Store screenshot capture...`);
  console.log(`Target App URL: ${baseUrl}`);
  console.log(`Mode: ${headed ? 'Headed (Visible Browser)' : 'Headless'}`);
  if (targetDeviceKey) {
    console.log(`Filtering for single device: ${targetDeviceKey}`);
  }

  const nameA = config.saveFileNameA || 'Rent Receipt A';
  const nameB = config.saveFileNameB || 'Rent Receipt B';
  const slugA = getFileSlug(nameA);
  const slugB = getFileSlug(nameB);

  for (const [key, dev] of Object.entries(devicesToCapture)) {
    console.log(`\n==========================================`);
    console.log(`Capturing for device: ${key} (${dev.name}) - Viewport: ${dev.width}x${dev.height}`);
    console.log(`==========================================`);

    const isTablet = key.startsWith('ipad');

    // In headed mode, we scale down iPad viewports slightly so they fit on standard screens.
    // iPhones are already small (e.g. 390px width), so they need no headed scaling.
    const headedScale = headed ? (isTablet ? 1.5 : 1) : 1;
    const viewportWidth = Math.round(dev.width / headedScale);
    const viewportHeight = Math.round(dev.height / headedScale);

    let browser, page;
    try {
      browser = await chromium.launch({
        headless: !headed,
        args: headed ? [
          `--window-size=${viewportWidth},${viewportHeight + 80}`, // Adds height for browser chrome/toolbars
        ] : [],
        slowMo: headed ? 800 : 0 // Slower execution in headed mode so it is easy to observe
      });

      const context = await browser.newContext({
        viewport: { width: viewportWidth, height: viewportHeight },
        deviceScaleFactor: headed ? 1 : dev.scale, // Use correct App Store device scale factor only in headless mode
        userAgent: dev.userAgent,
        isMobile: true,
        hasTouch: true,
      });

      page = await context.newPage();

      const handleSaveAlert = async (alertLocator, fileNameVal) => {
        await alertLocator.waitFor({ state: 'visible', timeout: 10000 });
        const input = alertLocator.locator('input.alert-input');
        await input.focus();
        await input.fill(fileNameVal);
        await page.waitForTimeout(500); // Wait for input focus/state to settle

        const saveBtn = alertLocator.locator('button.alert-button').filter({ hasText: 'Save' });
        await saveBtn.click();

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            await alertLocator.waitFor({ state: 'hidden', timeout: 10000 });
            return;
          } catch (e) {
            if (attempt === 3) {
              throw e;
            }
            console.log(`⚠️ Alert for "${fileNameVal}" did not hide (attempt ${attempt}), retrying click...`);
            await saveBtn.click({ force: true });
          }
        }
      };

      // Forward browser logs to terminal to debug issues
      page.on('console', msg => {
        console.log(`    [Browser Console] [${msg.type()}] ${msg.text()}`);
      });

      // Mock Pinata IPFS API response for testing/screenshots
      await page.route('https://api.pinata.cloud/pinning/pinJSONToIPFS', async route => {
        console.log(`    [Mock API] Intercepted IPFS pinning request...`);
        const mockResponse = {
          IpfsHash: "Qme5173ViteDevServerExampleHashValueForScreenshots",
          PinSize: 2048,
          Timestamp: new Date().toISOString()
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockResponse)
        });
      });

      // Create target directory for this device, clearing old files first
      const screenshotsDir = path.join(__dirname, 'screenshots', key);
      if (fs.existsSync(screenshotsDir)) {
        fs.rmSync(screenshotsDir, { recursive: true, force: true });
      }
      fs.mkdirSync(screenshotsDir, { recursive: true });

      // Step 1: Open app and clear state to start from onboarding
      console.log(`- Loading app welcome screen...`);
      await page.goto(baseUrl);
      await page.evaluate(() => {
        localStorage.clear();
        // Set mock credentials to pass verification check
        localStorage.setItem('home_maintenance_settings', JSON.stringify({
          ipfsPinataJwt: 'mock-jwt-token-value-for-screenshot-testing',
          ipfsPinataApiKey: 'mock-api-key',
          ipfsPinataApiSecret: 'mock-api-secret',
          ipfsGatewayUrl: 'https://gateway.pinata.cloud'
        }));
      });
      // Reload page to apply cleared state and mock storage
      await page.goto(baseUrl);

      // Step 2: Capture Welcome Screen
      await page.waitForSelector('.step-title', { state: 'visible', timeout: 10000 });
      console.log(`- Waiting for welcome transitions to complete...`);
      await page.waitForTimeout(2500); // Wait for slide-in/fade-in animations to settle completely
      console.log(`- Capturing welcome screen...`);
      await page.screenshot({ path: path.join(screenshotsDir, '1_welcome.png') });

      // Step 3: Complete Onboarding & Go to Home page
      console.log(`- Completing onboarding...`);
      const startBtn = page.locator(`ion-button:has-text("${config.onboardingButtonText || 'Get Started'}")`);
      await startBtn.click();
      await page.waitForURL('**/app/tabs/home/**', { timeout: 15000 });

      // Wait for the main editor/spreadsheet layout to render
      console.log(`- Loading template editor...`);
      await page.waitForSelector('.footer-type-btn', { state: 'visible', timeout: 15000 });
      await page.waitForTimeout(2000); // Let UI settle

      // Step 4: Capture available template tabs
      console.log(`- Detecting template tabs...`);
      const tabButtons = page.locator('.footer-type-btn');
      let tabCount = await tabButtons.count();
      console.log(`- Found ${tabCount} tabs.`);

      const maxTabsLimit = isTablet ? config.maxTabsTablet : config.maxTabsMobile;
      if (maxTabsLimit && tabCount > maxTabsLimit) {
        console.log(`- Capping tab capture to first ${maxTabsLimit} tabs as per config.`);
        tabCount = maxTabsLimit;
      }

      for (let i = 0; i < tabCount; i++) {
        const tabButton = tabButtons.nth(i);
        const tabName = (await tabButton.innerText()).trim().replace(/[^a-zA-Z0-9-_]/g, '_');
        console.log(`  - Clicking tab ${i + 1}/${tabCount}: "${tabName}"...`);
        await tabButton.click();
        await page.waitForTimeout(2000); // Allow spreadsheet recalculation and rendering
        await page.screenshot({ path: path.join(screenshotsDir, `2_template_tab_${i + 1}_${tabName}.png`) });
      }

      // Step 5: Save multiple files
      console.log(`- Saving sample file A ("${nameA}")...`);
      await page.click('#actions-trigger');
      await page.waitForSelector('ion-popover:visible ion-item:has-text("New")', { state: 'visible', timeout: 5000 });
      await page.click('ion-popover:visible ion-item:has-text("New")');
      await page.waitForURL('**/app/tabs/home/new-template-**', { timeout: 10000 });
      await page.waitForSelector('.footer-type-btn', { state: 'visible', timeout: 10000 });
      await page.waitForTimeout(2000); // Allow layout initialization

      // Trigger Save As
      await page.click('div[title="Save"]');
      const alertA = page.locator('ion-alert:visible').filter({ hasText: config.saveFileDialogTitle || 'Save File' });
      await handleSaveAlert(alertA, nameA);

      await page.waitForURL(`**/app/tabs/home/${slugA}**`, { timeout: 15000 });
      await page.waitForSelector('.footer-type-btn', { state: 'visible', timeout: 10000 });
      await page.waitForTimeout(1000);

      console.log(`- Saving sample file B ("${nameB}")...`);
      await page.click('#actions-trigger');
      await page.waitForSelector('ion-popover:visible ion-item:has-text("New")', { state: 'visible', timeout: 5000 });
      await page.click('ion-popover:visible ion-item:has-text("New")');
      await page.waitForURL('**/app/tabs/home/new-template-**', { timeout: 10000 });
      await page.waitForSelector('.footer-type-btn', { state: 'visible', timeout: 10000 });
      await page.waitForTimeout(2000);

      // Trigger Save As
      await page.click('div[title="Save"]');
      const alertB = page.locator('ion-alert:visible').filter({ hasText: config.saveFileDialogTitle || 'Save File' });
      await handleSaveAlert(alertB, nameB);

      await page.waitForURL(`**/app/tabs/home/${slugB}**`, { timeout: 15000 });
      await page.waitForSelector('.footer-type-btn', { state: 'visible', timeout: 10000 });
      await page.waitForTimeout(2500);

      // Step 5.2: Save to IPFS (and capture the "Save to IPFS" name entry dialog and result alert)
      console.log(`- Saving sample file C to IPFS...`);
      await page.click('#actions-trigger');
      await page.waitForSelector('ion-popover:visible ion-item:has-text("New")', { state: 'visible', timeout: 5000 });
      await page.click('ion-popover:visible ion-item:has-text("New")');
      await page.waitForURL('**/app/tabs/home/new-template-**', { timeout: 10000 });
      await page.waitForSelector('.footer-type-btn', { state: 'visible', timeout: 10000 });
      await page.waitForTimeout(2000);

      // Trigger Save to IPFS
      await page.click('#actions-trigger');
      await page.waitForSelector('ion-popover:visible ion-item:has-text("Save to IPFS")', { state: 'visible', timeout: 5000 });
      await page.click('ion-popover:visible ion-item:has-text("Save to IPFS")');

      // Wait for IPFS Name Entry Dialog
      const ipfsDialogAlert = page.locator('ion-alert:visible').filter({ hasText: 'Save to IPFS' });
      await ipfsDialogAlert.waitFor({ state: 'visible', timeout: 10000 });

      // Capture screenshot of "Save to IPFS" naming dialog
      console.log(`- Capturing "Save to IPFS" dialog...`);
      await page.waitForTimeout(1000); // Allow dialog transition to complete
      await page.screenshot({ path: path.join(screenshotsDir, '2_ipfs_save_dialog.png') });

      // Fill in name and submit
      const ipfsInput = ipfsDialogAlert.locator('input.alert-input');
      await ipfsInput.focus();
      await ipfsInput.fill("IPFS Medical Record");
      await page.waitForTimeout(500);

      const ipfsUploadBtn = ipfsDialogAlert.locator('button.alert-button').filter({ hasText: 'Upload' });
      await ipfsUploadBtn.click();

      // Wait for IPFS result alert
      const ipfsResultAlert = page.locator('ion-alert:visible').filter({ hasText: 'Saved to IPFS Successfully!' });
      await ipfsResultAlert.waitFor({ state: 'visible', timeout: 15000 });
      
      console.log(`- Capturing "IPFS Success Alert"...`);
      await page.waitForTimeout(1000); // Allow transition
      await page.screenshot({ path: path.join(screenshotsDir, '2_ipfs_success_alert.png') });

      // Dismiss IPFS Success alert (triggers redirect in background)
      const okBtn = ipfsResultAlert.locator('button.alert-button').filter({ hasText: 'OK' });
      await okBtn.click();

      // Wait for route to redirect to slug-based url
      const slugC = getFileSlug("IPFS Medical Record");
      await page.waitForURL(`**/app/tabs/home/${slugC}**`, { timeout: 15000 });
      await page.waitForSelector('.footer-type-btn', { state: 'visible', timeout: 10000 });
      await page.waitForTimeout(2500);

      // Step 5.5: Click editable cell to open and capture Cell Edit Modal
      console.log(`- Ensuring cell click listener is bound...`);
      await page.evaluate(() => {
        if (typeof window.setupMouseListener === 'function') {
          window.setupMouseListener();
        }
      });

      const targetCellCoord = isTablet ? (config.editCellTablet || 'D5') : (config.editCellMobile || 'D5');
      console.log(`- Finding cell ${targetCellCoord} coordinate...`);
      const cellCoords = await page.evaluate((coord) => {
        const control = window.SocialCalc.GetCurrentWorkBookControl();
        if (!control) {
          console.log("DEBUG: No workbook control found!");
          return null;
        }
        const editor = control.workbook.spreadsheet.editor;

        // Print spreadsheet state
        const activeSheet = editor.workingvalues.currentsheet;
        const isCellEditable = window.SocialCalc.Callbacks.IsCellEditable
          ? window.SocialCalc.Callbacks.IsCellEditable(editor)
          : 'no callback';
        console.log(`DEBUG: ${coord} click info - activeSheet=${activeSheet}, isEditable=${isCellEditable}`);

        // Find a valid editable cell for the current sheet if the requested coord is not editable
        let cellToUse = coord;
        const sheetPrefix = activeSheet + '!';
        if (window.SocialCalc.EditableCells && window.SocialCalc.EditableCells.cells) {
          console.log(`DEBUG: EditableCells.allow=${window.SocialCalc.EditableCells.allow}, count=${Object.keys(window.SocialCalc.EditableCells.cells).length}`);
          console.log("DEBUG: EditableCells list:", Object.keys(window.SocialCalc.EditableCells.cells).slice(0, 15).join(', '));

          const fullCoord = sheetPrefix + coord;
          if (!window.SocialCalc.EditableCells.cells[fullCoord]) {
            const found = Object.keys(window.SocialCalc.EditableCells.cells).find(c => c.startsWith(sheetPrefix));
            if (found) {
              cellToUse = found.substring(sheetPrefix.length);
              console.log(`DEBUG: Requested coord ${coord} is not editable. Dynamically selected editable cell: ${cellToUse}`);
            }
          }
        } else {
          console.log("DEBUG: window.SocialCalc.EditableCells is undefined");
        }

        const cr = window.SocialCalc.coordToCr(cellToUse);
        const cellInfo = window.SocialCalc.GetEditorCellElement(editor, cr.row, cr.col);
        if (!cellInfo || !cellInfo.element) {
          console.log(`DEBUG: Cell ${cellToUse} element not found!`);
          return null;
        }
        const rect = cellInfo.element.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          resolvedCoord: cellToUse
        };
      }, targetCellCoord);

      if (cellCoords) {
        console.log(`- Clicking cell ${cellCoords.resolvedCoord} at (${cellCoords.x}, ${cellCoords.y})...`);
        await page.mouse.click(cellCoords.x, cellCoords.y);
      } else {
        const resolvedFallbackCoord = targetCellCoord;
        console.log(`- Cell ${resolvedFallbackCoord} coordinates not found, triggering via custom event as fallback...`);
        await page.evaluate(({ coord, val }) => {
          const event = new CustomEvent('socialcalc:cell-edit-request', {
            detail: {
              coord: coord,
              text: val,
              okfn: () => { }
            }
          });
          window.dispatchEvent(event);
        }, { coord: resolvedFallbackCoord, val: config.editValue || '$25.00' });
      }

      await page.waitForSelector('.cell-edit-title', { state: 'visible', timeout: 5000 });
      await page.waitForTimeout(1000); // Allow modal animation to settle
      console.log(`- Capturing cell edit modal...`);
      await page.screenshot({ path: path.join(screenshotsDir, '3_edit_modal.png') });

      // Close the cell edit modal
      console.log(`- Closing cell edit modal...`);
      await page.click('.cell-edit-close-btn');
      await page.waitForSelector('.cell-edit-title', { state: 'hidden', timeout: 5000 });
      await page.waitForTimeout(500);

      // Step 6: Go to Files Page & Capture
      console.log(`- Navigating to Files page...`);
      await page.goto(`${baseUrl}/app/tabs/files`);
      await page.waitForSelector(`ion-title:has-text("${config.savedFilesPageTitle || 'My Saved Receipts'}")`, { state: 'visible', timeout: 10000 });
      await page.waitForTimeout(1500); // Wait for transition animation
      await page.screenshot({ path: path.join(screenshotsDir, '4_files_page.png') });

      // Step 7: Go to Settings Page & Capture
      console.log(`- Navigating to Settings page...`);
      await page.goto(`${baseUrl}/app/tabs/settings`);
      await page.waitForSelector(`ion-title:has-text("${config.settingsPageTitle || 'App Settings'}")`, { state: 'visible', timeout: 10000 });
      await page.waitForTimeout(1500); // Wait for transition animation
      await page.screenshot({ path: path.join(screenshotsDir, '5_settings_page.png') });

      console.log(`- Successfully captured screenshots for device: ${key}.`);
      await browser.close();
    } catch (err) {
      console.error(`Error during capture for device ${key}:`, err);
      if (page) {
        try {
          const errorScreenshotPath = path.join(__dirname, `error_${key}.png`);
          await page.screenshot({ path: errorScreenshotPath, fullPage: true });
          console.log(`Saved error screenshot to: ${errorScreenshotPath}`);
        } catch (screenshotErr) {
          console.error('Failed to capture error screenshot:', screenshotErr);
        }
      }
      if (browser) {
        await browser.close();
      }
      throw err;
    }
  }

  console.log(`\nAll screens and devices captured successfully!`);
}

run().catch(err => {
  console.error('Fatal error during screenshot execution:', err);
  process.exit(1);
});
