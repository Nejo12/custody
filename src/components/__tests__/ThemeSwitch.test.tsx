import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeSwitch from '../ThemeSwitch';
import { useAppStore } from '@/store/app';

// Mock the store
vi.mock('@/store/app', () => ({
  useAppStore: vi.fn(),
}));

// Mock i18n
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: {
      settings: {
        themeLight: 'Light',
        themeDark: 'Dark',
        themeSystem: 'System',
      },
    },
  }),
}));

describe('ThemeSwitch', () => {
  const mockSetTheme = vi.fn();
  const mockUpdateResolvedTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset DOM
    document.documentElement.className = '';
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders with light theme by default', () => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      updateResolvedTheme: mockUpdateResolvedTheme,
    });

    render(<ThemeSwitch />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Light');
    expect(button).toHaveAttribute('title', 'Light');
  });

  it('renders with dark theme', () => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      updateResolvedTheme: mockUpdateResolvedTheme,
    });

    render(<ThemeSwitch />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Dark');
  });

  it('renders with system theme', () => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'system',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      updateResolvedTheme: mockUpdateResolvedTheme,
    });

    render(<ThemeSwitch />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'System');
  });

  it('toggles from light to dark theme on click', async () => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      updateResolvedTheme: mockUpdateResolvedTheme,
    });

    const user = userEvent.setup();
    render(<ThemeSwitch />);
    const button = screen.getByRole('button');

    await user.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('toggles from dark to system theme on click', async () => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      updateResolvedTheme: mockUpdateResolvedTheme,
    });

    const user = userEvent.setup();
    render(<ThemeSwitch />);
    const button = screen.getByRole('button');

    await user.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });

  it('toggles from system to light theme on click', async () => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'system',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      updateResolvedTheme: mockUpdateResolvedTheme,
    });

    const user = userEvent.setup();
    render(<ThemeSwitch />);
    const button = screen.getByRole('button');

    await user.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('updates resolved theme on mount', () => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'system',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      updateResolvedTheme: mockUpdateResolvedTheme,
    });

    render(<ThemeSwitch />);
    expect(mockUpdateResolvedTheme).toHaveBeenCalled();
  });

  it('listens to system theme changes when theme is set to system', () => {
    const addEventListener = vi.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        addEventListener,
        removeEventListener: vi.fn(),
      })),
    });

    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'system',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      updateResolvedTheme: mockUpdateResolvedTheme,
    });

    render(<ThemeSwitch />);
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('has proper accessibility attributes', () => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      updateResolvedTheme: mockUpdateResolvedTheme,
    });

    render(<ThemeSwitch />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('title');
  });

  it('displays correct icon for light theme', () => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      updateResolvedTheme: mockUpdateResolvedTheme,
    });

    render(<ThemeSwitch />);
    const button = screen.getByRole('button');
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('displays correct icon for dark theme', () => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      updateResolvedTheme: mockUpdateResolvedTheme,
    });

    render(<ThemeSwitch />);
    const button = screen.getByRole('button');
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('displays correct icon for system theme', () => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'system',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      updateResolvedTheme: mockUpdateResolvedTheme,
    });

    render(<ThemeSwitch />);
    const button = screen.getByRole('button');
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});

