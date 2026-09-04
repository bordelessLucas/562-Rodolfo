import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect, type Href } from 'expo-router';
import React, { useCallback, useState } from 'react';
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
  ScreenHeader,
  Typography,
} from '@/src/components';
import type { DailyCheckin } from '@/src/domain/checkin';
import { useAuth } from '@/src/hooks/useAuth';
import { listCheckinsByUser } from '@/src/services/checkin.service';
import { colors, radius, space } from '@/src/theme';
import { formatDateLabel } from '@/src/utils/navigation';

export function HistoryScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<DailyCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const list = await listCheckinsByUser(user.uid);
      setItems(list);
    } catch {
      setError('Não foi possível carregar o histórico.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <Container
      scroll
      edges={['top', 'left', 'right']}
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow="Acompanhamento"
        title="Histórico"
        subtitle="Seus check-ins, do mais recente ao mais antigo."
      />

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : null}

      {error ? <InlineMessage message={error} variant="error" /> : null}

      {!loading && items.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="calendar-outline" size={28} color={colors.secondary} />
          </View>
          <Typography variant="h3" align="center">
            Nenhum check-in ainda
          </Typography>
          <Typography
            variant="body"
            color={colors.textMuted}
            align="center"
          >
            Comece registrando o dia de hoje. Você pode preencher só o que quiser.
          </Typography>
          <Button
            label="Ir para o check-in"
            onPress={() => router.push('/(paciente)/checkin' as Href)}
          />
        </View>
      ) : null}

      {items.map((item) => {
        const chips: string[] = [];
        if (item.wellbeing.pain !== null) {
          chips.push(`Dor ${item.wellbeing.pain}`);
        }
        if (item.wellbeing.energy !== null) {
          chips.push(`Energia ${item.wellbeing.energy}`);
        }
        if (item.treatments.length > 0) {
          chips.push(`${item.treatments.length} tratamento(s)`);
        }
        if (item.notes) {
          chips.push('Observações');
        }

        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`Abrir check-in de ${formatDateLabel(item.date)}`}
            onPress={() => router.push('/(paciente)/checkin' as Href)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.cardTop}>
              <View style={styles.cardText}>
                <Typography variant="h3">
                  {formatDateLabel(item.date)}
                </Typography>
                <Typography variant="caption" color={colors.success}>
                  Check-in concluído
                </Typography>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textMuted}
              />
            </View>
            {chips.length > 0 ? (
              <View style={styles.chipRow}>
                {chips.slice(0, 3).map((chip) => (
                  <View key={chip} style={styles.metaChip}>
                    <Typography variant="caption" color={colors.primary}>
                      {chip}
                    </Typography>
                  </View>
                ))}
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[4],
    paddingBottom: space[8],
  },
  loading: {
    paddingVertical: space[8],
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[6],
    paddingHorizontal: space[4],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[1],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space[5],
    gap: space[3],
  },
  cardPressed: {
    backgroundColor: colors.backgroundAccent,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  cardText: {
    flex: 1,
    gap: space[1],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
  metaChip: {
    backgroundColor: colors.backgroundAccent,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.sm,
  },
});
