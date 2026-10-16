/**
 * Screenshot helper — auto-captures screenshots at every test step.
 * Saves to: ui-tests/screenshots/<test-name>/<step-N>-<label>.png
 */
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');

async function capture(page, testName, stepNumber, label) {
  const dir = path.join(SCREENSHOT_DIR, testName);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const safeLabel = label.replace(/[^a-zA-Z0-9-_]/g, '_');
  const filename = `step-${String(stepNumber).padStart(2, '0')}-${safeLabel}.png`;
  const filepath = path.join(dir, filename);

  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Saved: ${testName}/${filename}`);
  return filepath;
}

module.exports = { capture, SCREENSHOT_DIR };
