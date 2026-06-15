// NutriTrack E2E Test via Chrome CDP (Node 22+)
import { writeFileSync } from 'node:fs';

const CDP_BASE = 'http://127.0.0.1:9222';
const SCREENSHOT_DIR = 'e:/PROJECT/nutri-track/test-screenshots';
const EMAIL = 'qianhaoming@gmail.com';
const PWD = '53uBtSOp4DmYQ0y3';
const IMAGE_PATH = 'e:/PROJECT/nutri-track/image.png';

let cmdId = 0;
const pending = new Map();

async function getTargets() {
  const r = await fetch(`${CDP_BASE}/json`);
  return r.json();
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => resolve(ws);
    ws.onerror = (e) => reject(new Error(`WS error: ${e.message}`));
    setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000);
  });
}

function send(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++cmdId;
    ws.send(JSON.stringify({ id, method, params }));
    pending.set(id, { resolve, reject });
    setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, 20000);
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
  console.log(`  📸 ${name}.png`);
}

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function evaluate(ws, expr) {
  const r = await send(ws, 'Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) {
    console.error('  ⚠️ Eval:', r.result.exceptionDetails.text || 'unknown');
    return null;
  }
  return r.result?.result?.value;
}

async function clickText(ws, text) {
  return evaluate(ws, `
    (() => {
      const els = [...document.querySelectorAll('button, a, span, div[role="button"]')];
      const el = els.find(e => e.textContent.trim() === '${text}' || e.textContent.includes('${text}'));
      if (el) { el.click(); return 'CLICKED: ${text}'; }
      return 'NOT_FOUND: ${text}';
    })()
  `);
}

async function fillReactInput(ws, label, value) {
  return evaluate(ws, `
    (() => {
      // Try finding input by label text, placeholder, type, or aria-label
      let el = null;
      const inputs = [...document.querySelectorAll('input')];

      // 1. Try finding by associated label
      for (const input of inputs) {
        const labelEl = input.closest('label') || document.querySelector(\`label[for="\${input.id}"]\`);
        if (labelEl && labelEl.textContent.includes('${label}')) { el = input; break; }
      }
      // 2. Try by placeholder
      if (!el) el = inputs.find(i => i.placeholder && i.placeholder.includes('${label}'));
      // 3. Try by aria-label
      if (!el) el = inputs.find(i => i.getAttribute('aria-label')?.includes('${label}'));
      // 4. Try by type (for specific inputs)
      if (!el && '${label}'.includes('邮箱')) el = inputs.find(i => i.type === 'email');
      if (!el && '${label}'.includes('密码')) el = inputs.find(i => i.type === 'password');
      // 5. Try by name attribute
      if (!el) el = inputs.find(i => i.name?.includes('${label}'));

      if (!el) return 'NOT_FOUND: input with label "${label}"';

      // React needs native input setter + events
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, '${value.replace(/'/g, "\\'").replace(/\n/g, '\\n')}');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
      return 'FILLED: ${label}';
    })()
  `);
}

