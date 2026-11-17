// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeSelector } from './ThemeSelector';
import { applyTheme, loadTheme } from '../platform/storage/theme';

beforeEach(() => {
  window.localStorage.clear();
  applyTheme('system');
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  applyTheme('system');
});

describe('theme preference', () => {
  it('defaults to system appearance and immediately switches both ways', () => {
    render(<ThemeSelector />);
    expect((screen.getByLabelText('Theme') as HTMLSelectElement).value).toBe(
      'system',
    );
    fireEvent.change(screen.getByLabelText('Theme'), {
      target: { value: 'dark' },
    });
    expect(document.documentElement.style.colorScheme).toBe('dark');
    fireEvent.change(screen.getByLabelText('Theme'), {
      target: { value: 'light' },
    });
    expect(document.documentElement.style.colorScheme).toBe('light');
    fireEvent.change(screen.getByLabelText('Theme'), {
      target: { value: 'system' },
    });
    expect(document.documentElement.style.colorScheme).toBe('light dark');
  });

  it('restores the selected theme on the next visit', () => {
    render(<ThemeSelector />);
    fireEvent.change(screen.getByLabelText('Theme'), {
      target: { value: 'dark' },
    });
    cleanup();
    applyTheme(loadTheme());
    render(<ThemeSelector />);
    expect((screen.getByLabelText('Theme') as HTMLSelectElement).value).toBe(
      'dark',
    );
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('still switches themes when browser storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Blocked');
    });
    render(<ThemeSelector />);
    fireEvent.change(screen.getByLabelText('Theme'), {
      target: { value: 'dark' },
    });
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });
});
