import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  ScreenHeader,
  SectionCard,
  Typography,
} from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useLinkedPatientDetail } from '@/src/hooks/useLinkedPatientDetail';
import { colors, radius, space } from '@/src/theme';
import { formatDateLabel } from '@/src/utils/navigation';

type Props = {
  patientId: string;
};

function summarizeCheckin(item: {
  wellbeing: {
    pain: number | null;
    heaviness: number | null;
    energy: number | null;
    mood: number | null;
  };
  measurements: {
    weight: number | null;
  };
  treatments: string[];
  notes: string;
}): string {
  const parts: string[] = [];
  if (item.wellbeing.pain !== null) {
    parts.push(`Dor ${item.wellbeing.pain}`);
  }
  if (item.wellbeing.heaviness !== null) {
    parts.push(`Peso/sensação ${item.wellbeing.heaviness}`);
  }
  if (item.wellbeing.energy !== null) {
    parts.push(`Energia ${item.wellbeing.energy}`);
  }
  if (item.wellbeing.mood !== null) {
    parts.push(`Humor ${item.wellbeing.mood}`);
  }
  if (item.measurements.weight !== null) {
    parts.push(`${item.measurements.weight} kg`);
  }
  if (item.treatments.length > 0) {
    parts.push(`${item.treatments.length} tratamento(s)`);
  }
  if (item.notes.trim()) {
    parts.push('Observações');
  }
  return parts.length > 0 ? parts.join(' · ') : 'Sem detalhes preenchidos';
}

export function ProfessionalPatientDetailScreen({ patientId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    patient,
    checkins,
    loading,
    acting,
    error,
    message,
    refresh,
    endLink,
  } = useLinkedPatientDetail(user?.uid, patientId);

  const confirmEndLink = () => {
    Alert.alert(
      'Encerrar vínculo',
      'O paciente deixará de aparecer na sua lista e você não verá mais os check-ins. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Encerrar',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await endLink();
              router.back();
            })();
          },
        },
      ],
    );
  };

  return (
    <Container
      edges={['top', 'left', 'right']}
      scroll
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow="Paciente"
        title={patient?.name ?? 'Detalhe do paciente'}
        subtitle="Check-ins em somente leitura. Você não pode editar o diário."
        onBack={() => router.back()}
        backLabel="Pacientes"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}
      {message ? <InlineMessage message={message} variant="success" /> : null}

      {loading ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator color={colors.primary} />
          <Typography variant="caption" color={colors.textMuted}>
            Carregando paciente…
          </Typography>
        </View>
      ) : null}

      {!loading && patient ? (
        <>
          <SectionCard
            title="Dados básicos"
            description="Informações do perfil vinculado."
          >
            <Typography variant="bodyStrong">{patient.name}</Typography>
            <Typography variant="body" color={colors.textMuted}>
              {patient.email}
            </Typography>
            <View style={styles.roBadge}>
              <Typography variant="caption" color={colors.primary}>
                Somente leitura
              </Typography>
            </View>
          </SectionCard>

          <SectionCard
            title="Histórico de check-ins"
            description="Registros mais recentes primeiro."
          >
            {checkins.length === 0 ? (
              <Typography variant="body" color={colors.textMuted}>
                Este paciente ainda não registrou check-ins.
              </Typography>
            ) : (
              checkins.map((item) => (
                <View key={item.id} style={styles.checkinCard}>
                  <Typography variant="h3">
                    {formatDateLabel(item.date)}
                  </Typography>
                  <Typography variant="caption" color={colors.textMuted}>
                    {summarizeCheckin(item)}
                  </Typography>
                  {item.notes.trim() ? (
                    <Typography variant="body" color={colors.textMuted}>
                      {item.notes}
                    </Typography>
                  ) : null}
                </View>
              ))
            )}
          </SectionCard>

          <Button label="Atualizar" variant="outline" onPress={refresh} />
          <Button
            label="Encerrar vínculo"
            variant="outline"
            loading={acting}
            onPress={confirmEndLink}
          />
        </>
      ) : null}

      {!loading && !patient && !error ? (
        <InlineMessage
          message="Paciente não encontrado ou vínculo indisponível."
          variant="info"
        />
      ) : null}
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
  checkinCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space[4],
    gap: space[2],
  },
  roBadge: {
    alignSelf: 'flex-start',
    marginTop: space[1],
    paddingHorizontal: space[2],
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundAccent,
  },
});
