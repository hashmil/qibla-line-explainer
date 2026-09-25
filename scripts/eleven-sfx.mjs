// Generates the film's sound effects with ElevenLabs. The key is read from Hash's
// foresight-audio .env at run time and never written into this project.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";

const env = readFileSync(`${homedir()}/Dev/foresight-audio/.env`, "utf8");
const key = env.match(/^ELEVENLABS_API_KEY=["']?([^"'\r\n]+)/m)?.[1];
if (!key) throw new Error("ELEVENLABS_API_KEY not found");

const SOUNDS = {
  tick: ["a single tiny crisp mechanical click of a precision rotary dial detent, dry, close-mic, very short, no reverb", 0.5],
  hum: ["a low electrical hum with faint crackling magnetic interference, uneasy, subtle, steady, no music", 4],
  ratchet1: ["a single sharp tiny metallic ratchet click from winding a mechanical clock key, dry, close-mic, very short, no reverb", 0.5],
  ratchet2: ["one crisp small metal pawl click of a clock winding ratchet, bright and dry, extremely short, no reverb", 0.5],
  ratchet3: ["a single tight metallic tick of a watch crown being wound, close-up, dry, very short, no room sound", 0.5],
  tap: ["a soft clean glass touchscreen tap, subtle user interface click, dry", 0.5],
  pop: ["a soft rounded muted pop, a map pin landing gently, subtle", 0.5],
  thud: ["a soft low muffled thud, a compass needle settling into place, subtle, short", 1],
  converge: ["soft airy swoosh gathering inward and resolving into a gentle click, calm, cinematic", 1.5],
  whoosh: ["a soft airy whoosh passing by, gentle and smooth, no bass rumble", 1.2],
  chime: ["a single warm soft bell chime, calm and reverent, gentle long tail, no melody", 3],
  flight: ["a long airy rising whoosh, swelling wind, flying up high into the sky, smooth and calm", 4.5],
  arrive: ["a soft shimmering arrival tone, gentle bright sparkle, calm and warm", 2],
};

for (const [name, [text, seconds]] of Object.entries(SOUNDS)) {
  const out = `assets/sfx-el/${name}.mp3`;
  if (existsSync(out) && !process.argv.includes("--force")) { console.log(`skip ${name}`); continue; }
  const res = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ text, duration_seconds: seconds, prompt_influence: 0.6 }),
  });
  if (!res.ok) { console.log(`fail ${name}: ${res.status} ${await res.text()}`); continue; }
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log(`ok ${name}`);
}
