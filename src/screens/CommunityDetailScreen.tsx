import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Button,
  CommunityOptionsSheet,
  InlineMessage,
  SocialFeedPost,
  Typography,
} from '@/src/components';
import {
  communityJoinPolicyLabel,
  communityPolicyLabel,
  communityTagLabel,
} from '@/src/domain/community';
import { useCommunityDetail } from '@/src/hooks/useCommunityDetail';
import { useCommunityMute } from '@/src/hooks/useCommunityMute';
import { colors, radius, space } from '@/src/theme';
import { goBackOrReplace } from '@/src/utils/navigationBack';
import { firstParam } from '@/src/utils/routeParams';

export function CommunityDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ communityId?: string | string[] }>();
  const communityId = firstParam(params.communityId);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const { muted, toggleMute } = useCommunityMute(communityId);

  const showOptions = Boolean(isMember || isPendingJoin);
  const leaveLabel = isPendingJoin
    ? 'Cancelar solicitação'
    : 'Sair do grupo';

  const confirmLeave = () => {
    setMenuOpen(false);
    Alert.alert(
      isPendingJoin ? 'Cancelar solicitação?' : 'Sair do grupo?',
      isPendingJoin
        ? 'Seu pedido de entrada será cancelado.'
        : 'Você deixará de participar das conversas deste grupo.',
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: isPendingJoin ? 'Cancelar pedido' : 'Sair',
          style: 'destructive',
          onPress: () => {
            void leave();
          },
        },
      ],
    );
  };

  const handleToggleMute = () => {
    void toggleMute();
  };

  if (!communityId) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
        <View style={styles.padded}>
          <InlineMessage message="Comunidade inválida." variant="error" />
          <Button
            label="Voltar"
            onPress={() => goBackOrReplace('/(paciente)/comunidade' as Href)}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar para comunidades"
          hitSlop={8}
          onPress={() => goBackOrReplace('/(paciente)/comunidade' as Href)}
          style={({ pressed }) => [
            styles.topButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>

        <View style={styles.topTitle}>
          <Typography variant="label" numberOfLines={1}>
            {community?.title ?? 'Grupo'}
          </Typography>
          {muted ? (
            <Typography variant="caption" color={colors.textMuted}>
              Silenciado
            </Typography>
          ) : null}
        </View>

        {showOptions ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Opções do grupo"
            hitSlop={8}
            onPress={() => setMenuOpen(true)}
            style={({ pressed }) => [
              styles.topButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={22}
              color={colors.text}
            />
          </Pressable>
        ) : (
          <View style={styles.topButtonSpacer} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {error ? (
          <View style={styles.padded}>
            <InlineMessage message={error} variant="error" />
          </View>
        ) : null}
        {message ? (
          <View style={styles.padded}>
            <InlineMessage message={message} variant="success" />
          </View>
        ) : null}

        {loading && !community ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : null}

        {community ? (
          <>
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
                colors={['transparent', 'rgba(26, 43, 38, 0.78)']}
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

              {!isMember && !isPendingJoin ? (
                <Button
                  label={
                    community.joinPolicy === 'approval'
                      ? 'Solicitar entrada'
                      : 'Entrar no grupo'
                  }
                  loading={joining}
                  onPress={join}
                />
              ) : null}

              {isPendingJoin ? (
                <InlineMessage
                  message="Sua solicitação está aguardando o dono do grupo."
                  variant="info"
                />
              ) : null}

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

            {isOwner && pendingMembers.length > 0 ? (
              <View style={[styles.padded, styles.moderation]}>
                <Typography variant="h3">Pedidos de entrada</Typography>
                <Typography variant="caption" color={colors.textMuted}>
                  Aprove ou recuse quem pediu para participar.
                </Typography>
                {pendingMembers.map((item) => (
                  <View key={item.id} style={styles.pendingCard}>
                    <View style={styles.pendingText}>
                      <Typography variant="bodyStrong">
                        {item.userName}
                      </Typography>
                      <Typography variant="caption" color={colors.textMuted}>
                        Solicitou em{' '}
                        {(
                          item.requestedAt ?? item.joinedAt
                        ).toLocaleDateString('pt-BR')}
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
                  <Typography variant="h3">No grupo</Typography>
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
                      Esta é a casa do grupo. Quando alguém postar, a conversa
                      aparece aqui.
                    </Typography>
                  </View>
                ) : (
                  feed.map((item) => (
                    <SocialFeedPost
                      key={item.post.id}
                      item={item}
                      communityId={communityId}
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
              <View style={styles.padded}>
                <InlineMessage
                  message={
                    community.joinPolicy === 'approval'
                      ? 'Este grupo exige aprovação. Solicite entrada para ver o feed.'
                      : 'Entre no grupo para ver publicações e interagir.'
                  }
                  variant="info"
                />
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>

      <CommunityOptionsSheet
        visible={menuOpen}
        muted={muted}
        leaving={joining}
        leaveLabel={leaveLabel}
        onClose={() => setMenuOpen(false)}
        onToggleMute={handleToggleMute}
        onLeave={confirmLeave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  topButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topButtonSpacer: {
    width: 40,
    height: 40,
  },
  topTitle: {
    flex: 1,
    gap: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  scrollContent: {
    paddingBottom: space[8],
    gap: space[5],
  },
  padded: {
    paddingHorizontal: space[5],
    gap: space[3],
  },
  loader: {
    marginTop: space[8],
  },
  coverWrap: {
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: 220,
    backgroundColor: colors.backgroundAccent,
  },
  coverFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space[5],
    paddingVertical: space[4],
    gap: space[1],
  },
  groupBody: {
    gap: space[3],
    paddingHorizontal: space[5],
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
    paddingHorizontal: space[5],
    paddingTop: space[2],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space[3],
    paddingTop: space[2],
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
