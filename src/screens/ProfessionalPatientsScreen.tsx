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
  SectionCard,
  Typography,
} from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useProfessionalPatients } from '@/src/hooks/useProfessionalPatients';
import { colors, radius, space } from '@/src/theme';

export function ProfessionalPatientsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const {
    patients,
    pendingInvites,
    loading,
    acting,
    error,
    message,
    refresh,
    invite,
    cancelInvite,
  } = useProfessionalPatients(user?.uid);

  const handleInvite = async () => {
    await invite(inviteEmail);
    setInviteEmail('');
  };

  return (
    <Container
      edges={['top', 'left', 'right']}
      scroll
      keyboardAvoiding
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow="Acompanhamento"
        title="Meus pacientes"
        subtitle="Convide pelo e-mail cadastrado. Só há leitura de check-ins após o aceite."
        onBack={() => router.back()}
        backLabel="Início"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}
      {message ? <InlineMessage message={message} variant="success" /> : null}

      <SectionCard
        title="Convidar paciente"
        description="O paciente precisa ter conta com o mesmo e-mail para aceitar o convite."
      >
        <Input
          label="E-mail do paciente"
          value={inviteEmail}
          onChangeText={setInviteEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon="mail-outline"
          editable={!acting}
        />
        <Button
          label="Enviar convite"
          loading={acting}
          onPress={() => void handleInvite()}
        />
      </SectionCard>

      {loading && patients.length === 0 && pendingInvites.length === 0 ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator color={colors.primary} />
          <Typography variant="caption" color={colors.textMuted}>
            Carregando vínculos…
          </Typography>
        </View>
      ) : null}

      <SectionCard
        title="Convites pendentes"
        description="Aguardando o paciente aceitar no aplicativo."
      >
        {pendingInvites.length === 0 ? (
          <Typography variant="body" color={colors.textMuted}>
            Nenhum convite pendente.
          </Typography>
        ) : (
          pendingInvites.map((link) => (
            <View key={link.id} style={styles.rowCard}>
              <Typography variant="h3">{link.patientEmail}</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Status: pendente
              </Typography>
              <Button
                label="Cancelar convite"
                variant="outline"
                loading={acting}
                onPress={() => void cancelInvite(link.id)}
              />
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard
        title="Pacientes vinculados"
        description="Toque para ver o histórico de check-ins (somente leitura)."
      >
        {patients.length === 0 ? (
          <Typography variant="body" color={colors.textMuted}>
            Ainda não há pacientes com vínculo ativo.
          </Typography>
        ) : (
          patients.map((item) => (
            <Pressable
              key={item.link.id}
              accessibilityRole="button"
              accessibilityLabel={`Abrir paciente ${item.patient.name}`}
              onPress={() =>
                router.push(
                  `/(profissional)/pacientes/${item.patient.uid}` as Href,
                )
              }
              style={({ pressed }) => [
                styles.rowCard,
                pressed ? styles.rowPressed : null,
              ]}
            >
              <Typography variant="h3">{item.patient.name}</Typography>
              <Typography variant="body" color={colors.textMuted}>
                {item.patient.email}
              </Typography>
              <Typography variant="caption" color={colors.primary}>
                Ver check-ins
              </Typography>
            </Pressable>
          ))
        )}
      </SectionCard>

      <Button label="Atualizar lista" variant="outline" onPress={refresh} />
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
  rowPressed: {
    opacity: 0.85,
  },
});
