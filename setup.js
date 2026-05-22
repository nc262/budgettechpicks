/**
 * Full automated setup: installs tools, npm deps, creates GitHub repo, deploys to Vercel.
 * Run once with: node setup.js
 */
const { execSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const CWD = __dirname;
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

function log(msg) { console.log(`${GREEN}✓${RESET} ${msg}`); }
function warn(msg) { console.log(`${YELLOW}!${RESET} ${msg}`); }
function err(msg) { console.log(`${RED}✗${RESET} ${msg}`); }

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { cwd: CWD, stdio: opts.quiet ? "pipe" : "inherit", encoding: "utf8" });
  } catch (e) {
    if (opts.ignoreError) return null;
    throw e;
  }
}

function hasCommand(cmd) {
  const r = spawnSync("where", [cmd], { cwd: CWD, encoding: "utf8" });
  return r.status === 0;
}

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans.trim()); }));
}

async function main() {
  console.log("\n🚀 BudgetTechPicks — Full Automated Setup\n");

  // ── Step 1: Install PowerShell Core ──────────────────────────────────────
  if (!hasCommand("pwsh")) {
    log("Installing PowerShell Core...");
    try {
      run("winget install --id Microsoft.PowerShell --silent --accept-source-agreements --accept-package-agreements");
      log("PowerShell Core installed.");
    } catch {
      warn("winget failed. Trying direct MSI download...");
      try {
        run('curl -L -o "%TEMP%\\pwsh.msi" "https://github.com/PowerShell/PowerShell/releases/download/v7.4.2/PowerShell-7.4.2-win-x64.msi"');
        run('msiexec /i "%TEMP%\\pwsh.msi" /quiet /norestart ADD_EXPLORER_CONTEXT_MENU_OPENPOWERSHELL=1 ENABLE_PSREMOTING=0 REGISTER_MANIFEST=1');
        log("PowerShell Core installed via MSI.");
      } catch {
        warn("Could not auto-install PowerShell. Continuing without it.");
      }
    }
  } else {
    log("PowerShell Core already installed.");
  }

  // ── Step 2: Install Node/npm deps ────────────────────────────────────────
  log("Running npm install...");
  run("npm install");
  log("npm install complete.");

  // ── Step 3: Install Vercel CLI ────────────────────────────────────────────
  if (!hasCommand("vercel")) {
    log("Installing Vercel CLI globally...");
    run("npm install -g vercel");
    log("Vercel CLI installed.");
  } else {
    log("Vercel CLI already installed.");
  }

  // ── Step 4: Check gh CLI ──────────────────────────────────────────────────
  if (!hasCommand("gh")) {
    log("Installing GitHub CLI via winget...");
    run("winget install --id GitHub.cli --silent --accept-source-agreements --accept-package-agreements", { ignoreError: true });
    log("GitHub CLI installed.");
  } else {
    log("GitHub CLI already installed.");
  }

  // ── Step 5: Create .env.local if missing ─────────────────────────────────
  const envLocal = path.join(CWD, ".env.local");
  if (!fs.existsSync(envLocal)) {
    console.log("\n──────────────────────────────────────────");
    console.log("Let's set up your affiliate credentials.\n");

    const amazonTag = await prompt("Enter your Amazon Associates tag (e.g. yourname-20), or press Enter to skip: ");
    const adsenseId = await prompt("Enter your Google AdSense publisher ID (e.g. pub-123...), or press Enter to skip: ");
    const gaId = await prompt("Enter your Google Analytics ID (e.g. G-XXXXXXXXXX), or press Enter to skip: ");

    const envContent = [
      `NEXT_PUBLIC_AMAZON_TAG=${amazonTag || "yoursite-20"}`,
      `NEXT_PUBLIC_ADSENSE_ID=${adsenseId || "pub-XXXXXXXXXXXXXXXX"}`,
      `NEXT_PUBLIC_GA_ID=${gaId || ""}`,
    ].join("\n");

    fs.writeFileSync(envLocal, envContent);
    log(".env.local created.");
    console.log("──────────────────────────────────────────\n");
  } else {
    log(".env.local already exists.");
  }

  // ── Step 6: Git init & first commit ──────────────────────────────────────
  const gitDir = path.join(CWD, ".git");
  if (!fs.existsSync(gitDir)) {
    log("Initializing git repo...");
    run("git init");
    run('git config user.email "you@example.com"', { ignoreError: true });
    run('git config user.name "BudgetTechPicks"', { ignoreError: true });
  }
  run("git add .");
  run('git commit -m "Initial commit - BudgetTechPicks affiliate site" --allow-empty', { ignoreError: true });
  log("Git commit done.");

  // ── Step 7: Create GitHub repo & push ────────────────────────────────────
  if (hasCommand("gh")) {
    const remotes = run("git remote", { quiet: true }) || "";
    if (!remotes.includes("origin")) {
      try {
        log("Creating GitHub repo and pushing...");
        run("gh repo create budgettechpicks --public --push --source=. --remote=origin");
        log("GitHub repo created: https://github.com/$(gh api user --jq .login)/budgettechpicks");
      } catch {
        warn("GitHub repo creation failed. You may need to run: gh auth login");
      }
    } else {
      log("GitHub remote already set. Pushing...");
      run("git push -u origin main", { ignoreError: true });
    }
  } else {
    warn("gh CLI not found. Skipping GitHub repo creation.");
    warn("After installing gh, run: gh repo create budgettechpicks --public --push --source=. --remote=origin");
  }

  // ── Step 8: Deploy to Vercel ──────────────────────────────────────────────
  if (hasCommand("vercel")) {
    console.log("\n──────────────────────────────────────────");
    log("Deploying to Vercel...");
    console.log("(You may be asked to log in to Vercel — follow the prompts)\n");
    try {
      run("vercel --yes --prod");
      log("🎉 Site is LIVE on Vercel!");
    } catch {
      warn("Vercel deploy had an issue. Try running: vercel --prod");
    }
    console.log("──────────────────────────────────────────\n");
  } else {
    warn("Vercel CLI not in PATH yet. Restart your terminal and run: vercel --prod");
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log("\n✅  Setup complete!");
  console.log("   Local dev:  npm run dev  →  http://localhost:3000");
  console.log("   README.md has everything else you need.\n");
}

main().catch((e) => {
  err("Setup failed: " + e.message);
  process.exit(1);
});
