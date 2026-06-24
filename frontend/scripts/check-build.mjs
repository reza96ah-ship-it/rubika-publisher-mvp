import { rmSync } from "node:fs";
import { spawnSync } from "node:child_process";

const distDir = ".next-check";

rmSync(distDir, { recursive: true, force: true });

const result = spawnSync("next", ["build"], {
  env: { ...process.env, NEXT_DIST_DIR: distDir },
  shell: process.platform === "win32",
  stdio: "inherit"
});

rmSync(distDir, { recursive: true, force: true });

process.exit(result.status ?? 1);

