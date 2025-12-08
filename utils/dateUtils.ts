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