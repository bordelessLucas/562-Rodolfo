import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  ScreenHeader,
  SocialFeedPost,
  Typography,
} from '@/src/components';
import {
  communityJoinPolicyLabel,
  communityPolicyLabel,
  communityTagLabel,
} from '@/src/domain/community';
import { useCommunityDetail } from '@/src/hooks/useCommunityDetail';
import { colors, radius, space } from '@/src/theme';
import { goBackOrReplace } from '@/src/utils/navigationBack';
import { firstParam } from '@/src/utils/routeParams';

export function CommunityDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ communityId?: string | string[] }>();
  const communityId = firstParam(params.communityId);
  const {
    community,
    isMember,
    isPendingJoin,
    isOwner,
    pendingMembers,
    feed,
    canPost,
    loading,
    joining,
    moderatingId,
    likeBusyId,
    error,
    message,
    join,
    leave,
    approve,
    reject,
    toggleLike,
  } = useCommunityDetail(communityId);

  if (!communityId) {
    return (
      <Container contentStyle={styles.content}>
        <InlineMessage message="Comunidade inválida." variant="error" />
        <Button
          label="Voltar"
          onPress={() => goBackOrReplace('/(paciente)/comunidade' as Href)}
        />
      </Container>
    );
  }

  return (
    <Container
      scroll
      edges={['top', 'left', 'right']}
      contentStyle={styles.content}
    >
      <ScreenHeader
        title="Grupo"
        compact
        onBack={() => goBackOrReplace('/(paciente)/comunidade' as Href)}
        backLabel="Comunidades"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}
      {message ? <InlineMessage message={message} variant="success" /> : null}

      {loading && !community ? (
        <ActivityIndicator color={colors.primary} />
      ) : null}

      {community ? (
        <>
          <View style={styles.groupBlock}>
            <View style={styles.coverWrap}>
              {community.coverUrl ? (
                <Image
                  source={{ uri: community.coverUrl }}
                  style={styles.cover}
                  contentFit="cover"
                  transition={280}
                />
              ) : (
                <LinearGradient
                  colors={[colors.secondary, colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cover}
                />
              )}
              <LinearGradient
                colors={['transparent', 'rgba(26, 43, 38, 0.72)']}
                style={styles.coverFade}
              >
                <Typography variant="h2" color={colors.textOnPrimary}>
                  {community.title}
                </Typography>
                <Typography variant="caption" color={colors.textOnPrimary}>
                  {community.memberCount} membros ·{' '}
                  {communityJoinPolicyLabel(community.joinPolicy)}
                </Typography>
              </LinearGradient>
            </View>

            <View style={styles.groupBody}>
              <Typography variant="body">{community.description}</Typography>

              <View style={styles.creatorRow}>
                <View style={styles.creatorAvatar}>
                  <Typography variant="caption" color={colors.primary}>
                    {(community.createdByName || '?').slice(0, 1).toUpperCase()}
                  </Typography>
                </View>
                <View style={styles.creatorText}>
                  <Typography variant="bodyStrong">
                    {community.createdByName}
                  </Typography>
                  <Typography variant="caption" color={colors.textMuted}>
                    Dono do grupo ·{' '}
                    {community.createdByRole === 'profissional'
                      ? 'Profissional'
                      : 'Admin'}
                  </Typography>
                </View>
              </View>

              {community.tags.length > 0 ? (
                <View style={styles.tags}>
                  {community.tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Typography variant="caption" color={colors.primary}>
                        {communityTagLabel(tag)}
                      </Typography>
                    </View>
                  ))}
                </View>
              ) : null}

              <Typography variant="caption" color={colors.textMuted}>
                Publicar: {communityPolicyLabel(community.postPolicy)} ·
                Comentar: {communityPolicyLabel(community.commentPolicy)}
              </Typography>

              <View style={styles.groupActions}>
                {isMember ? (
                  <Button
                    label="Sair do grupo"
                    variant="outline"
                    loading={joining}
                    onPress={leave}
                  />
                ) : isPendingJoin ? (
                  <>
                    <InlineMessage
                      message="Sua solicitação está aguardando o dono do grupo."
                      variant="info"
                    />
                    <Button
                      label="Cancelar solicitação"
                      variant="outline"
                      loading={joining}
                      onPress={leave}
                    />
                  </>
                ) : (
                  <Button
                    label={
                      community.joinPolicy === 'approval'
                        ? 'Solicitar entrada'
                        : 'Entrar no grupo'
                    }
                    loading={joining}
                    onPress={join}
                  />
                )}

                {canPost ? (
                  <Button
                    label="Nova publicação"
                    onPress={() =>
                      router.push(
                        `/(paciente)/comunidade/${communityId}/nova-publicacao` as Href,
                      )
                    }
                  />
                ) : null}
              </View>
            </View>
          </View>

          {isOwner && pendingMembers.length > 0 ? (
            <View style={styles.moderation}>
              <Typography variant="h3">Pedidos de entrada</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Aprove ou recuse quem pediu para participar.
              </Typography>
              {pendingMembers.map((item) => (
                <View key={item.id} style={styles.pendingCard}>
                  <View style={styles.pendingText}>
                    <Typography variant="bodyStrong">{item.userName}</Typography>
                    <Typography variant="caption" color={colors.textMuted}>
                      Solicitou em{' '}
                      {(item.requestedAt ?? item.joinedAt).toLocaleDateString(
                        'pt-BR',
                      )}
                    </Typography>
                  </View>
                  <View style={styles.pendingActions}>
                    <Button
                      label="Aprovar"
                      loading={moderatingId === item.userId}
                      onPress={() => void approve(item.userId)}
                    />
                    <Button
                      label="Recusar"
                      variant="outline"
                      loading={moderatingId === item.userId}
                      onPress={() => void reject(item.userId)}
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {isMember || isOwner || feed.length > 0 ? (
            <View style={styles.feed}>
              <View style={styles.feedHeader}>
                <Typography variant="h3">Conversas do grupo</Typography>
                <Typography variant="caption" color={colors.textMuted}>
                  {feed.length} publicação(ões)
                </Typography>
              </View>
              {feed.length === 0 ? (
                <View style={styles.emptyFeed}>
                  <Typography variant="bodyStrong">
                    Ainda sem publicações
                  </Typography>
                  <Typography variant="body" color={colors.textMuted}>
                    Quando alguém postar, curtidas e comentários aparecem aqui.
                  </Typography>
                </View>
              ) : (
                feed.map((item) => (
                  <SocialFeedPost
                    key={item.post.id}
                    item={item}
                    likeBusy={likeBusyId === item.post.id}
                    onToggleLike={() => void toggleLike(item.post.id)}
                    onOpen={() =>
                      router.push(
                        `/(paciente)/comunidade/${communityId}/posts/${item.post.id}` as Href,
                      )
                    }
                  />
                ))
              )}
            </View>
          ) : !isPendingJoin ? (
            <InlineMessage
              message={
                community.joinPolicy === 'approval'
                  ? 'Este grupo exige aprovação. Solicite entrada para ver o feed.'
                  : 'Entre no grupo para ver publicações e interagir.'
              }
              variant="info"
            />
          ) : null}
        </>
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[5],
    paddingBottom: space[8],
  },
  groupBlock: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  coverWrap: {
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: 200,
    backgroundColor: colors.backgroundAccent,
  },
  coverFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space[4],
    paddingVertical: space[4],
    gap: space[1],
  },
  groupBody: {
    gap: space[3],
    padding: space[4],
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAccent,
  },
  creatorText: {
    flex: 1,
    gap: 2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
  tag: {
    paddingHorizontal: space[2],
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundAccent,
  },
  groupActions: {
    gap: space[2],
    marginTop: space[1],
  },
  moderation: {
    gap: space[3],
  },
  pendingCard: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundAccent,
  },
  pendingText: {
    gap: 2,
  },
  pendingActions: {
    gap: space[2],
  },
  feed: {
    gap: space[3],
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space[3],
  },
  emptyFeed: {
    gap: space[2],
    padding: space[5],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
  },
});
