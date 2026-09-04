import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  Button,
  Container,
  InlineMessage,
  Input,
  ScreenHeader,
  Typography,
} from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { colors, radius, space } from '@/src/theme';

export function ProfileScreen() {
  const router = useRouter();
  const {
    profile,
    profileLoading,
    profileError,
    refreshProfile,
    updateProfile,
    signOut,
  } = useAuth();

  const [name, setName] = useState(profile?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(profile?.name ?? '');
  }, [profile?.name]);

  const roleLabel =
    profile?.role === 'profissional'
      ? 'Profissional de saúde'
      : 'Paciente';

  const initials =
    profile?.name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?';

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await updateProfile(name);
      setMessage('Perfil atualizado.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível salvar.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.replace('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <Container
      scroll
      keyboardAvoiding
      edges={['top', 'left', 'right']}
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow="Conta"
        title="Perfil"
        subtitle="Atualize seu nome. E-mail e tipo de perfil ficam protegidos."
      />

      {profileError ? (
        <View style={styles.block}>
          <InlineMessage message={profileError} variant="error" />
          <Button
            label="Tentar novamente"
            variant="outline"
            onPress={() => void refreshProfile()}
          />
        </View>
      ) : null}

      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Typography variant="h2" color={colors.primary}>
            {initials}
          </Typography>
        </View>
        <Typography variant="h3">{profile?.name ?? '—'}</Typography>
        <View style={styles.roleBadge}>
          <Typography variant="caption" color={colors.primary}>
            {roleLabel}
          </Typography>
        </View>
      </View>

      <View style={styles.card}>
        <Input
          label="Nome"
          value={name}
          onChangeText={setName}
          leftIcon="person-outline"
          editable={!profileLoading}
        />
        <Input
          label="E-mail"
          value={profile?.email ?? ''}
          editable={false}
          leftIcon="mail-outline"
        />

        {error ? <InlineMessage message={error} variant="error" /> : null}
        {message ? (
          <InlineMessage message={message} variant="success" />
        ) : null}

        <Button label="Salvar alterações" loading={saving} onPress={handleSave} />
        <Button
          label="Sair da conta"
          variant="outline"
          loading={loggingOut}
          onPress={handleLogout}
        />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[5],
    paddingBottom: space[8],
  },
  block: {
    gap: space[3],
  },
  hero: {
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[4],
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.backgroundAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[1],
  },
  roleBadge: {
    backgroundColor: colors.backgroundAccent,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space[5],
    gap: space[4],
  },
});