async function main() {
  console.log('🔍 Discovering Chrome targets...');
  const targets = await getTargets();
  console.log(`  Found ${targets.length} target(s)`);

  // Find an existing page or create one
  let pageTarget = targets.find(t => t.type === 'page' && t.url.includes('nutri-track'));
  if (!pageTarget) pageTarget = targets.find(t => t.type === 'page');

  if (!pageTarget) {
    console.error('No page target found!');
    process.exit(1);
  }

  console.log(`  Using: ${pageTarget.title} (${pageTarget.url})`);

  console.log('🔗 Connecting via WebSocket...');
  const ws = await connect(pageTarget.webSocketDebuggerUrl);
  onMessage(ws);
  console.log('✅ Connected!\n');

  try {
    await send(ws, 'Page.enable');
    await send(ws, 'Runtime.enable');
    await send(ws, 'DOM.enable');

    // ============================
    // STEP 1: Login
    // ============================
    console.log('═'.repeat(55));
    console.log('📋 STEP 1: Login Test');
    console.log('═'.repeat(55));

    console.log('\n📄 Navigating to /#/login ...');
    await send(ws, 'Page.navigate', { url: 'https://tipd4.github.io/nutri-track/#/login' });
    await wait(3000);

    const title = await evaluate(ws, 'document.title');
    console.log(`  🏷️ Title: "${title}"`);

    await screenshot(ws, '01-login-page');

    // Check login page content
    const pageText = await evaluate(ws, 'document.body.innerText.substring(0, 400)');
    console.log(`  📝 Content: ${pageText?.replace(/\n/g, ' | ')}`);

    // Fill form
    console.log('\n📝 Filling form...');
    const emailResult = await fillReactInput(ws, '邮箱', EMAIL);
    console.log(`  Email: ${emailResult}`);
    const pwdResult = await fillReactInput(ws, '密码', PWD);
    console.log(`  Password: ${pwdResult}`);

    await wait(500);
    await screenshot(ws, '02-login-filled');

    // Click login
    console.log('\n🔘 Clicking "登录"...');
    const clickResult = await clickText(ws, '登录');
    console.log(`  ${clickResult}`);

    await wait(4000);

    const postLoginUrl = await evaluate(ws, 'window.location.href');
    const postLoginTitle = await evaluate(ws, 'document.title');
    console.log(`  🏷️ Title: "${postLoginTitle}"`);
    console.log(`  🔗 URL: ${postLoginUrl}`);

    await screenshot(ws, '03-after-login');

    const loggedIn = postLoginUrl?.includes('dashboard');
    console.log(loggedIn ? '✅ Login SUCCESS!' : '⚠️ Login may have failed');

    if (!loggedIn) {
      const body = await evaluate(ws, 'document.body.innerText.substring(0, 600)');
      console.log(`  Body: ${body}`);
    }

    // ============================
    // STEP 2: Navigate to AI Record
    // ============================
    console.log('\n' + '═'.repeat(55));
    console.log('📋 STEP 2: AI Food Recognition');
    console.log('═'.repeat(55));

    console.log('\n📄 Navigating to /#/records/new/ai ...');
    await send(ws, 'Page.navigate', { url: 'https://tipd4.github.io/nutri-track/#/records/new/ai' });
    await wait(3000);

    const aiTitle = await evaluate(ws, 'document.title');
    const aiUrl = await evaluate(ws, 'window.location.href');
    console.log(`  🏷️ Title: "${aiTitle}"`);
    console.log(`  🔗 URL: ${aiUrl}`);
    await screenshot(ws, '04-ai-record-page');

    const aiText = await evaluate(ws, 'document.body.innerText.substring(0, 800)');
    console.log(`  📝 Content: ${aiText?.replace(/\n/g, ' | ')}`);

    // Look for file input and upload button
    console.log('\n🔍 Scanning for upload UI...');
    const uiInfo = await evaluate(ws, `
      (() => {
        const fileInputs = [...document.querySelectorAll('input[type="file"]')].map(i => ({
          accept: i.accept, id: i.id, className: i.className?.substring(0, 50),
          visible: i.offsetParent !== null
        }));
        const buttons = [...document.querySelectorAll('button')].map(b => ({
          text: b.textContent.trim().substring(0, 40),
          visible: b.offsetParent !== null,
          disabled: b.disabled
        }));
        const uploadAreas = [...document.querySelectorAll('[class*="upload"], [class*="drop"], [class*="drag"]')].map(d => ({
          className: d.className?.substring(0, 50), tag: d.tagName
        }));
        return { fileInputs, buttons, uploadAreas };
      })()
    `);
    console.log('  UI Info:', JSON.stringify(uiInfo, null, 2));

    // Upload file if file input exists
    if (uiInfo?.fileInputs?.length > 0) {
      console.log('\n📤 Attempting file upload...');
      // Set file on the input
      const fileResult = await evaluate(ws, `
        (() => {
          const input = document.querySelector('input[type="file"]');
          if (!input) return 'No file input found';
          // We'll mark it for later CDP setFileInputFiles call
          input.setAttribute('data-test-target', 'true');
          return 'Marked file input';
        })()
      `);
      console.log(`  ${fileResult}`);

      // Use DOM.setFileInputFiles to upload
      const doc = await send(ws, 'DOM.getDocument', { depth: 0 });
      const rootNodeId = doc.result.root.nodeId;

      // Find the file input node
      const queryResult = await send(ws, 'DOM.querySelector', {
        nodeId: rootNodeId,
        selector: 'input[type="file"]'
      });

      if (queryResult.result?.nodeId) {
        await send(ws, 'DOM.setFileInputFiles', {
          nodeId: queryResult.result.nodeId,
          files: [IMAGE_PATH]
        });
        console.log('  ✅ File set on input!');
        await wait(1000);
        await screenshot(ws, '05-image-uploaded');
      }

      // Select meal type
      console.log('\n🍽️ Selecting meal type...');
      const mealSelectors = ['午餐', 'lunch', '中餐'];
      for (const meal of mealSelectors) {
        const r = await clickText(ws, meal);
        if (r?.startsWith('CLICKED')) { console.log(`  ✅ ${r}`); break; }
      }

      await wait(500);
      await screenshot(ws, '06-meal-selected');

      // Click recognize button
      console.log('\n🤖 Starting AI recognition...');
      const recognizeBtns = ['开始识别', '识别', 'AI识别', '分析'];
      for (const btn of recognizeBtns) {
        const r = await clickText(ws, btn);
        if (r?.startsWith('CLICKED')) { console.log(`  ✅ ${r}`); break; }
      }

      // Wait for AI result
      console.log('  ⏳ Waiting for AI response (up to 40s)...');
      await wait(15000);
      await screenshot(ws, '07-ai-result');

      let resultText = await evaluate(ws, 'document.body.innerText.substring(0, 1000)');
      console.log(`  Result: ${resultText?.replace(/\n/g, ' | ')}`);

      // Maybe still loading, wait more
      if (resultText?.includes('识别') && !resultText?.includes('热量')) {
        await wait(15000);
        await screenshot(ws, '07b-ai-result-wait');
        resultText = await evaluate(ws, 'document.body.innerText.substring(0, 1500)');
        console.log(`  Result (after wait): ${resultText?.replace(/\n/g, ' | ')}`);
      }
    } else {
      console.log('  ⚠️ No file input found on AI record page');
      // Maybe need to click something first
      console.log('  Trying to find add/upload button...');
      const addBtns = ['添加', '新增', '新建', '上传', '选择图片', '拍照'];
      for (const btn of addBtns) {
        const r = await clickText(ws, btn);
        console.log(`    ${r}`);
        if (r?.startsWith('CLICKED')) { await wait(1500); break; }
      }
      await screenshot(ws, '05b-after-click-add');
      const newUI = await evaluate(ws, `
        (() => {
          const fileInputs = [...document.querySelectorAll('input[type="file"]')].map(i => ({ accept: i.accept }));
          const buttons = [...document.querySelectorAll('button')].map(b => b.textContent.trim().substring(0, 40));
          return { fileInputs, buttons };
        })()
      `);
      console.log('  UI after click:', JSON.stringify(newUI));
    }

    // ============================
    // STEP 3: Dashboard
    // ============================
    console.log('\n' + '═'.repeat(55));
    console.log('📋 STEP 3: Dashboard Check');
    console.log('═'.repeat(55));

    await send(ws, 'Page.navigate', { url: 'https://tipd4.github.io/nutri-track/#/dashboard' });
    await wait(3000);

    const dashTitle = await evaluate(ws, 'document.title');
    const dashUrl = await evaluate(ws, 'window.location.href');
    console.log(`  🏷️ Title: "${dashTitle}"`);
    console.log(`  🔗 URL: ${dashUrl}`);
    await screenshot(ws, '08-dashboard');

    const dashText = await evaluate(ws, 'document.body.innerText.substring(0, 1000)');
    console.log(`  📝 Content: ${dashText?.replace(/\n/g, ' | ')}`);

    console.log('\n✅ All tests complete!');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    ws.close();
    console.log('🏁 Done.');
  }
}

main().catch(console.error);
