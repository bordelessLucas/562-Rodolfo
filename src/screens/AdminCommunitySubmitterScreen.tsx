import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  Input,
  ScreenHeader,
  Typography,
} from '@/src/components';
import {
  communityStatusLabel,
  type Community,
} from '@/src/domain/community';
import { useAuth } from '@/src/hooks/useAuth';
import { useCommunitiesByCreator } from '@/src/hooks/useCommunitiesByCreator';
import {
  approveCommunity,
  rejectCommunity,
} from '@/src/services/community.service';
import { colors, radius, space } from '@/src/theme';

function formatDate(value: Date | null): string {
  if (!value) {
    return '—';
  }
  return value.toLocaleDateString('pt-BR');
}

function statusTone(status: Community['status']): string {
  switch (status) {
    case 'published':
      return colors.success;
    case 'rejected':
      return colors.error;
    case 'pending':
      return colors.warning;
    default:
      return colors.textMuted;
  }
}

export function AdminCommunitySubmitterScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ userId?: string | string[] }>();
  const userId = useMemo(() => {
    const raw = params.userId;
    return typeof raw === 'string' ? raw : raw?.[0];
  }, [params.userId]);

  const { communities, profile, loading, error, refresh } =
    useCommunitiesByCreator(userId);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [reasonById, setReasonById] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const displayName =
    communities[0]?.createdByName ||
    profile?.name ||
    'Usuário';

  const handleApprove = async (id: string) => {
    if (!user) {
      return;
    }
    setBusyId(id);
    setActionError('');
    setActionMessage('');
    try {
      await approveCommunity(id, user.uid);
      setActionMessage('Comunidade aprovada e publicada.');
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Falha ao aprovar.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!user) {
      return;
    }
    setBusyId(id);
    setActionError('');
    setActionMessage('');
    try {
      await rejectCommunity(id, user.uid, reasonById[id] ?? '');
      setActionMessage('Comunidade recusada.');
      setReasonById((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Falha ao recusar.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Container scroll contentStyle={styles.content}>
      <ScreenHeader
        eyebrow="Segurança"
        title={displayName}
        subtitle="Todos os envios de comunidades deste usuário."
        onBack={() =>
          router.replace('/(admin)/comunidades/revisao' as Href)
        }
        backLabel="Fila"
      />

      <View style={styles.profileCard}>
        <Typography variant="label">Perfil do submetente</Typography>
        <Typography variant="bodyStrong">{displayName}</Typography>
        {profile?.email ? (
          <Typography variant="caption" color={colors.textMuted}>
            {profile.email}
          </Typography>
        ) : (
          <Typography variant="caption" color={colors.textMuted}>
            Perfil sem e-mail no Firestore (seed demo pode usar só o nome).
          </Typography>
        )}
        <Typography variant="caption" color={colors.textMuted}>
          Papel:{' '}
          {profile?.role === 'profissional'
            ? 'Profissional'
            : profile?.role === 'admin'
              ? 'Admin'
              : profile?.role === 'paciente'
                ? 'Paciente'
                : communities[0]?.createdByRole === 'profissional'
                  ? 'Profissional (denormalizado)'
                  : '—'}
        </Typography>
        <Typography variant="caption" color={colors.textMuted}>
          Envios: {communities.length}
        </Typography>
      </View>

      {error ? <InlineMessage message={error} variant="error" /> : null}
      {actionError ? (
        <InlineMessage message={actionError} variant="error" />
      ) : null}
      {actionMessage ? (
        <InlineMessage message={actionMessage} variant="success" />
      ) : null}

      {loading ? <ActivityIndicator color={colors.primary} /> : null}

      {!loading && communities.length === 0 ? (
        <InlineMessage
          message="Este usuário ainda não enviou comunidades."
          variant="info"
        />
      ) : null}

      {communities.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.cardTop}>
            <Typography variant="h3" style={styles.cardTitle}>
              {item.title}
            </Typography>
            <Typography
              variant="caption"
              color={statusTone(item.status)}
            >
              {communityStatusLabel(item.status)}
            </Typography>
          </View>

          <Typography variant="body" color={colors.textMuted}>
            {item.description}
          </Typography>

          <Typography variant="caption" color={colors.textMuted}>
            Enviado em {formatDate(item.createdAt)}
            {item.reviewedAt
              ? ` · revisado em ${formatDate(item.reviewedAt)}`
              : ''}
          </Typography>

          {item.status === 'rejected' && item.rejectionReason ? (
            <View style={styles.reasonBox}>
              <Typography variant="label">Motivo da recusa</Typography>
              <Typography variant="body" color={colors.textMuted}>
                {item.rejectionReason}
              </Typography>
            </View>
          ) : null}

          {item.status === 'published' ? (
            <Typography variant="caption" color={colors.success}>
              Aceito / publicado
              {item.publishedAt
                ? ` em ${formatDate(item.publishedAt)}`
                : ''}
            </Typography>
          ) : null}

          {item.status === 'pending' ? (
            <View style={styles.pendingActions}>
              <Input
                label="Motivo da rejeição (obrigatório se recusar)"
                value={reasonById[item.id] ?? ''}
                onChangeText={(text) =>
                  setReasonById((prev) => ({ ...prev, [item.id]: text }))
                }
                placeholder="Ex.: tema inadequado…"
              />
              <Button
                label="Aprovar"
                loading={busyId === item.id}
                onPress={() => handleApprove(item.id)}
              />
              <Button
                label="Recusar"
                variant="outline"
                loading={busyId === item.id}
                onPress={() => handleReject(item.id)}
              />
            </View>
          ) : null}
        </View>
      ))}

      <Button label="Atualizar" variant="outline" onPress={refresh} />
    </Container>
  );
}

const styles = StyleSheet.create({
  content: { gap: space[4], paddingBottom: space[8] },
  profileCard: {
    gap: space[1],
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space[3],
  },
  cardTitle: {
    flex: 1,
  },
  reasonBox: {
    gap: space[1],
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.backgroundAccent,
  },
  pendingActions: {
    gap: space[2],
    marginTop: space[1],
  },
});
