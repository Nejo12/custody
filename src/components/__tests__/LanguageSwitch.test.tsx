import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguageSwitch from '../LanguageSwitch';
import { useI18n } from '@/i18n';

vi.mock('@/i18n', () => ({
  useI18n: vi.fn(),
}));

describe('LanguageSwitch', () => {
  const mockSetLocale = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      locale: 'en',
      setLocale: mockSetLocale,
    });
  });

  it('renders all language buttons', () => {
    render(<LanguageSwitch />);
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('DE')).toBeInTheDocument();
    expect(screen.getByText('AR')).toBeInTheDocument();
    expect(screen.getByText('PL')).toBeInTheDocument();
    expect(screen.getByText('FR')).toBeInTheDocument();
    expect(screen.getByText('TR')).toBeInTheDocument();
    expect(screen.getByText('RU')).toBeInTheDocument();
  });

  it('highlights current locale', () => {
    render(<LanguageSwitch />);
    const enButton = screen.getByText('EN').closest('button');
    expect(enButton).toHaveClass('bg-black', 'text-white');
  });

  it('calls setLocale when clicking a language button', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitch />);
    
    const deButton = screen.getByText('DE');
    await user.click(deButton);
    
    expect(mockSetLocale).toHaveBeenCalledWith('de');
  });

  it('switches to Arabic when AR is clicked', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitch />);
    
    const arButton = screen.getByText('AR');
    await user.click(arButton);
    
    expect(mockSetLocale).toHaveBeenCalledWith('ar');
  });

  it('switches to Polish when PL is clicked', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitch />);
    
    const plButton = screen.getByText('PL');
    await user.click(plButton);
    
    expect(mockSetLocale).toHaveBeenCalledWith('pl');
  });

  it('updates highlight when locale changes', () => {
    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      locale: 'de',
      setLocale: mockSetLocale,
    });
    
    const { rerender } = render(<LanguageSwitch />);
    const deButton = screen.getByText('DE').closest('button');
    expect(deButton).toHaveClass('bg-black', 'text-white');

    (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
      locale: 'fr',
      setLocale: mockSetLocale,
    });
    
    rerender(<LanguageSwitch />);
    const frButton = screen.getByText('FR').closest('button');
    expect(frButton).toHaveClass('bg-black', 'text-white');
  });

  it('has proper accessibility attributes', () => {
    render(<LanguageSwitch />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('aria-pressed');
    });
  });

  it('sets aria-pressed correctly for active locale', () => {
    render(<LanguageSwitch />);
    const enButton = screen.getByText('EN').closest('button');
    expect(enButton).toHaveAttribute('aria-pressed', 'true');
    
    const deButton = screen.getByText('DE').closest('button');
    expect(deButton).toHaveAttribute('aria-pressed', 'false');
  });
});

