import App from './src/App';
import { ThemeProvider } from './src/hooks/use-theme';

export default function Root() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}
