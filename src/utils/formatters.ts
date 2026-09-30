export const formatPrice = (price?: number | null): string => {
  if (price === undefined || price === null || isNaN(price)) return '0 so‘m';
  return new Intl.NumberFormat('uz-UZ').format(price) + ' so‘m';
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return new Intl.DateTimeFormat('uz-UZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const formatShortDate = (dateString?: string): string => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return new Intl.DateTimeFormat('uz-UZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

export const truncate = (str: string, maxLen = 60): string => {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
};
