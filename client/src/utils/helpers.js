/**
 * Get current date as YYYY-MM-DD
 */
export const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format YYYY-MM-DD to readable date like "15 Oct 2026"
 */
export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Determine clinical glucose category
 * Fasting: Normal 70-99 mg/dl, Pre-diabetes 100-125, Diabetes >=126
 * Post-prandial (After meal): Normal <140 mg/dl, Pre-diabetes 140-199, Diabetes >=200
 */
export const getGlucoseCategory = (value, timeSlot = '') => {
  const val = Number(value);
  if (isNaN(val)) return { label: 'Unknown', color: 'slate', bg: 'bg-slate-100 text-slate-700' };

  if (val < 70) {
    return {
      label: 'Low (Hypoglycemia)',
      color: 'amber',
      bg: 'bg-amber-100 text-amber-800 border-amber-300'
    };
  }

  const isFasting = timeSlot && timeSlot.toLowerCase().includes('fasting');

  if (isFasting) {
    if (val <= 99) {
      return {
        label: 'Normal',
        color: 'emerald',
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300'
      };
    } else if (val <= 125) {
      return {
        label: 'Pre-diabetes Range',
        color: 'yellow',
        bg: 'bg-yellow-100 text-yellow-800 border-yellow-300'
      };
    } else {
      return {
        label: 'Elevated',
        color: 'rose',
        bg: 'bg-rose-100 text-rose-800 border-rose-300'
      };
    }
  } else {
    // Post-meal
    if (val < 140) {
      return {
        label: 'Normal',
        color: 'emerald',
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300'
      };
    } else if (val <= 199) {
      return {
        label: 'Borderline High',
        color: 'yellow',
        bg: 'bg-yellow-100 text-yellow-800 border-yellow-300'
      };
    } else {
      return {
        label: 'High',
        color: 'rose',
        bg: 'bg-rose-100 text-rose-800 border-rose-300'
      };
    }
  }
};

/**
 * Export data array to CSV file download
 */
export const exportToCsv = (filename, data) => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((fieldName) => {
          const val = row[fieldName] === null || row[fieldName] === undefined ? '' : row[fieldName];
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    )
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
