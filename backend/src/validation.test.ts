import { describe, expect, it } from 'vitest';
import { validatePersonPayload } from './validation.js';

describe('validatePersonPayload', () => {
  const validPayload = {
    firstName: 'Juan',
    lastName: 'Pérez',
    dateOfBirth: '1990-05-15',
    anniversaryDate: '2015-08-20',
    photoUrl: null,
  };

  describe('firstName validation', () => {
    it('should accept valid first name', () => {
      const result = validatePersonPayload(validPayload);
      expect(result.isValid).toBe(true);
      expect(result.errors.firstName).toBeUndefined();
    });

    it('should reject empty first name', () => {
      const result = validatePersonPayload({ ...validPayload, firstName: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.firstName).toBe('El nombre es obligatorio.');
    });

    it('should reject first name over 80 characters', () => {
      const result = validatePersonPayload({
        ...validPayload,
        firstName: 'A'.repeat(81),
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.firstName).toBe('El nombre debe tener 80 caracteres o menos.');
    });

    it('should trim and normalize whitespace in first name', () => {
      const result = validatePersonPayload({
        ...validPayload,
        firstName: '  Juan   Carlos  ',
      });
      expect(result.isValid).toBe(true);
      expect(result.data.firstName).toBe('Juan Carlos');
    });
  });

  describe('lastName validation', () => {
    it('should accept valid last name', () => {
      const result = validatePersonPayload(validPayload);
      expect(result.isValid).toBe(true);
      expect(result.errors.lastName).toBeUndefined();
    });

    it('should reject empty last name', () => {
      const result = validatePersonPayload({ ...validPayload, lastName: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.lastName).toBe('El apellido es obligatorio.');
    });

    it('should reject last name over 80 characters', () => {
      const result = validatePersonPayload({
        ...validPayload,
        lastName: 'A'.repeat(81),
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.lastName).toBe('El apellido debe tener 80 caracteres o menos.');
    });
  });

  describe('dateOfBirth validation', () => {
    it('should accept valid date of birth', () => {
      const result = validatePersonPayload(validPayload);
      expect(result.isValid).toBe(true);
      expect(result.errors.dateOfBirth).toBeUndefined();
    });

    it('should reject invalid date format', () => {
      const result = validatePersonPayload({
        ...validPayload,
        dateOfBirth: '15/05/1990',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.dateOfBirth).toContain('AAAA-MM-DD');
    });

    it('should reject future date of birth', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const result = validatePersonPayload({
        ...validPayload,
        dateOfBirth: futureDate.toISOString().split('T')[0],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.dateOfBirth).toBe('La fecha de nacimiento no puede estar en el futuro.');
    });

    it('should reject invalid calendar date', () => {
      const result = validatePersonPayload({
        ...validPayload,
        dateOfBirth: '2024-02-30',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.dateOfBirth).toContain('fecha real del calendario');
    });
  });

  describe('anniversaryDate validation', () => {
    it('should accept valid anniversary date', () => {
      const result = validatePersonPayload(validPayload);
      expect(result.isValid).toBe(true);
      expect(result.errors.anniversaryDate).toBeUndefined();
    });

    it('should reject invalid date format', () => {
      const result = validatePersonPayload({
        ...validPayload,
        anniversaryDate: '20/08/2015',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.anniversaryDate).toContain('AAAA-MM-DD');
    });

    it('should reject future anniversary date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const result = validatePersonPayload({
        ...validPayload,
        anniversaryDate: futureDate.toISOString().split('T')[0],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.anniversaryDate).toBe('La fecha de aniversario no puede estar en el futuro.');
    });
  });

  describe('photoUrl validation', () => {
    it('should accept null photo URL', () => {
      const result = validatePersonPayload({ ...validPayload, photoUrl: null });
      expect(result.isValid).toBe(true);
      expect(result.data.photoUrl).toBeNull();
    });

    it('should accept string photo URL', () => {
      const result = validatePersonPayload({
        ...validPayload,
        photoUrl: 'https://example.com/photo.jpg',
      });
      expect(result.isValid).toBe(true);
      expect(result.data.photoUrl).toBe('https://example.com/photo.jpg');
    });
  });

  describe('multiple errors', () => {
    it('should return all validation errors', () => {
      const result = validatePersonPayload({
        firstName: '',
        lastName: '',
        dateOfBirth: 'invalid',
        anniversaryDate: 'invalid',
        photoUrl: null,
      });
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
      expect(result.errors.firstName).toBeDefined();
      expect(result.errors.lastName).toBeDefined();
      expect(result.errors.dateOfBirth).toBeDefined();
      expect(result.errors.anniversaryDate).toBeDefined();
    });
  });
});
