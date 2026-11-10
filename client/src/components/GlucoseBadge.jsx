import React from 'react';
import { getGlucoseCategory } from '../utils/helpers';

const GlucoseBadge = ({ value, timeSlot, showValue = false }) => {
  const category = getGlucoseCategory(value, timeSlot);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${category.bg}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {showValue && <span className="font-bold">{value} mg/dl • </span>}
      {category.label}
    </span>
  );
};

export default GlucoseBadge;
