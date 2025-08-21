import { executeCommand } from "./index";
import { access } from "fs/promises";
import * as path from "path";

/**
 * ShareX path resolution and CLI utilities
 * - Auto-detect ShareX installation path
 * - Allow manual override via preference (provide pathHint to resolver)
 * - Execute ShareX with arguments
 */

function expandEnv(input: string): string {
  return input.replace(/%([^%]+)%/g, (_, name) => process.env[String(name)] || `%${name}%`);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function sanitizePath(p: string): string {
  const trimmed = p.trim().replace(/^"|"$/g, "");
  // Normalize to Windows-style backslashes while keeping drive letters
  return path.win32.normalize(trimmed);
}

async function findFromWhere(): Promise<string | undefined> {
  try {
    const stdout = await executeCommand("where ShareX.exe", { suppressErrorLog: true });
    const lines = stdout.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const candidate = sanitizePath(line);
      if (candidate.toLowerCase().endsWith("sharex.exe") && (await fileExists(candidate))) {
        return candidate;
      }
    }
  } catch {
    // ignore
  }
  return undefined;
}

async function findFromDefaults(): Promise<string | undefined> {
  const candidates = [
    "%ProgramFiles%\\ShareX\\ShareX.exe",
    "%ProgramFiles(x86)%\\ShareX\\ShareX.exe",
    "%LocalAppData%\\Programs\\ShareX\\ShareX.exe", // user-scoped install
    "%LocalAppData%\\ShareX\\ShareX.exe", // portable/common
  ].map(expandEnv);

  for (const c of candidates) {
    const candidate = sanitizePath(c);
    if (await fileExists(candidate)) return candidate;
  }
  return undefined;
}

async function findFromRegistry(): Promise<string | undefined> {
  // Query Uninstall registry keys for ShareX using base64-encoded script to avoid quoting issues
  const script = `
$keys = @('HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*','HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*')
$app = Get-ItemProperty -Path $keys -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -like 'ShareX*' } | Select-Object -First 1
$p = $null
if ($app) {
  if ($app.InstallLocation) { $p = Join-Path $app.InstallLocation 'ShareX.exe' }
  elseif ($app.DisplayIcon) { $p = $app.DisplayIcon -replace '^\"|\"$','' }
}
if ($p) { Write-Output $p }
`;

  try {
    const encoded = Buffer.from(script, "utf16le").toString("base64");
    const stdout = await executeCommand(`powershell -NoProfile -EncodedCommand ${encoded}`, {
      encoding: "utf8",
      timeout: 8000,
      suppressErrorLog: true,
    });
    const output = stdout.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)[0];
    if (!output) return undefined;
    let candidate = sanitizePath(output);
    if (!candidate.toLowerCase().endsWith("sharex.exe")) {
      candidate = path.win32.join(candidate, "ShareX.exe");
    }
    if (await fileExists(candidate)) return candidate;
  } catch {
    // ignore
  }
  return undefined;
}

/**
 * Try to auto-detect ShareX executable path.
 * Order: PATH (where) -> Registry -> Default locations.
 */
export async function findShareXPath(): Promise<string | undefined> {
  return (await findFromWhere()) || (await findFromRegistry()) || (await findFromDefaults());
}

/**
 * Resolve ShareX path given an optional manual hint (preference).
 * Validates the hint and falls back to auto-detection.
 */
export async function resolveShareXPath(pathHint?: string): Promise<string | undefined> {
  if (pathHint) {
    const candidate = sanitizePath(expandEnv(pathHint));
    if (candidate.toLowerCase().endsWith("sharex.exe") && (await fileExists(candidate))) {
      return candidate;
    }
  }
  return findShareXPath();
}

function quoteArg(arg: string): string {
  if (/[^A-Za-z0-9_\-\.=/:\\]/.test(arg)) {
    return `"${arg.replace(/\"/g, '\\\"')}"`;
  }
  return arg;
}

/**
 * Run ShareX with the provided arguments.
 * Throws if ShareX is not found.
 */
export async function runShareX(args: string[], options?: { pathHint?: string; timeout?: number }): Promise<string> {
  const exe = await resolveShareXPath(options?.pathHint);
  if (!exe) {
    throw new Error(
      "ShareX executable not found. Configure the path in the extension settings or ensure ShareX is installed.",
    );
  }
  const cmd = `"${exe}" ${args.map(quoteArg).join(" ")}`.trim();
  return executeCommand(cmd, { timeout: options?.timeout ?? 15000, encoding: "utf8" });
}
