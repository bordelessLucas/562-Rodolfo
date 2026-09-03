import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button, Container, Input, Typography } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { colors, radius, space } from '@/src/theme';

export function LoginScreen() {
  const router = useRouter();
  const { signIn, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');
    setFormError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Informe o e-mail.');
      return;
    }
    if (!password) {
      setPasswordError('Informe a senha.');
      return;
    }

    setLoading(true);
    try {
      await signIn(trimmedEmail, password);
      router.replace('/home');
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Não foi possível entrar.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setFormError('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Informe o e-mail para recuperar a senha.');
      return;
    }

    setResetLoading(true);
    try {
      await resetPassword(trimmedEmail);
      Alert.alert(
        'E-mail enviado',
        'Se existir uma conta com este e-mail, você receberá o link de recuperação.',
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar a recuperação.',
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleCreateAccount = () => {
    router.push('/register');
  };

  return (
    <Container scroll keyboardAvoiding contentStyle={styles.content}>
      <LinearGradient
        colors={[colors.backgroundAccent, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroWash}
      />

      <View style={styles.brandBlock}>
        <Typography variant="caption" color={colors.secondary} style={styles.eyebrow}>
          Acompanhamento especializado
        </Typography>
        <Typography variant="display" accessibilityRole="header">
          Lipedema
        </Typography>
        <Typography variant="body" color={colors.textMuted} style={styles.subtitle}>
          Entre para acompanhar seu diário e sua jornada de cuidado.
        </Typography>
      </View>

      <View style={styles.formCard}>
        <Typography variant="h2" style={styles.formTitle}>
          Entrar
        </Typography>

        <Input
          label="E-mail"
          leftIcon="mail-outline"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />

        <Input
          label="Senha"
          leftIcon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          error={passwordError}
          placeholder="Digite sua senha"
          isPassword
          autoComplete="password"
          textContentType="password"
        />

        {formError ? (
          <Typography variant="caption" color={colors.error}>
            {formError}
          </Typography>
        ) : null}

        <Pressable
          accessibilityRole="link"
          onPress={handleForgotPassword}
          disabled={resetLoading}
          style={styles.forgotLink}
        >
          <Typography variant="label" color={colors.primary}>
            {resetLoading ? 'Enviando...' : 'Esqueci minha senha'}
          </Typography>
        </Pressable>

        <Button
          label="Entrar"
          onPress={handleLogin}
          loading={loading}
          style={styles.primaryAction}
        />

        <Button
          label="Criar conta"
          variant="outline"
          onPress={handleCreateAccount}
          disabled={loading}
        />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    gap: space[7],
    position: 'relative',
  },
  heroWash: {
    ...StyleSheet.absoluteFillObject,
    borderBottomRightRadius: 48,
    height: '42%',
  },
  brandBlock: {
    gap: space[2],
    zIndex: 1,
  },
  eyebrow: {
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  subtitle: {
    maxWidth: 320,
  },
  formCard: {
    zIndex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space[6],
    gap: space[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    marginBottom: space[1],
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: -space[1],
  },
  primaryAction: {
    marginTop: space[2],
  },
});
