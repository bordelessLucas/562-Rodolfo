import { AuthGate } from '@/src/components/AuthGate';
import { HomeScreen } from '@/src/screens';

export default function HomeRoute() {
  return (
    <AuthGate requireAuth>
      <HomeScreen />
    </AuthGate>
  );
}
