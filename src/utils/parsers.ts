/**
 * File parsing utilities for Raycast extensions
 * This file demonstrates how to parse various file formats
 */

/**
 * Parse a simple INI-style configuration file
 * @param content File content as string
 * @returns Parsed configuration object
 */
export function parseINI(content: string): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};
  const lines = content.split(/\r?\n/);
  let currentSection = 'default';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) {
      continue;
    }
    
    // Section header
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      currentSection = trimmed.slice(1, -1);
      if (!result[currentSection]) {
        result[currentSection] = {};
      }
      continue;
    }
    
    // Key-value pair
    const equalIndex = trimmed.indexOf('=');
    if (equalIndex > 0) {
      const key = trimmed.slice(0, equalIndex).trim();
      const value = trimmed.slice(equalIndex + 1).trim();
      
      if (!result[currentSection]) {
        result[currentSection] = {};
      }
      result[currentSection][key] = value;
    }
  }
  
  return result;
}

/**
 * Parse a simple CSV file
 * @param content CSV content as string
 * @param delimiter Column delimiter (default: comma)
 * @returns Array of objects with headers as keys
 */
export function parseCSV(content: string, delimiter = ','): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(delimiter).map(h => h.trim());
  const result: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim());
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    result.push(row);
  }
  
  return result;
}

/**
 * Parse a simple properties file (key=value format)
 * @param content Properties file content
 * @returns Object with key-value pairs
 */
export function parseProperties(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = content.split(/\r?\n/);
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('!')) {
      continue;
    }
    
    const equalIndex = trimmed.indexOf('=');
    const colonIndex = trimmed.indexOf(':');
    const separatorIndex = equalIndex !== -1 ? 
      (colonIndex !== -1 ? Math.min(equalIndex, colonIndex) : equalIndex) :
      colonIndex;
    
    if (separatorIndex > 0) {
      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      result[key] = value;
    }
  }
  
  return result;
}
