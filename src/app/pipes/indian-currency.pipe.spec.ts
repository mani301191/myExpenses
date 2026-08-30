import { InrFormatPipe } from './indian-currency.pipe';

describe('InrFormatPipe', () => {
  let pipe: InrFormatPipe;

  beforeEach(() => {
    pipe = new InrFormatPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null, undefined and empty string', () => {
    expect(pipe.transform(null as any)).toBe('');
    expect(pipe.transform(undefined as any)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('should format numbers with Indian grouping', () => {
    expect(pipe.transform(1234567)).toBe('₹12,34,567.00');
    expect(pipe.transform(10000000)).toBe('₹1,00,00,000.00');
    expect(pipe.transform(1000)).toBe('₹1,000.00');
  });

  it('should round decimals to 2 places with proper grouping', () => {
    expect(pipe.transform(1234.5)).toBe('₹1,234.50');
    expect(pipe.transform(1234.5678)).toBe('₹1,234.57');
  });

  it('should handle values with existing decimals', () => {
    expect(pipe.transform(0.5)).toBe('₹0.50');
    expect(pipe.transform(7.1)).toBe('₹7.10');
    expect(pipe.transform(99.99)).toBe('₹99.99');
  });

  it('should handle string input', () => {
    expect(pipe.transform('50000')).toBe('₹50,000.00');
    expect(pipe.transform('1234.5678')).toBe('₹1,234.57');
  });

  it('should handle zero', () => {
    expect(pipe.transform(0)).toBe('₹0.00');
  });

  it('should handle large values', () => {
    expect(pipe.transform(9876543210)).toBe('₹9,87,65,43,210.00');
    expect(pipe.transform(999999999)).toBe('₹99,99,99,999.00');
    expect(pipe.transform(100000000000)).toBe('₹1,00,00,00,00,000.00');
  });

  it('should handle small whole numbers', () => {
    expect(pipe.transform(5)).toBe('₹5.00');
    expect(pipe.transform(42)).toBe('₹42.00');
  });
});