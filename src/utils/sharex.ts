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
export type ShareXPathSource = "preference" | "path" | "registry" | "defaults" | "none";

export interface ResolvedShareXPath {
  path?: string;
  source: ShareXPathSource;
  methodLabel: string;
  methodDescription?: string;
}

function sourceLabel(source: ShareXPathSource): string {
  switch (source) {
    case "preference":
      return "Preference override (validated)";
    case "path":
      return "PATH lookup (where ShareX.exe)";
    case "registry":
      return "Registry query (Uninstall keys)";
    case "defaults":
      return "Common install locations";
    default:
      return "Not found";
  }
}

function sourceDescription(source: ShareXPathSource): string {
  switch (source) {
    case "preference":
      return "User-specified path from extension preferences. Environment variables are expanded and the path is validated on disk.";
    case "path":
      return "Searched system PATH using 'where ShareX.exe'. Validates the first matching executable that exists on disk.";
    case "registry":
      return "Queried Windows Uninstall registry keys (HKLM 64-bit and WOW6432Node) via PowerShell, using InstallLocation or DisplayIcon to locate ShareX.exe.";
    case "defaults":
      return "Checked common install directories, including %ProgramFiles%, %ProgramFiles(x86)%, and %LocalAppData% user-scoped installs.";
    default:
      return "No installation found via preference override, PATH lookup, registry query, or common locations.";
  }
}

export async function resolveShareXPathDetailed(pathHint?: string): Promise<ResolvedShareXPath> {
  if (pathHint) {
    const candidate = sanitizePath(expandEnv(pathHint));
    if (candidate.toLowerCase().endsWith("sharex.exe") && (await fileExists(candidate))) {
      return {
        path: candidate,
        source: "preference",
        methodLabel: sourceLabel("preference"),
        methodDescription: sourceDescription("preference"),
      };
    }
  }

  const fromWhere = await findFromWhere();
  if (fromWhere)
    return {
      path: fromWhere,
      source: "path",
      methodLabel: sourceLabel("path"),
      methodDescription: sourceDescription("path"),
    };

  const fromRegistry = await findFromRegistry();
  if (fromRegistry)
    return {
      path: fromRegistry,
      source: "registry",
      methodLabel: sourceLabel("registry"),
      methodDescription: sourceDescription("registry"),
    };

  const fromDefaults = await findFromDefaults();
  if (fromDefaults)
    return {
      path: fromDefaults,
      source: "defaults",
      methodLabel: sourceLabel("defaults"),
      methodDescription: sourceDescription("defaults"),
    };

  return {
    path: undefined,
    source: "none",
    methodLabel: sourceLabel("none"),
    methodDescription: sourceDescription("none"),
  };
}

export async function resolveShareXPath(pathHint?: string): Promise<string | undefined> {
  const { path } = await resolveShareXPathDetailed(pathHint);
  return path;
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
