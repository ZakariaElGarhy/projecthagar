import fs from "fs";

// Remove lockfiles from other package managers so pnpm stays the single source of truth
for (const file of ["package-lock.json", "yarn.lock"]) {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`Removed ${file}`);
  }
}

// Make sure this is actually being run through pnpm
const userAgent = process.env.npm_config_user_agent || "";
if (!userAgent.startsWith("pnpm")) {
  console.error("Use pnpm instead (run: pnpm install)");
  process.exit(1);
}