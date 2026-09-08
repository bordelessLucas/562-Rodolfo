import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  Input,
  SelectableChip,
  SelectableChipGroup,
  Typography,
} from '@/src/components';
import type { SignUpRole } from '@/src/domain/user';
import { useAuth } from '@/src/hooks/useAuth';
import { colors, space } from '@/src/theme';

export function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<SignUpRole>('paciente');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const nextErrors: Record<string, string> = {};
    setFormError('');

    if (!name.trim()) {
      nextErrors.name = 'Informe o nome completo.';
    }
    if (!email.trim()) {
      nextErrors.email = 'Informe o e-mail.';
    }
    if (password.length < 6) {
      nextErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
    }
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'As senhas não coincidem.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      router.replace('/');
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar a conta.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container scroll keyboardAvoiding contentStyle={styles.content}>
      <View style={styles.header}>
        <Typography variant="display" accessibilityRole="header">
          Criar conta
        </Typography>
        <Typography variant="body" color={colors.textMuted}>
          Escolha seu perfil e preencha os dados para acessar a plataforma de
          lipedema.
        </Typography>
      </View>

      <View style={styles.form}>
        <Typography variant="label">Perfil</Typography>
        <SelectableChipGroup>
          <SelectableChip
            label="Paciente"
            selected={role === 'paciente'}
            onPress={() => setRole('paciente')}
            disabled={loading}
          />
          <SelectableChip
            label="Profissional de saúde"
            selected={role === 'profissional'}
            onPress={() => setRole('profissional')}
            disabled={loading}
          />
        </SelectableChipGroup>

        <Input
          label="Nome completo"
          leftIcon="person-outline"
          value={name}
          onChangeText={setName}
          error={errors.name}
          placeholder="Seu nome"
          autoCapitalize="words"
          textContentType="name"
        />

        <Input
          label="E-mail"
          leftIcon="mail-outline"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
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
          error={errors.password}
          placeholder="Mínimo de 6 caracteres"
          isPassword
          textContentType="newPassword"
        />

        <Input
          label="Confirmar senha"
          leftIcon="shield-checkmark-outline"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={errors.confirmPassword}
          placeholder="Repita a senha"
          isPassword
          textContentType="newPassword"
        />

        {formError ? (
          <InlineMessage message={formError} variant="error" />
        ) : null}

        <Button
          label="Criar conta"
          onPress={handleRegister}
          loading={loading}
          style={styles.submit}
        />

        <Pressable
          accessibilityRole="link"
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.loginLink}
        >
          <Typography variant="body" color={colors.primary} align="center">
            Já tenho conta — Entrar
          </Typography>
        </Pressable>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[6],
  },
  header: {
    gap: space[3],
    paddingTop: space[2],
  },
  form: {
    gap: space[4],
  },
  submit: {
    marginTop: space[2],
  },
  loginLink: {
    minHeight: 44,
    justifyContent: 'center',
  },
});
