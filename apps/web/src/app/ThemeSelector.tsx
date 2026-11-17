import { useState } from 'react';
import { applyTheme, loadTheme, saveTheme } from '../platform/storage/theme';
import type { ThemePreference } from '../platform/storage/theme';

export function ThemeSelector() {
  const [theme, setTheme] = useState(loadTheme);

  function changeTheme(next: ThemePreference) {
    applyTheme(next);
    saveTheme(next);
    setTheme(next);
  }

  return (
    <label className="theme-control">
      Theme
      <select
        value={theme}
        onChange={(event) => changeTheme(event.target.value as ThemePreference)}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
