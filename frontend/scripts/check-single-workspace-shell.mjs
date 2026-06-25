import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const appRoot = new URL("../app/", import.meta.url);
const layoutPath = new URL("../app/(workspace)/layout.tsx", import.meta.url);
const violations = [];

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith(".tsx")) {
      const source = readFileSync(path, "utf8");
      const normalized = relative(appRoot.pathname, path);
      if (path !== layoutPath.pathname && /components\/(auth-gate|app-shell)/.test(source)) {
        violations.push(`${normalized}: imports a workspace shell owner`);
      }
      if (path !== layoutPath.pathname && /<(AuthGate|AppShell)(\s|>)/.test(source)) {
        violations.push(`${normalized}: renders a workspace shell owner`);
      }
    }
  }
}

walk(appRoot.pathname);
const layout = readFileSync(layoutPath, "utf8");
for (const expected of ["<AuthGate>", "<AppShell>{children}</AppShell>"]) {
  if (!layout.includes(expected)) violations.push(`workspace layout is missing ${expected}`);
}

if (violations.length) {
  console.error("Workspace shell ownership violations:\n" + violations.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log("Workspace shell ownership is singular and layout-owned.");
