import { AuthGate } from '@/src/components/AuthGate';
import { LoginScreen } from '@/src/screens';

export default function LoginRoute() {
  return (
    <AuthGate>
      <LoginScreen />
    </AuthGate>
  );
}
