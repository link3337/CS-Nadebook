import {
  AppShell,
  Button,
  Container,
  Stack,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { IconHome, IconSettings, IconMap2, IconPlus, IconTarget } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';
import AppRoutes from './components/AppRoutes';
import Footer from './components/Footer';

function App() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('dark', { getInitialValueInEffect: true });

  const location = useLocation();
  const path = location.pathname.toLowerCase();
  const isHomeRoute = path === '/' || path === '/home';
  const isMapsRoute = path === '/maps' || path.startsWith('/maps/');
  const isNewLineupRoute = path === '/lineups/new';
  const isPracticeRoute = path === '/practice' || path.startsWith('/practice/');
  const isSettingsRoute = path === '/settings' || path.startsWith('/settings/');

  return (
    <AppShell
      navbar={{
        width: 72,
        breakpoint: 'sm',
        collapsed: { mobile: false }
      }}
      footer={{
        height: 40,
        collapsed: false
      }}
    >
      <AppShell.Navbar p="xs">
          <Stack gap="xs">
            <Button component={Link} to="/" variant={isHomeRoute ? 'light' : 'subtle'} aria-label="Home">
              <IconHome size={18} />
            </Button>
            <Button component={Link} to="/maps" variant={isMapsRoute ? 'light' : 'subtle'} aria-label="Maps">
              <IconMap2 size={18} />
            </Button>
            <Button component={Link} to="/lineups/new" variant={isNewLineupRoute ? 'light' : 'subtle'} aria-label="New lineup">
              <IconPlus size={18} />
            </Button>
            <Button component={Link} to="/practice" variant={isPracticeRoute ? 'light' : 'subtle'} aria-label="Practice">
              <IconTarget size={18} />
            </Button>
            <Button component={Link} to="/settings" variant={isSettingsRoute ? 'light' : 'subtle'} aria-label="Settings">
              <IconSettings size={18} />
            </Button>
          </Stack>
      </AppShell.Navbar>

      <AppShell.Footer p="xs">
        <Footer />
      </AppShell.Footer>

      <AppShell.Main>
        <Container
          size="xl"
          py={{ base: 'sm', sm: 'md' }}
          px={{ base: 'xs', sm: 'md' }}
          className="app"
        >
          <AppRoutes />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
