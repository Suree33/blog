import { describe, it, expect } from 'vitest';

describe('Basic test', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2);
  });
  
  it('should handle string operations', () => {
    expect('hello' + ' world').toBe('hello world');
  });
});