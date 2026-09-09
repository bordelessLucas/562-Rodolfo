import { useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
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
import { useAuth } from '@/src/hooks/useAuth';
import { usePendingCommunities } from '@/src/hooks/usePendingCommunities';
import {
  approveCommunity,
  rejectCommunity,
} from '@/src/services/community.service';
import { colors, radius, space } from '@/src/theme';

export function AdminCommunityReviewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { communities, loading, error, refresh } = usePendingCommunities();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reasonById, setReasonById] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

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

  const openSubmitter = (createdBy: string) => {
    router.push(`/(admin)/comunidades/usuario/${createdBy}` as Href);
  };

  return (
    <Container scroll contentStyle={styles.content}>
      <ScreenHeader
        eyebrow="Admin"
        title="Fila de comunidades"
        subtitle="Valide quem submeteu e o histórico de envios antes de publicar."
        onBack={() => router.replace('/(admin)' as Href)}
        backLabel="Início admin"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}
      {actionError ? (
        <InlineMessage message={actionError} variant="error" />
      ) : null}
      {actionMessage ? (
        <InlineMessage message={actionMessage} variant="success" />
      ) : null}

      {loading ? <ActivityIndicator color={colors.primary} /> : null}

      {!loading && communities.length === 0 ? (
        <InlineMessage message="Nenhuma comunidade pendente." variant="info" />
      ) : null}

      {communities.map((item) => (
        <View key={item.id} style={styles.card}>
          <Typography variant="h3">{item.title}</Typography>
          <Typography variant="body" color={colors.textMuted}>
            {item.description}
          </Typography>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ver envios de ${item.createdByName || 'usuário'}`}
            onPress={() => openSubmitter(item.createdBy)}
            style={({ pressed }) => [
              styles.submitter,
              pressed ? styles.submitterPressed : null,
            ]}
          >
            <View style={styles.submitterText}>
              <Typography variant="label">Submetido por</Typography>
              <Typography variant="bodyStrong" color={colors.primary}>
                {item.createdByName || 'Usuário'}
              </Typography>
              <Typography variant="caption" color={colors.textMuted}>
                {item.createdByRole === 'profissional'
                  ? 'Profissional'
                  : 'Admin'}{' '}
                · toque para ver todos os envios
              </Typography>
            </View>
            <Typography variant="caption" color={colors.primary}>
              Histórico
            </Typography>
          </Pressable>

          <Input
            label="Motivo da rejeição (obrigatório se recusar)"
            value={reasonById[item.id] ?? ''}
            onChangeText={(text) =>
              setReasonById((prev) => ({ ...prev, [item.id]: text }))
            }
            placeholder="Ex.: tema inadequado, risco à segurança…"
          />

          <View style={styles.actions}>
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
        </View>
      ))}

      <Button label="Atualizar" variant="outline" onPress={refresh} />
    </Container>
  );
}

const styles = StyleSheet.create({
  content: { gap: space[4], paddingBottom: space[8] },
  card: {
    gap: space[3],
    padding: space[4],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.backgroundAccent,
  },
  submitterPressed: {
    opacity: 0.9,
  },
  submitterText: {
    flex: 1,
    gap: 2,
  },
  actions: { gap: space[2] },
});
