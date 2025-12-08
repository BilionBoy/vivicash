// Utility to format YYYY-MM-DD string to DD/MM/YYYY ensuring local timezone consistency
export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  // Split specifically by '-' to avoid timezone conversion issues with Date object
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

// Get today's date in YYYY-MM-DD format based on local time
export const getTodayString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Generate a random UUID safely (works in non-secure contexts unlike crypto.randomUUID)
export const generateUUID = (): string => {
  // Use crypto.randomUUID if available and secure
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers or non-HTTPS contexts
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};