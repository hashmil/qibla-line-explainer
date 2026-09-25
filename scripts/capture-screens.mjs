// Captures real screens of the live app for the phone in the video.
import { chromium } from "playwright-core";

const OUT = "assets/screens";
const sweep = process.argv.includes("--sweep");
const FINAL = Number(process.env.FINAL_BEARING ?? 0); // map bearing where the walls line up
// Jumeirah 1 villa (OSM way 1113620831); "Use my location" resolves here
const HOME = { latitude: 25.207811, longitude: 55.253439, accuracy: 12 };

const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
  geolocation: HOME, permissions: ["geolocation"],
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1" });
const page = await context.newPage();
await page.addInitScript(() => {
  localStorage.setItem("qibla-line-install-dismissed", String(Date.now()));
  DeviceOrientationEvent.requestPermission = async () => "granted";
});
const wait = (ms) => page.waitForTimeout(ms);
const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` });

await page.goto(process.env.APP_URL ?? "https://qiblaline.com/", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await shot("place");

await page.getByRole("button", { name: "Use my location" }).click();
await wait(2500);
await page.waitForLoadState("networkidle"); await wait(1500);

const dial = page.getByRole("slider", { name: "Turn the map" });
await dial.focus();
const bearing = () => page.evaluate(() => Number(document.querySelector('[role="slider"]').getAttribute("aria-valuenow")));
async function turnTo(target) {
  await dial.focus();
  let b = await bearing();
  while (b !== target) {
    const diff = ((target - b + 540) % 360) - 180;
    await page.keyboard.press(diff > 0 ? (Math.abs(diff) >= 5 ? "Shift+ArrowLeft" : "ArrowLeft") : (Math.abs(diff) >= 5 ? "Shift+ArrowRight" : "ArrowRight"));
    b = await bearing();
  }
  // Clear keyboard focus so the dial's focus outline isn't in the capture
  await page.evaluate(() => document.activeElement?.blur());
  await page.waitForLoadState("networkidle"); await wait(350);
}

if (sweep) {
  for (let t = 0; t < 180; t += 15) { await turnTo(t); await shot(`sweep-${String(t).padStart(3, "0")}`); }
  await browser.close(); process.exit(0);
}

// Dial: every degree from 35° off down to aligned at FINAL
for (let off = 35; off >= 0; off--) {
  await turnTo((FINAL + off) % 360);
  await shot(`dial-${String(off).padStart(2, "0")}`);
}

// Face step: drive the gyroscope with synthetic turns, one capture per degree off the Qibla
await page.getByRole("button", { name: "It lines up" }).click();
await wait(300);
const fire = (alpha) => page.evaluate((a) => window.dispatchEvent(new DeviceOrientationEvent("deviceorientation", { alpha: a, beta: 5, gamma: 0 })), alpha);
let alpha = 100; await fire(alpha); await wait(300);
const QIBLA = 258.2;
async function faceHeading(heading, name) {
  // heading = FINAL - (alpha - 100)  =>  alpha = 100 + FINAL - heading, stepped in <30° moves
  const targetAlpha = 100 + FINAL - heading;
  while (Math.abs(targetAlpha - alpha) > 0.01) {
    const step = Math.max(-25, Math.min(25, targetAlpha - alpha));
    alpha += step; await fire(alpha); await wait(40);
  }
  await wait(350); await shot(name);
}
for (let off = 38; off >= 0; off--) await faceHeading(QIBLA + off, `face-${String(off).padStart(2, "0")}`);
console.log(await page.evaluate(() => document.querySelector(".face-card .turn").textContent));
await browser.close();
