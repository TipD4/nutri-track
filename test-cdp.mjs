// NutriTrack E2E Test via Chrome CDP
import { writeFileSync } from 'node:fs';

const WS_URL = 'ws://127.0.0.1:9222/devtools/page/B20FCE43A645BA69D5EE48AAED38EC35';
const SCREENSHOT_DIR = 'e:/PROJECT/nutri-track/test-screenshots';
const IMAGE_PATH = 'e:/PROJECT/nutri-track/image.png';

let cmdId = 0;
const pending = new Map();

function connect() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    ws.onopen = () => resolve(ws);
    ws.onerror = (e) => reject(new Error(`WS error: ${e.message}`));
    setTimeout(() => reject(new Error('Connection timeout')), 5000);
  });
}

function send(ws, method, params) {
  return new Promise((resolve, reject) => {
    const id = ++cmdId;
    ws.send(JSON.stringify({ id, method, params }));
    pending.set(id, { resolve, reject });
    setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, 15000);
  });
}

function onMessage(ws) {
  ws.onmessage = (evt) => {
    const msg = JSON.parse(evt.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve } = pending.get(msg.id);
      pending.delete(msg.id);
      resolve(msg);
    }
  };
}

async function screenshot(ws, name) {
  const result = await send(ws, 'Page.captureScreenshot', { format: 'png' });
  const buf = Buffer.from(result.result.data, 'base64');
  writeFileSync(`${SCREENSHOT_DIR}/${name}.png`, buf);
  console.log(`  📸 Screenshot saved: ${name}.png`);
}

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function evaluate(ws, expr) {
  const r = await send(ws, 'Runtime.evaluate', {
    expression: expr,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.result?.exceptionDetails) {
    console.error('  ⚠️ Eval error:', r.result.exceptionDetails.text || 'unknown');
    return null;
  }
  return r.result?.result?.value;
}

async function clickSelector(ws, selector) {
  // Find element and click it
  return await evaluate(ws, `
    (() => {
      const el = document.querySelector('${selector.replace(/'/g, "\\'")}');
      if (!el) return 'NOT_FOUND: ${selector}';
      el.click();
      return 'CLICKED: ${selector}';
    })()
  `);
}

async function fillInput(ws, selector, value) {
  return await evaluate(ws, `
    (() => {
      const el = document.querySelector('${selector.replace(/'/g, "\\'")}');
      if (!el) return 'NOT_FOUND: ${selector}';

      // React needs native input events
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeInputValueSetter.call(el, '${value.replace(/'/g, "\\'")}');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return 'FILLED: ${selector} = ${value}';
    })()
  `);
}

async function getPageText(ws) {
  return await evaluate(ws, `document.body.innerText.substring(0, 1500)`);
}

async function getPageTitle(ws) {
  return await evaluate(ws, `document.title`);
}

async function main() {
  console.log('🔗 Connecting to Chrome CDP...');
  const ws = await connect();
  onMessage(ws);
  console.log('✅ Connected!\n');

  try {
    // Enable domains
    await send(ws, 'Page.enable');
    await send(ws, 'Runtime.enable');
    await send(ws, 'DOM.enable');

    // ============================
    // STEP 1: Login Test
    // ============================
    console.log('='.repeat(60));
    console.log('STEP 1: Login Test');
    console.log('='.repeat(60));

    console.log('\n📄 Navigating to login page...');
    await send(ws, 'Page.navigate', { url: 'https://tipd4.github.io/nutri-track/#/login' });
    await wait(3000);

    const title1 = await getPageTitle(ws);
    console.log(`  Title: "${title1}"`);

    const text1 = await getPageText(ws);
    console.log('  Page content:', text1?.substring(0, 300));
    await screenshot(ws, '01-login-page');

    // Fill login form
    console.log('\n📝 Filling login form...');

    // Find email input - try multiple selectors
    const emailSelectors = ['input[type="email"]', 'input[name="email"]', 'input#email', 'input[placeholder*="邮箱"]'];
    const pwdSelectors = ['input[type="password"]', 'input[name="password"]', 'input#password', 'input[placeholder*="密码"]'];

    for (const sel of emailSelectors) {
      const r = await fillInput(ws, sel, 'qianhaoming@gmail.com');
      if (!r?.startsWith('NOT_FOUND')) { console.log(`  ✅ Email filled via: ${sel}`); break; }
    }
    for (const sel of pwdSelectors) {
      const r = await fillInput(ws, sel, '53uBtSOp4DmYQ0y3');
      if (!r?.startsWith('NOT_FOUND')) { console.log(`  ✅ Password filled via: ${sel}`); break; }
    }

    await screenshot(ws, '02-login-filled');

    // Click login button
    console.log('\n🔘 Clicking login button...');
    const btnSelectors = ['button[type="submit"]', 'button:has-text("登录")', 'button'];
    let clicked = false;
    for (const sel of btnSelectors) {
      const r = await clickSelector(ws, sel);
      if (r?.startsWith('CLICKED')) { console.log(`  ✅ ${r}`); clicked = true; break; }
    }
    if (!clicked) {
      // Try clicking by text content
      const r = await evaluate(ws, `
        (() => {
          const buttons = [...document.querySelectorAll('button')];
          const loginBtn = buttons.find(b => b.textContent.includes('登录'));
          if (loginBtn) { loginBtn.click(); return 'CLICKED login by text'; }
          return 'NOT_FOUND';
        })()
      `);
      console.log(`  ${r}`);
    }

    await wait(3000);

    const titleAfterLogin = await getPageTitle(ws);
    console.log(`  Title after login: "${titleAfterLogin}"`);
    const urlAfterLogin = await evaluate(ws, 'window.location.href');
    console.log(`  URL after login: ${urlAfterLogin}`);
    await screenshot(ws, '03-after-login');

    if (urlAfterLogin?.includes('dashboard')) {
      console.log('✅ Login SUCCESS - redirected to dashboard!');
    } else {
      console.log('⚠️ May not be on dashboard yet, checking page content...');
      const text = await getPageText(ws);
      console.log('  Content:', text?.substring(0, 500));
    }

    // ============================
    // STEP 2: Navigate to AI Recognition
    // ============================
    console.log('\n' + '='.repeat(60));
    console.log('STEP 2: AI Food Recognition Test');
    console.log('='.repeat(60));

    // Navigate to AI record page
    console.log('\n📄 Navigating to AI record page...');
    await send(ws, 'Page.navigate', { url: 'https://tipd4.github.io/nutri-track/#/records/new/ai' });
    await wait(3000);

    const aiTitle = await getPageTitle(ws);
    console.log(`  Title: "${aiTitle}"`);
    await screenshot(ws, '04-ai-recognition-page');

    const aiText = await getPageText(ws);
    console.log('  Page content:', aiText?.substring(0, 500));

    // Check if we're on the right page
    const aiUrl = await evaluate(ws, 'window.location.href');
    console.log(`  Current URL: ${aiUrl}`);

    // Look for file input and upload button
    console.log('\n📁 Looking for file upload element...');
    const fileInputInfo = await evaluate(ws, `
      (() => {
        const inputs = [...document.querySelectorAll('input[type="file"]')];
        return inputs.map(i => ({
          accept: i.accept,
          visible: i.offsetParent !== null,
          id: i.id,
          className: i.className
        }));
      })()
    `);
    console.log('  File inputs found:', JSON.stringify(fileInputInfo));

    // Look for upload area / drop zone
    const uploadUI = await evaluate(ws, `
      (() => {
        const elements = [];
        // Check for common upload related text
        const allText = document.body.innerText;
        const hasUpload = allText.includes('上传') || allText.includes('选择') || allText.includes('拖拽') || allText.includes('识别') || allText.includes('图片');

        // Find buttons
        const buttons = [...document.querySelectorAll('button')].map(b => ({
          text: b.textContent.trim().substring(0, 50),
          visible: b.offsetParent !== null
        }));

        return { hasUpload, buttons };
      })()
    `);
    console.log('  Upload UI:', JSON.stringify(uploadUI, null, 2));

    // Try uploading the image via setFiles
    if (fileInputInfo?.length > 0) {
      console.log('\n📤 Uploading image via file input...');
      // Use CDP's DOM.setFileInputFiles
      const { Node } = await send(ws, 'DOM.getDocument', { depth: 0 });

      // Find file input node
      const fileInputs = await evaluate(ws, `
        (() => {
          const inputs = [...document.querySelectorAll('input[type="file"]')];
          return inputs.length;
        })()
      `);

      if (fileInputs > 0) {
        console.log(`  Found ${fileInputs} file input(s), attempting upload...`);
      }
    }

    await screenshot(ws, '05-ai-before-upload');

    // ============================
    // STEP 3: Check Dashboard
    // ============================
    console.log('\n' + '='.repeat(60));
    console.log('STEP 3: Dashboard Check');
    console.log('='.repeat(60));

    await send(ws, 'Page.navigate', { url: 'https://tipd4.github.io/nutri-track/#/dashboard' });
    await wait(3000);

    const dashTitle = await getPageTitle(ws);
    console.log(`  Title: "${dashTitle}"`);
    const dashUrl = await evaluate(ws, 'window.location.href');
    console.log(`  URL: ${dashUrl}`);
    await screenshot(ws, '06-dashboard');

    const dashText = await getPageText(ws);
    console.log('  Dashboard content:', dashText?.substring(0, 800));

  } catch (err) {
    console.error('❌ Test error:', err.message);
  } finally {
    ws.close();
    console.log('\n🏁 Test complete!');
  }
}

main().catch(console.error);
