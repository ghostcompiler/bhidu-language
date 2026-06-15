const { spawnSync } = require("child_process");
const { mkdtempSync, readFileSync, rmSync } = require("fs");
const { tmpdir } = require("os");
const { join } = require("path");

const packageJson = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf8")
);
const npmCache = mkdtempSync(join(tmpdir(), "bhidu-npm-cache-"));

try {
  const result = spawnSync(
    "npm",
    ["pack", "--dry-run", "--cache", npmCache],
    {
      cwd: join(__dirname, ".."),
      encoding: "utf8",
      stdio: "inherit",
    }
  );

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }

  console.log(
    `\nRelease ${packageJson.name}@${packageJson.version} passed all checks.`
  );
  console.log("Publish with: npm publish");
} finally {
  rmSync(npmCache, { recursive: true, force: true });
}
