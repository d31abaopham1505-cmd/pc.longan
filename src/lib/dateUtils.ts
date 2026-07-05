/**
 * Helper utility to convert a date string (typically YYYY-MM-DD) into DD/MM/YYYY format.
 */
export function formatDateDMY(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  const cleanStr = dateStr.trim();
  // Match YYYY-MM-DD
  const parts = cleanStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  // Try matching MM/DD/YYYY or other formats if needed, otherwise fall back
  return dateStr;
}
