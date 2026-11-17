import { BibleReader } from '../features/reader/BibleReader';
import { ThemeSelector } from './ThemeSelector';

export function App() {
  return <BibleReader headerActions={<ThemeSelector />} />;
}
