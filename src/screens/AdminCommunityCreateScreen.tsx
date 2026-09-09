import { useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  ScreenHeader,
  Typography,
} from '@/src/components';
import { useToast } from '@/src/contexts/ToastContext';
import { useAuth } from '@/src/hooks/useAuth';
import { createCommunity } from '@/src/services/community.service';
import { colors, radius, space } from '@/src/theme';

export function AdminCommunityCreateScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!user || !profile) {
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError('Informe título e descrição.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createCommunity({
        title,
        description,
        createdBy: user.uid,
        createdByRole: 'admin',
        createdByName: profile.name,
        publishNow: true,
      });
      showToast({
        message: `Comunidade publicada: ${title.trim()}`,
        variant: 'success',
      });
      router.replace('/(admin)' as Href);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Falha ao criar.';
      setError(message);
      showToast({ message, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container scroll contentStyle={styles.content}>
      <ScreenHeader
        eyebrow="Admin"
        title="Nova comunidade"
        subtitle="Publicação imediata (sem fila)."
        onBack={() => router.replace('/(admin)' as Href)}
        backLabel="Início admin"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}

      <Typography variant="label">Título</Typography>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Nome da comunidade"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <Typography variant="label">Descrição</Typography>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Sobre o que é este grupo"
        placeholderTextColor={colors.textMuted}
        multiline
        style={[styles.input, styles.area]}
      />

      <Button
        label="Publicar comunidade"
        loading={saving}
        onPress={() => void handleCreate()}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  content: { gap: space[4], paddingBottom: space[8] },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space[3],
    color: colors.text,
    backgroundColor: colors.surface,
    fontFamily: 'SourceSans3_400Regular',
  },
  area: {
    minHeight: 120,
    padding: space[3],
    textAlignVertical: 'top',
  },
});
