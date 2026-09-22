import { dashboard } from './dashboard.config';
import Home from './pages/Home';
import { menu } from './routes';
import { ShellProvider } from './shell/ShellContext';
import ShellRoutes from './shell/ShellRoutes';

export default function App() {
  return (
    <ShellProvider menu={menu} config={dashboard}>
      <ShellRoutes home={Home} />
    </ShellProvider>
  );
}
