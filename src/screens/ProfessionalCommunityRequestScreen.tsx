import { type Href } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  Input,
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
  CommunityStatus,
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

function statusTone(status: CommunityStatus): string {
  switch (status) {
    case 'published':
      return colors.success;
    case 'pending':
      return colors.warning;
    case 'rejected':
      return colors.error;
    case 'draft':
    default:
      return colors.primary;
  }
}

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
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    if (!user) {
      setMine([]);
      setLoadingList(false);
      return;
    }
    setLoadingList(true);
    try {
      setMine(await listMyCommunities(user.uid));
    } catch {
      // lista auxiliar — não bloqueia o pedido
    } finally {
      setLoadingList(false);
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
    if (coverUrl.trim()) {
      try {
        const parsed = new URL(coverUrl.trim());
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          setError('A URL da capa precisa começar com https://');
          return;
        }
      } catch {
        setError('URL da capa inválida.');
        return;
      }
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
      setMessage('Pedido enviado. Aguarde aprovação do administrador.');
      setTitle('');
      setDescription('');
      setCoverUrl('');
      setTags([]);
      setJoinPolicy('approval');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao enviar pedido.');
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = mine.filter((item) => item.status === 'pending').length;
  const publishedCount = mine.filter(
    (item) => item.status === 'published',
  ).length;

  return (
    <Container
      edges={['top', 'left', 'right']}
      scroll
      keyboardAvoiding
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow="Comunidades"
        title="Solicitar comunidade"
        subtitle="Defina temas, privacidade e se a entrada será livre ou com aprovação."
        onBack={() => goBackOrReplace('/(profissional)' as Href)}
        backLabel="Início"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}
      {message ? <InlineMessage message={message} variant="success" /> : null}

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Typography variant="h3" color={colors.warning}>
            {pendingCount}
          </Typography>
          <Typography variant="caption" color={colors.textMuted}>
            Aguardando
          </Typography>
        </View>
        <View style={styles.summaryItem}>
          <Typography variant="h3" color={colors.success}>
            {publishedCount}
          </Typography>
          <Typography variant="caption" color={colors.textMuted}>
            Publicadas
          </Typography>
        </View>
      </View>

      <SectionCard title="Novo pedido">
        <Input
          label="Título"
          value={title}
          onChangeText={setTitle}
          placeholder="Nome sugerido do grupo"
          editable={!saving}
        />
        <Input
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          placeholder="Objetivo do grupo"
          multiline
          editable={!saving}
        />
        <Input
          label="URL da capa (opcional)"
          value={coverUrl}
          onChangeText={setCoverUrl}
          placeholder="https://…"
          autoCapitalize="none"
          keyboardType="url"
          editable={!saving}
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
          onPress={() => void handleRequest()}
        />
      </SectionCard>

      <SectionCard
        title="Minhas solicitações"
        description="Acompanhe o status até a publicação pelo admin."
      >
        {loadingList ? (
          <Typography variant="caption" color={colors.textMuted}>
            Carregando…
          </Typography>
        ) : null}
        {!loadingList && mine.length === 0 ? (
          <Typography variant="body" color={colors.textMuted}>
            Nenhuma solicitação ainda. Envie o primeiro pedido acima.
          </Typography>
        ) : null}
        {mine.map((item) => {
          const tone = statusTone(item.status);
          return (
            <View key={item.id} style={styles.item}>
              <View style={[styles.badge, { backgroundColor: `${tone}22` }]}>
                <Typography variant="caption" color={tone}>
                  {communityStatusLabel(item.status)}
                </Typography>
              </View>
              <Typography variant="h3">{item.title}</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Entrada: {communityJoinPolicyLabel(item.joinPolicy)}
              </Typography>
              {item.rejectionReason ? (
                <Typography variant="caption" color={colors.error}>
                  {item.rejectionReason}
                </Typography>
              ) : null}
            </View>
          );
        })}
      </SectionCard>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: { gap: space[4], paddingBottom: space[8] },
  summaryRow: {
    flexDirection: 'row',
    gap: space[3],
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: space[1],
    paddingVertical: space[3],
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  item: {
    gap: space[1],
    padding: space[3],
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: space[2],
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
});
