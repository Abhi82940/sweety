import { describe, it, expect } from 'vitest';
import { getTodayString, formatDisplayDate, getGlucoseCategory } from './helpers';

describe('Frontend Helpers & Clinical Classification', () => {
  it('should format today date as YYYY-MM-DD', () => {
    const today = getTodayString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should format display date correctly', () => {
    const formatted = formatDisplayDate('2026-10-15');
    expect(formatted).toContain('Oct');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2026');
  });

  it('should classify fasting glucose correctly', () => {
    // Normal fasting: 70 - 99
    expect(getGlucoseCategory(85, 'Morning (fasting)').label).toBe('Normal');

    // Pre-diabetes fasting: 100 - 125
    expect(getGlucoseCategory(110, 'Morning (fasting)').label).toBe('Pre-diabetes Range');

    // Elevated fasting: >= 126
    expect(getGlucoseCategory(145, 'Morning (fasting)').label).toBe('Elevated');

    // Hypoglycemia: < 70
    expect(getGlucoseCategory(55, 'Morning (fasting)').label).toBe('Low (Hypoglycemia)');
  });

  it('should classify post-meal glucose correctly', () => {
    // Normal post-meal: < 140
    expect(getGlucoseCategory(120, 'After lunch').label).toBe('Normal');

    // Borderline high post-meal: 140 - 199
    expect(getGlucoseCategory(165, 'After dinner').label).toBe('Borderline High');

    // High post-meal: >= 200
    expect(getGlucoseCategory(220, 'After breakfast').label).toBe('High');
  });
});
