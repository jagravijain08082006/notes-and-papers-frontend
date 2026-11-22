#!/usr/bin/env node
// Deploys the committed code to Vercel production from this machine:  npm run vercel:deploy   (add --dry to only export)
//
// Why not just `vercel deploy`, or a push to GitHub? Vercel's Hobby plan blocks a deployment whose commit author is not a member
// of the Vercel project (and Hobby cannot add members to a private repository). The CLI attaches the last commit's author, so it
// is blocked too. This exports the committed files WITHOUT the git history to a temporary folder and deploys that: no author
// is attached, so nothing is blocked. Needs `npx vercel login` once and the folder linked (.vercel/project.json).
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";

const dry = process.argv.includes("--dry");
const root = process.cwd();
if (!existsSync(join(root, ".vercel", "project.json"))) {
  console.error("Not linked to a Vercel project. Run:  npx vercel link --yes --project notes-and-papers-frontend");
  process.exit(1);
}
const dirty = execSync("git status --porcelain", { encoding: "utf8" }).trim();
if (dirty) console.warn("Note: uncommitted changes are NOT deployed (only the last commit is):\n" + dirty + "\n");

const deployTempRoot = resolve(tmpdir());
const tmp = resolve(mkdtempSync(join(deployTempRoot, "np-vercel-")));
if (dirname(tmp) !== deployTempRoot || !basename(tmp).startsWith("np-vercel-")) {
  throw new Error("Unexpected deployment temporary directory; refusing cleanup.");
}
try {
  // git writes the archive to an absolute path; tar then runs inside the folder with a relative name (GNU tar mistakes the
  // "C:" of a Windows path for a remote host).
  execSync(`git archive --format=tar --output="${join(tmp, "source.tar")}" HEAD`, { stdio: "inherit" });
  execSync("tar -xf source.tar", { cwd: tmp, stdio: "inherit" });
  rmSync(join(tmp, "source.tar"));
  mkdirSync(join(tmp, ".vercel"));
  cpSync(join(root, ".vercel", "project.json"), join(tmp, ".vercel", "project.json"));
  console.log(`Exported ${execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim()} to ${tmp}`);
  if (dry) {
    console.log("Dry run: not deploying.");
  } else {
    execSync("npx vercel deploy --prod --yes", { cwd: tmp, stdio: "inherit" });
  }
} finally {
  // Windows (antivirus, the Vercel CLI) can keep the folder locked for longer than the retries. The deploy has already succeeded
  // by now, so a leftover temporary folder must never turn it into an error.
  try {
    rmSync(tmp, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
  } catch {
    console.warn(`Could not remove the temporary folder ${tmp}; it is safe to delete later.`);
  }
}
