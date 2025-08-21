import { executeCommand } from "./index";

/**
 * Windows-specific utilities for Raycast extensions
 * This file demonstrates how to interact with Windows systems from Raycast
 */

/**
 * Read a Windows registry value
 * @param path Registry path (e.g., "HKCU\\Software\\MyApp")
 * @param value Value name to read
 * @returns The registry value as a string, or undefined if not found
 */
export async function readRegistryString(path: string, value: string): Promise<string | undefined> {
  try {
    const cmd = `reg query "${path}" /v ${value}`;
    const output = await executeCommand(cmd);
    
    // Parse output like: "    ValueName    REG_SZ    ValueData"
    const lines = output.split(/\r?\n/);
    const regex = new RegExp(`^\\s*${value}\\s+REG_\\w+\\s+(.+)$`, "i");
    
    for (const line of lines) {
      const match = line.match(regex);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Get system information using Windows commands
 * @returns Object with basic system info
 */
export async function getSystemInfo(): Promise<{
  computerName?: string;
  username?: string;
  osVersion?: string;
}> {
  try {
    const [computerName, username, osVersion] = await Promise.allSettled([
      executeCommand("echo %COMPUTERNAME%"),
      executeCommand("echo %USERNAME%"),
      executeCommand("ver")
    ]);

    return {
      computerName: computerName.status === "fulfilled" ? computerName.value.trim() : undefined,
      username: username.status === "fulfilled" ? username.value.trim() : undefined,
      osVersion: osVersion.status === "fulfilled" ? osVersion.value.trim() : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Open a file or folder in Windows Explorer
 * @param path Path to open
 */
export async function openInExplorer(path: string): Promise<void> {
  await executeCommand(`start "" "${path}"`);
}

/**
 * Get running processes (simplified example)
 * @returns Array of process information
 */
export async function getRunningProcesses(): Promise<Array<{
  name: string;
  pid: string;
  memoryUsage: string;
}>> {
  try {
    const output = await executeCommand('wmic process get Name,ProcessId,PageFileUsage /format:csv');
    const lines = output.split('\n').filter(line => line.trim() && !line.startsWith('Node'));
    
    return lines.slice(1, 11).map((line, index) => {
      const parts = line.split(',');
      return {
        name: parts[1] || `Process ${index + 1}`,
        pid: parts[2] || 'N/A',
        memoryUsage: `${parts[3] || '0'}KB`
      };
    });
  } catch {
    return [];
  }
}

/**
 * Check if a Windows service is running
 * @param serviceName Name of the service to check
 * @returns True if service is running, false otherwise
 */
export async function isServiceRunning(serviceName: string): Promise<boolean> {
  try {
    const output = await executeCommand(`sc query "${serviceName}"`);
    return output.includes("RUNNING");
  } catch {
    return false;
  }
}

/**
 * Get Windows environment variable
 * @param variableName Name of the environment variable
 * @returns Value of the environment variable or undefined
 */
export async function getEnvironmentVariable(variableName: string): Promise<string | undefined> {
  try {
    const output = await executeCommand(`echo %${variableName}%`);
    const value = output.trim();
    return value === `%${variableName}%` ? undefined : value;
  } catch {
    return undefined;
  }
}
