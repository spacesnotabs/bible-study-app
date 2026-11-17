export type ThemePreference = 'system' | 'light' | 'dark';

const key = 'bible-study:theme:v1';

export function loadTheme(): ThemePreference {
  try {
    const value = window.localStorage.getItem(key);
    if (value === 'light' || value === 'dark') return value;
  } catch {
    // A blocked preference store must not prevent reading or changing themes.
  }
  return 'system';
}

export function applyTheme(theme: ThemePreference): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme =
    theme === 'system' ? 'light dark' : theme;
}

export function saveTheme(theme: ThemePreference): void {
  try {
    window.localStorage.setItem(key, theme);
  } catch {
    // The selected theme still applies for this visit.
  }
}
