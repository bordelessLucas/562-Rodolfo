import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  ScreenHeader,
  SectionCard,
  Typography,
} from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { usePatientLinks } from '@/src/hooks/usePatientLinks';
import { colors, radius, space } from '@/src/theme';

export function PatientLinksScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const {
    pendingInvites,
    activeLinks,
    loading,
    actingLinkId,
    error,
    message,
    refresh,
    accept,
    reject,
    revoke,
  } = usePatientLinks(user?.uid, profile?.email);

  return (
    <Container
      edges={['top', 'left', 'right']}
      scroll
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow="Acompanhamento"
        title="Profissionais vinculados"
        subtitle="Aceite convites com segurança. Você pode encerrar o vínculo a qualquer momento."
        onBack={() => router.back()}
        backLabel="Perfil"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}
      {message ? <InlineMessage message={message} variant="success" /> : null}

      {loading && pendingInvites.length === 0 && activeLinks.length === 0 ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator color={colors.primary} />
          <Typography variant="caption" color={colors.textMuted}>
            Carregando convites…
          </Typography>
        </View>
      ) : null}

      <SectionCard
        title="Convites pendentes"
        description="Ao aceitar, o profissional poderá ler seus check-ins. Ele não poderá editá-los."
      >
        {pendingInvites.length === 0 ? (
          <Typography variant="body" color={colors.textMuted}>
            Nenhum convite pendente no momento.
          </Typography>
        ) : (
          pendingInvites.map((item) => (
            <View key={item.link.id} style={styles.rowCard}>
              <Typography variant="h3">{item.professionalName}</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Convite para {item.link.patientEmail}
              </Typography>
              <Button
                label="Aceitar"
                loading={actingLinkId === item.link.id}
                onPress={() => void accept(item.link.id)}
              />
              <Button
                label="Recusar"
                variant="outline"
                loading={actingLinkId === item.link.id}
                onPress={() => void reject(item.link.id)}
              />
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard
        title="Vínculos ativos"
        description="Profissionais que já podem acompanhar seu diário em modo leitura."
      >
        {activeLinks.length === 0 ? (
          <Typography variant="body" color={colors.textMuted}>
            Você ainda não possui vínculos ativos.
          </Typography>
        ) : (
          activeLinks.map((item) => (
            <View key={item.link.id} style={styles.rowCard}>
              <Typography variant="h3">{item.professionalName}</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Status: ativo
              </Typography>
              <Button
                label="Encerrar vínculo"
                variant="outline"
                loading={actingLinkId === item.link.id}
                onPress={() => void revoke(item.link.id)}
              />
            </View>
          ))
        )}
      </SectionCard>

      <Button label="Atualizar" variant="outline" onPress={refresh} />
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[5],
    paddingBottom: space[8],
  },
  centerBlock: {
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[6],
  },
  rowCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space[4],
    gap: space[2],
  },
});
