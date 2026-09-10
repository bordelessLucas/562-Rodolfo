import { useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  ScreenHeader,
  SelectableChip,
  SelectableChipGroup,
  Typography,
} from '@/src/components';
import { useToast } from '@/src/contexts/ToastContext';
import {
  COMMUNITY_TAG_OPTIONS,
  type CommunityAccessPolicy,
  type CommunityJoinPolicy,
  type CommunityTagId,
  communityJoinPolicyLabel,
  communityPolicyLabel,
} from '@/src/domain/community';
import { useAuth } from '@/src/hooks/useAuth';
import { createCommunity } from '@/src/services/community.service';
import { colors, radius, space } from '@/src/theme';

const POLICIES: CommunityAccessPolicy[] = [
  'members',
  'owner',
  'professionals',
];

const JOIN_POLICIES: CommunityJoinPolicy[] = ['open', 'approval'];

export function AdminCommunityCreateScreen() {
  const router = useRouter();
  const { showToast } = useToast();
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
    useState<CommunityJoinPolicy>('open');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleTag = (tag: CommunityTagId) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

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
        coverUrl: coverUrl.trim() || null,
        tags,
        postPolicy,
        commentPolicy,
        joinPolicy,
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
        title="Nova comunidade"
        subtitle="Capa, temas, privacidade e tipo de entrada."
        compact
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
