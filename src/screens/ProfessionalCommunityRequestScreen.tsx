import { useRouter, type Href } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  ScreenHeader,
  SectionCard,
  Typography,
} from '@/src/components';
import type { Community } from '@/src/domain/community';
import { communityStatusLabel } from '@/src/domain/community';
import { useAuth } from '@/src/hooks/useAuth';
import {
  createCommunity,
  listMyCommunities,
} from '@/src/services/community.service';
import { colors, radius, space } from '@/src/theme';

export function ProfessionalCommunityRequestScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mine, setMine] = useState<Community[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    if (!user) {
      return;
    }
    try {
      setMine(await listMyCommunities(user.uid));
    } catch {
      // lista auxiliar; erro principal fica no submit
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleRequest = async () => {
    if (!user || !profile) {
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError('Informe título e descrição.');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await createCommunity({
        title,
        description,
        createdBy: user.uid,
        createdByRole: 'profissional',
        createdByName: profile.name,
        publishNow: false,
      });
      setMessage('Pedido enviado. Aguarde aprovação do admin.');
      setTitle('');
      setDescription('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao enviar pedido.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container scroll contentStyle={styles.content}>
      <ScreenHeader
        eyebrow="Profissional"
        title="Comunidades"
        subtitle="Você pode solicitar uma comunidade; um admin precisa aprovar."
        onBack={() => router.replace('/(profissional)' as Href)}
        backLabel="Início"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}
      {message ? <InlineMessage message={message} variant="success" /> : null}

      <SectionCard title="Solicitar nova comunidade">
        <Typography variant="label">Título</Typography>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Nome sugerido"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <Typography variant="label">Descrição</Typography>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Objetivo do grupo"
          placeholderTextColor={colors.textMuted}
          multiline
          style={[styles.input, styles.area]}
        />
        <Button
          label="Enviar para aprovação"
          loading={saving}
          onPress={handleRequest}
        />
      </SectionCard>

      <SectionCard title="Minhas solicitações">
        {mine.length === 0 ? (
          <Typography variant="body" color={colors.textMuted}>
            Nenhuma solicitação ainda.
          </Typography>
        ) : (
          mine.map((item) => (
            <View key={item.id} style={styles.item}>
              <Typography variant="h3">{item.title}</Typography>
              <Typography variant="caption" color={colors.primary}>
                {communityStatusLabel(item.status)}
              </Typography>
              {item.rejectionReason ? (
                <Typography variant="caption" color={colors.textMuted}>
                  {item.rejectionReason}
                </Typography>
              ) : null}
            </View>
          ))
        )}
      </SectionCard>
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
    backgroundColor: colors.background,
    fontFamily: 'SourceSans3_400Regular',
  },
  area: {
    minHeight: 100,
    padding: space[3],
    textAlignVertical: 'top',
  },
  item: {
    gap: space[1],
    paddingVertical: space[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
