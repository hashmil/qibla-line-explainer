// Builds the frame-13 sketch from Natural Earth land (world-atlas 50m) and checks the numbers.
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";
import { geoOrthographic, geoPath, geoGraticule10, geoDistance, geoInterpolate } from "d3-geo";

const land = feature(JSON.parse(readFileSync("node_modules/world-atlas/land-50m.json", "utf8")), "land");
const DUBAI = [55.2708, 25.2048];
const KAABA = [39.826206, 21.422487];

// Same formulas as the app (src/lib/qibla.ts)
const r = (d) => (d * Math.PI) / 180;
const y = Math.sin(r(KAABA[0] - DUBAI[0])) * Math.cos(r(KAABA[1]));
const x = Math.cos(r(DUBAI[1])) * Math.sin(r(KAABA[1])) - Math.sin(r(DUBAI[1])) * Math.cos(r(KAABA[1])) * Math.cos(r(KAABA[0] - DUBAI[0]));
const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
const km = geoDistance(DUBAI, KAABA) * 6371.0088;
console.log(`bearing ${bearing.toFixed(1)}°  distance ${km.toFixed(0)} km`);

const projection = geoOrthographic().rotate([-47.5, -23.5]).scale(900).translate([960, 600]).clipAngle(90);
const path = geoPath(projection).digits(0);
const arc = { type: "LineString", coordinates: Array.from({ length: 65 }, (_, i) => geoInterpolate(DUBAI, KAABA)(i / 64)) };
const [dx, dy] = projection(DUBAI);
const [kx, ky] = projection(KAABA);

const svg = `
      <circle cx="960" cy="600" r="900" fill="#07090c" stroke="#2a3038" stroke-width="2"/>
      <path d="${path(geoGraticule10())}" fill="none" stroke="#2a3038" stroke-width="1.5"/>
      <path d="${path(land)}" fill="none" stroke="#d8d2c4" stroke-width="2" stroke-opacity=".75" stroke-linejoin="round"/>
      <path d="${path(arc)}" fill="none" stroke="#ffb23e" stroke-width="6" stroke-linecap="round"/>
      <circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="10" fill="#d8d2c4"/>
      <text class="mono" x="${(dx + 20).toFixed(1)}" y="${(dy - 12).toFixed(1)}" font-size="26" fill="#7c7f84">Dubai</text>
      <rect x="${(kx - 14).toFixed(1)}" y="${(ky - 14).toFixed(1)}" width="28" height="28" transform="rotate(45 ${kx.toFixed(1)} ${ky.toFixed(1)})" fill="#07090c" stroke="#ffb23e" stroke-width="5"/>
      <text x="${(kx - 30).toFixed(1)}" y="${(ky + 70).toFixed(1)}" text-anchor="end" font-size="40" font-weight="700" fill="#d8d2c4">Makkah</text>
      <text class="mono" x="${(kx - 30).toFixed(1)}" y="${(ky + 118).toFixed(1)}" text-anchor="end" font-size="34" fill="#d8d2c4">258.2° · 1,631 km</text>`;
writeFileSync(".hyperframes-globe-sketch.svg.txt", svg);
console.log(`path bytes ${svg.length}  dubai ${dx.toFixed(0)},${dy.toFixed(0)}  kaaba ${kx.toFixed(0)},${ky.toFixed(0)}`);
