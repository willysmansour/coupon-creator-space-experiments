import { cn } from '../utils';

describe('utils', () => {
  describe('cn (clsx + tailwind-merge)', () => {
    it('merges class names correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });

    it('handles conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class', false && 'hidden-class'))
        .toBe('base-class conditional-class');
    });

    it('handles undefined and null values', () => {
      expect(cn('base-class', undefined, null, 'other-class'))
        .toBe('base-class other-class');
    });

    it('handles empty input', () => {
      expect(cn()).toBe('');
    });

    it('deduplicates conflicting Tailwind classes', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });

    it('handles arrays of classes', () => {
      expect(cn(['px-2', 'py-1'], 'px-4')).toBe('py-1 px-4');
    });
  });
});
