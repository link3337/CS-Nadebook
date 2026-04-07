import { AppShell, Button, Container, Stack } from '@mantine/core';
import { IconHome, IconMap2, IconSettings, IconTarget } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';
import './App.css';
import AppRoutes from './AppRoutes';
import Footer from './components/Footer';
import SearchBar from './components/SearchBar';
import { seedSampleLineups } from './store/lineups';

function App() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();
  const isHomeRoute = path === '/' || path === '/home';
  const isMapsRoute = path === '/maps' || path.startsWith('/maps/');
  const isPracticeRoute = path === '/practice' || path.startsWith('/practice/');
  const isSettingsRoute = path === '/settings' || path.startsWith('/settings/');

  seedSampleLineups();

  return (
    <AppShell
      navbar={{
        width: 72,
        breakpoint: 'sm',
        collapsed: { mobile: false }
      }}
      header={{
        height: 64
      }}
      footer={{
        height: 40,
        collapsed: false
      }}
    >
      <AppShell.Navbar p="xs">
        <Stack gap="xs">
          <Button
            component={Link}
            to="/"
            variant={isHomeRoute ? 'light' : 'subtle'}
            aria-label="Home"
          >
            <IconHome size={18} />
          </Button>
          <Button
            component={Link}
            to="/maps"
            variant={isMapsRoute ? 'light' : 'subtle'}
            aria-label="Maps"
          >
            <IconMap2 size={18} />
          </Button>
          <Button
            component={Link}
            to="/practice"
            variant={isPracticeRoute ? 'light' : 'subtle'}
            aria-label="Practice"
          >
            <IconTarget size={18} />
          </Button>
          <Button
            component={Link}
            to="/settings"
            variant={isSettingsRoute ? 'light' : 'subtle'}
            aria-label="Settings"
          >
            <IconSettings size={18} />
          </Button>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Header>
        <div
          style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <SearchBar />
        </div>
      </AppShell.Header>

      <AppShell.Footer p="xs">
        <Footer />
      </AppShell.Footer>

      <AppShell.Main>
        <Container size="xxl" className="app">
          <AppRoutes />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
