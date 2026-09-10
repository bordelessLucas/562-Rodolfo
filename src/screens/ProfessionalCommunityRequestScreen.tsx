import { type Href } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  ScreenHeader,
  SectionCard,
  SelectableChip,
  SelectableChipGroup,
  Typography,
} from '@/src/components';
import type {
  Community,
  CommunityAccessPolicy,
  CommunityJoinPolicy,
  CommunityTagId,
} from '@/src/domain/community';
import {
  COMMUNITY_TAG_OPTIONS,
  communityJoinPolicyLabel,
  communityPolicyLabel,
  communityStatusLabel,
} from '@/src/domain/community';
import { useAuth } from '@/src/hooks/useAuth';
import {
  createCommunity,
  listMyCommunities,
} from '@/src/services/community.service';
import { colors, radius, space } from '@/src/theme';
import { goBackOrReplace } from '@/src/utils/navigationBack';

const POLICIES: CommunityAccessPolicy[] = [
  'members',
  'owner',
  'professionals',
];

const JOIN_POLICIES: CommunityJoinPolicy[] = ['open', 'approval'];

export function ProfessionalCommunityRequestScreen() {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [tags, setTags] = useState<CommunityTagId[]>([]);
  const [postPolicy, setPostPolicy] =
    useState<CommunityAccessPolicy>('members');
  const [commentPolicy, setCommentPolicy] =
    useState<CommunityAccessPolicy>('members');
  const [joinPolicy, setJoinPolicy] =
    useState<CommunityJoinPolicy>('approval');
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
      // lista auxiliar
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggleTag = (tag: CommunityTagId) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

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
        coverUrl: coverUrl.trim() || null,
        tags,
        postPolicy,
        commentPolicy,
        joinPolicy,
      });
      setMessage('Pedido enviado. Aguarde aprovação do admin.');
      setTitle('');
      setDescription('');
      setCoverUrl('');
      setTags([]);
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
        title="Solicitar comunidade"
        subtitle="Defina temas, privacidade e se a entrada será livre ou aprovada."
        compact
        onBack={() => goBackOrReplace('/(profissional)' as Href)}
        backLabel="Início"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}
      {message ? <InlineMessage message={message} variant="success" /> : null}

      <SectionCard title="Novo pedido">
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
        <Typography variant="label">URL da capa (opcional)</Typography>
        <TextInput
          value={coverUrl}
          onChangeText={setCoverUrl}
          placeholder="https://…"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoCapitalize="none"
        />
        <Typography variant="label">Temas</Typography>
        <SelectableChipGroup>
          {COMMUNITY_TAG_OPTIONS.map((item) => (
            <SelectableChip
              key={item.id}
              label={item.label}
              selected={tags.includes(item.id)}
              onPress={() => toggleTag(item.id)}
            />
          ))}
        </SelectableChipGroup>
        <Typography variant="label">Entrada no grupo</Typography>
        <SelectableChipGroup>
          {JOIN_POLICIES.map((policy) => (
            <SelectableChip
              key={`join-${policy}`}
              label={communityJoinPolicyLabel(policy)}
              selected={joinPolicy === policy}
              onPress={() => setJoinPolicy(policy)}
            />
          ))}
        </SelectableChipGroup>
        <Typography variant="label">Quem pode publicar</Typography>
        <SelectableChipGroup>
          {POLICIES.map((policy) => (
            <SelectableChip
              key={`post-${policy}`}
              label={communityPolicyLabel(policy)}
              selected={postPolicy === policy}
              onPress={() => setPostPolicy(policy)}
            />
          ))}
        </SelectableChipGroup>
        <Typography variant="label">Quem pode comentar</Typography>
        <SelectableChipGroup>
          {POLICIES.map((policy) => (
            <SelectableChip
              key={`comment-${policy}`}
              label={communityPolicyLabel(policy)}
              selected={commentPolicy === policy}
              onPress={() => setCommentPolicy(policy)}
            />
          ))}
        </SelectableChipGroup>
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
                {communityStatusLabel(item.status)} ·{' '}
                {communityJoinPolicyLabel(item.joinPolicy)}
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
