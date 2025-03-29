import { describe, it, expect } from 'vitest';

// Mock the Astro component
const mockFooterNavItem = (props: { path: string; title: string }, currentPath: string) => {
  const isActive = currentPath === props.path;
  const activeClass = isActive ? 'font-medium text-gray-900 dark:text-white' : '';
  return `<a href="${props.path}" class="${activeClass}">${props.title}</a>`;
};

describe('FooterNavItem Component (Mocked)', () => {
  it('renders with the correct title', () => {
    const result = mockFooterNavItem({ path: '/about', title: 'About' }, '');
    
    // Check that the title is rendered inside the component
    expect(result).toContain('href="/about"');
    expect(result).toContain('>About<');
  });

  it('applies active class when current path matches', () => {
    const result = mockFooterNavItem({ path: '/about', title: 'About' }, '/about');
    
    // Check for the active class in the rendered HTML
    expect(result).toContain('font-medium');
    expect(result).toContain('text-gray-900');
    expect(result).toContain('dark:text-white');
  });

  it('does not apply active class when current path does not match', () => {
    const result = mockFooterNavItem({ path: '/about', title: 'About' }, '/contact');
    
    // Check that the active classes are not present
    expect(result).not.toContain('font-medium');
    expect(result).not.toContain('text-gray-900');
    expect(result).not.toContain('dark:text-white');
  });
});