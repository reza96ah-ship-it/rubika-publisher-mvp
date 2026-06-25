import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const roots = ["app", "components"];
const baselines = {
  hardcodedHex: 105,
  arbitraryVisualClass: 320,
  scrollRisk: 47
};

const checks = [
  {
    key: "hardcodedHex",
    label: "Hardcoded hex colors",
    pattern: /#[0-9A-Fa-f]{3,8}\b/
  },
  {
    key: "arbitraryVisualClass",
    label: "Arbitrary visual Tailwind classes",
    pattern: /\b(?:bg|text|border|shadow)-\[[^\]]+\]/
  },
  {
    key: "scrollRisk",
    label: "Scroll/sticky/viewport layout markers",
    pattern: /\b(?:overflow-y-auto|h-screen|min-h-screen|sticky)\b/
  }
];

function walk(dir) {
  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) return walk(path);
    return path;
  });
}

const files = roots
  .flatMap((root) => walk(root))
  .filter((path) => /\.(tsx|ts|css)$/.test(path));

const summary = Object.fromEntries(checks.map((check) => [check.key, { total: 0, files: [] }]));

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const lines = source.split(/\r?\n/);
  for (const check of checks) {
    const count = lines.filter((line) => check.pattern.test(line)).length;
    if (!count) continue;
    summary[check.key].total += count;
    summary[check.key].files.push({ file: relative(process.cwd(), file), count });
  }
}

let failed = false;

for (const check of checks) {
  const result = summary[check.key];
  const baseline = baselines[check.key];
  const status = result.total <= baseline ? "OK" : "FAIL";
  console.log(`${status} ${check.label}: ${result.total}/${baseline}`);
  result.files
    .sort((first, second) => second.count - first.count)
    .slice(0, 8)
    .forEach((item) => console.log(`  ${String(item.count).padStart(3, " ")} ${item.file}`));
  if (result.total > baseline) failed = true;
}

if (failed) {
  console.error("Token audit failed: visual debt increased beyond the V-0 baseline.");
  process.exit(1);
}

