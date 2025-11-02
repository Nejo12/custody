import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '../Header';
import { useI18n } from '@/i18n';

vi.mock('@/i18n', () => ({
  useI18n: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

vi.mock('../LanguageSwitch', () => ({
  default: () => <div data-testid="language-switch">LanguageSwitch</div>,
}));

vi.mock('../ThemeSwitch', () => ({
  default: () => <div data-testid="theme-switch">ThemeSwitch</div>,
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      t: {
        appName: 'Custody Clarity',
      },
    });
  });

  it('renders app name', () => {
    render(<Header />);
    expect(screen.getByText('Custody Clarity')).toBeInTheDocument();
  });

  it('renders app name link to home', () => {
    render(<Header />);
    const link = screen.getByText('Custody Clarity').closest('a');
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders settings link', () => {
    render(<Header />);
    const settingsLink = screen.getByText('Settings');
    expect(settingsLink).toBeInTheDocument();
    expect(settingsLink.closest('a')).toHaveAttribute('href', '/settings');
  });

  it('renders language switch component', () => {
    render(<Header />);
    expect(screen.getByTestId('language-switch')).toBeInTheDocument();
  });

  it('renders theme switch component', () => {
    render(<Header />);
    expect(screen.getByTestId('theme-switch')).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('w-full', 'max-w-xl', 'mx-auto');
  });

  it('displays app name in different locales', () => {
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      t: {
        appName: 'ElternWeg',
      },
    });
    
    render(<Header />);
    expect(screen.getByText('ElternWeg')).toBeInTheDocument();
  });
});

