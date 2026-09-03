import { AuthGate } from '@/src/components/AuthGate';
import { RegisterScreen } from '@/src/screens';

export default function RegisterRoute() {
  return (
    <AuthGate>
      <RegisterScreen />
    </AuthGate>
  );
}
