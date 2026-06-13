import { describe, expect, it } from 'vitest';
import { validateIsoDate, partsFromIsoDate, getAppDateParts } from './dateUtils.js';

describe('validateIsoDate', () => {
  it('should accept valid ISO date', () => {
    const result = validateIsoDate('2024-05-15', 'Test date');
    expect(result).toBeNull();
  });

  it('should reject invalid format', () => {
    const result = validateIsoDate('15/05/2024', 'Test date');
    expect(result).toContain('AAAA-MM-DD');
  });

  it('should reject invalid calendar date', () => {
    const result = validateIsoDate('2024-02-30', 'Test date');
    expect(result).toContain('fecha real del calendario');
  });

  it('should reject invalid month', () => {
    const result = validateIsoDate('2024-13-15', 'Test date');
    expect(result).toContain('fecha real del calendario');
  });

  it('should accept leap year date', () => {
    const result = validateIsoDate('2024-02-29', 'Test date');
    expect(result).toBeNull();
  });

  it('should reject non-leap year Feb 29', () => {
    const result = validateIsoDate('2023-02-29', 'Test date');
    expect(result).toContain('fecha real del calendario');
  });
});

describe('partsFromIsoDate', () => {
  it('should parse valid ISO date into parts', () => {
    const result = partsFromIsoDate('2024-05-15');
    expect(result.date).toBe('2024-05-15');
    expect(result.month).toBe(5);
    expect(result.day).toBe(15);
  });

  it('should throw error for invalid date', () => {
    expect(() => partsFromIsoDate('invalid')).toThrow();
  });

  it('should handle single-digit months and days', () => {
    const result = partsFromIsoDate('2024-01-09');
    expect(result.month).toBe(1);
    expect(result.day).toBe(9);
  });
});

describe('getAppDateParts', () => {
  it('should return date parts for a given timezone', () => {
    const result = getAppDateParts('America/Bogota');
    expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result.month).toBeGreaterThanOrEqual(1);
    expect(result.month).toBeLessThanOrEqual(12);
    expect(result.day).toBeGreaterThanOrEqual(1);
    expect(result.day).toBeLessThanOrEqual(31);
  });

  it('should use provided date', () => {
    const testDate = new Date('2024-12-25T10:00:00Z');
    const result = getAppDateParts('UTC', testDate);
    expect(result.date).toBe('2024-12-25');
    expect(result.month).toBe(12);
    expect(result.day).toBe(25);
  });

  it('should handle different timezones correctly', () => {
    const testDate = new Date('2024-01-01T02:00:00Z');
    const utcResult = getAppDateParts('UTC', testDate);
    const bogotaResult = getAppDateParts('America/Bogota', testDate);

    expect(utcResult.date).toBe('2024-01-01');
    expect(bogotaResult.date).toBe('2023-12-31');
  });
});
