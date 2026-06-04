import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const outDir = path.join(process.cwd(), "public", "brand");
await mkdir(outDir, { recursive: true });

const width = 1600;
const height = 1000;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fbfaf7"/>
      <stop offset="0.54" stop-color="#edf6f3"/>
      <stop offset="1" stop-color="#d9ebe7"/>
    </linearGradient>
    <linearGradient id="ink" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#102a2a"/>
      <stop offset="1" stop-color="#0b7771"/>
    </linearGradient>
    <linearGradient id="warm" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f8d083"/>
      <stop offset="1" stop-color="#e89d3f"/>
    </linearGradient>
    <linearGradient id="rose" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f2a7b4"/>
      <stop offset="1" stop-color="#d9475c"/>
    </linearGradient>
    <linearGradient id="photoA" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#132c2c"/>
      <stop offset="0.46" stop-color="#0b7771"/>
      <stop offset="1" stop-color="#f1c16b"/>
    </linearGradient>
    <linearGradient id="photoB" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#29455a"/>
      <stop offset="0.5" stop-color="#8fb9b2"/>
      <stop offset="1" stop-color="#f3eee2"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="22" flood-color="#18212f" flood-opacity="0.14"/>
    </filter>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#18212f" flood-opacity="0.1"/>
    </filter>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#20363f" stroke-opacity="0.06" stroke-width="1"/>
    </pattern>
    <clipPath id="round">
      <rect x="0" y="0" width="${width}" height="${height}" rx="44"/>
    </clipPath>
  </defs>
  <g clip-path="url(#round)">
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <rect width="${width}" height="${height}" fill="url(#grid)"/>
    <circle cx="1320" cy="120" r="250" fill="#0b7771" opacity="0.11"/>
    <circle cx="230" cy="840" r="300" fill="#d9475c" opacity="0.075"/>
    <path d="M1470 232C1328 178 1216 190 1124 268C1028 350 1008 464 880 514C736 570 604 486 488 558C394 616 370 720 286 770" fill="none" stroke="#102a2a" stroke-opacity="0.13" stroke-width="18" stroke-linecap="round"/>
    <path d="M1458 232C1324 190 1224 206 1137 281C1044 361 1024 474 889 527C743 585 620 508 503 574C416 623 384 716 302 770" fill="none" stroke="#0b7771" stroke-opacity="0.28" stroke-width="4" stroke-linecap="round"/>

    <g filter="url(#softShadow)" transform="translate(165 130)">
      <rect width="620" height="640" rx="34" fill="#ffffff" opacity="0.96"/>
      <rect x="38" y="42" width="544" height="72" rx="18" fill="#f7f6f2"/>
      <circle cx="536" cy="78" r="18" fill="#0b7771"/>
      <circle cx="486" cy="78" r="18" fill="#e89d3f"/>
      <circle cx="436" cy="78" r="18" fill="#d9475c"/>
      <rect x="44" y="154" width="250" height="160" rx="24" fill="url(#photoA)"/>
      <circle cx="104" cy="212" r="34" fill="#ffffff" opacity="0.32"/>
      <path d="M70 282C128 218 176 228 214 282C238 246 268 250 294 288V314H70Z" fill="#ffffff" opacity="0.42"/>
      <rect x="326" y="154" width="250" height="160" rx="24" fill="url(#photoB)"/>
      <rect x="360" y="188" width="94" height="12" rx="6" fill="#ffffff" opacity="0.5"/>
      <rect x="360" y="216" width="162" height="10" rx="5" fill="#ffffff" opacity="0.34"/>
      <rect x="360" y="244" width="124" height="10" rx="5" fill="#ffffff" opacity="0.34"/>

      <g transform="translate(44 354)">
        <rect width="532" height="82" rx="20" fill="#faf9f5" stroke="#d7dedc"/>
        <rect x="26" y="28" width="300" height="12" rx="6" fill="#102a2a" opacity="0.18"/>
        <rect x="26" y="52" width="210" height="10" rx="5" fill="#102a2a" opacity="0.09"/>
        <circle cx="474" cy="41" r="24" fill="#e7f7f4" stroke="#b7dfd9"/>
        <path d="M462 41l9 9 18-22" fill="none" stroke="#0b7771" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <g transform="translate(44 458)">
        <rect width="532" height="82" rx="20" fill="#faf9f5" stroke="#d7dedc"/>
        <rect x="26" y="28" width="260" height="12" rx="6" fill="#102a2a" opacity="0.18"/>
        <rect x="26" y="52" width="180" height="10" rx="5" fill="#102a2a" opacity="0.09"/>
        <circle cx="474" cy="41" r="24" fill="#fff4dc" stroke="#f4d08b"/>
        <path d="M474 25v20l14 10" fill="none" stroke="#c98216" stroke-width="6" stroke-linecap="round"/>
      </g>
    </g>

    <g filter="url(#softShadow)" transform="translate(845 180)">
      <rect width="520" height="520" rx="34" fill="#ffffff" opacity="0.96"/>
      <rect x="40" y="44" width="440" height="52" rx="16" fill="#102a2a"/>
      <circle cx="442" cy="70" r="12" fill="#55d4ba"/>
      <rect x="74" y="62" width="210" height="12" rx="6" fill="#ffffff" opacity="0.24"/>
      <g transform="translate(52 132)">
        <rect width="416" height="54" rx="16" fill="#f7f6f2"/>
        <rect x="30" y="22" width="230" height="10" rx="5" fill="#102a2a" opacity="0.13"/>
        <rect x="300" y="14" width="82" height="26" rx="13" fill="#e7f7f4"/>
      </g>
      <g transform="translate(52 212)">
        <rect width="416" height="54" rx="16" fill="#f7f6f2"/>
        <rect x="30" y="22" width="180" height="10" rx="5" fill="#102a2a" opacity="0.13"/>
        <rect x="300" y="14" width="82" height="26" rx="13" fill="#fff4dc"/>
      </g>
      <g transform="translate(52 292)">
        <rect width="416" height="54" rx="16" fill="#f7f6f2"/>
        <rect x="30" y="22" width="250" height="10" rx="5" fill="#102a2a" opacity="0.13"/>
        <rect x="300" y="14" width="82" height="26" rx="13" fill="#ffe8ee"/>
      </g>
      <g transform="translate(52 388)">
        <rect width="122" height="78" rx="18" fill="#e7f7f4"/>
        <rect x="146" width="122" height="78" rx="18" fill="#fff4dc"/>
        <rect x="292" width="122" height="78" rx="18" fill="#eef2ff"/>
        <circle cx="62" cy="38" r="18" fill="#0b7771" opacity="0.6"/>
        <circle cx="208" cy="38" r="18" fill="#c98216" opacity="0.6"/>
        <circle cx="354" cy="38" r="18" fill="#2b6cb0" opacity="0.6"/>
      </g>
    </g>

    <g filter="url(#cardShadow)">
      <rect x="1115" y="706" width="250" height="94" rx="24" fill="#102a2a"/>
      <circle cx="1304" cy="753" r="22" fill="#55d4ba"/>
      <rect x="1150" y="736" width="92" height="10" rx="5" fill="#ffffff" opacity="0.32"/>
      <rect x="1150" y="760" width="132" height="8" rx="4" fill="#ffffff" opacity="0.18"/>
    </g>
    <g filter="url(#cardShadow)">
      <rect x="880" y="725" width="190" height="74" rx="22" fill="#ffffff"/>
      <circle cx="1020" cy="762" r="17" fill="#d9475c" opacity="0.16"/>
      <path d="M1012 769l8-18 10 18" fill="none" stroke="#d9475c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="910" y="750" width="74" height="9" rx="4.5" fill="#102a2a" opacity="0.18"/>
      <rect x="910" y="772" width="110" height="7" rx="3.5" fill="#102a2a" opacity="0.09"/>
    </g>
  </g>
</svg>`;

await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(path.join(outDir, "nahrino-command-visual.png"));

console.log("Generated public/brand/nahrino-command-visual.png");
