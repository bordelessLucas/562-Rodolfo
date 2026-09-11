import { Ionicons } from '@expo/vector-icons';
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { CheckinFormModal } from '@/src/components/CheckinFormModal';
import {
  type BodyMeasurements,
  type DailyCheckin,
  type WellbeingScores,
  createEmptyMeasurements,
  createEmptyWellbeing,
} from '@/src/domain/checkin';
import { useAuth } from '@/src/hooks/useAuth';
import {
  getCheckinByDate,
  listCheckinsByUser,
  upsertCheckin,
} from '@/src/services/checkin.service';
import { colors, radius, space } from '@/src/theme';
import {
  addDays,
  formatDateLabel,
  toDateKey,
} from '@/src/utils/navigation';

type PeriodFilter = '7' | '30' | '90' | 'all';
type PainFilter = 'all' | 'with' | 'high';
type FormMode = 'create' | 'edit' | 'view';

const PERIOD_OPTIONS: { id: PeriodFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: '7', label: '7 dias' },
  { id: '30', label: '30 dias' },
  { id: '90', label: '90 dias' },
];

const PAIN_OPTIONS: { id: PainFilter; label: string }[] = [
  { id: 'all', label: 'Qualquer dor' },
  { id: 'with', label: 'Com dor' },
  { id: 'high', label: 'Dor 6+' },
];

function summaryChips(item: DailyCheckin): string[] {
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
  return chips;
}

function periodLabel(period: PeriodFilter): string {
  return PERIOD_OPTIONS.find((item) => item.id === period)?.label ?? 'Todos';
}

function painLabel(pain: PainFilter): string {
  return PAIN_OPTIONS.find((item) => item.id === pain)?.label ?? 'Qualquer dor';
}

function readParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function confirmEnterEditMode(onConfirm: () => void): void {
  Alert.alert(
    'Modo de edição',
    'Você deseja entrar no modo de edição?',
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: onConfirm },
    ],
  );
}

export function CheckinScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ open?: string | string[] }>();
  const openParam = readParam(params.open);
  const todayKey = toDateKey(new Date());
  const autoOpenHandledRef = useRef(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [dateKey, setDateKey] = useState(todayKey);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [history, setHistory] = useState<DailyCheckin[]>([]);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [painFilter, setPainFilter] = useState<PainFilter>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [treatments, setTreatments] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [supplements, setSupplements] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [wellbeing, setWellbeing] = useState<WellbeingScores>(
    createEmptyWellbeing(),
  );
  const [measurements, setMeasurements] = useState<BodyMeasurements>(
    createEmptyMeasurements(),
  );
  const [notes, setNotes] = useState('');

  const applyCheckinToForm = useCallback((existing: DailyCheckin | null) => {
    if (existing) {
      setTreatments(existing.treatments);
      setActivities(existing.activities);
      setLifestyle(existing.lifestyle);
      setSupplements(existing.supplements);
      setMedications(existing.medications);
      setWellbeing(existing.wellbeing);
      setMeasurements(existing.measurements);
      setNotes(existing.notes);
      return;
    }
    setTreatments([]);
    setActivities([]);
    setLifestyle([]);
    setSupplements([]);
    setMedications([]);
    setWellbeing(createEmptyWellbeing());
    setMeasurements(createEmptyMeasurements());
    setNotes('');
  }, []);

  const loadHistory = useCallback(async () => {
    if (!user) {
      return;
    }
    setHistoryLoading(true);
    try {
      setHistory(await listCheckinsByUser(user.uid));
    } catch {
      setError('Não foi possível carregar o histórico.');
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void loadHistory();
      return () => {
        autoOpenHandledRef.current = false;
      };
    }, [loadHistory]),
  );

  const todayCheckin = useMemo(
    () => history.find((item) => item.date === todayKey) ?? null,
    [history, todayKey],
  );

  const filteredHistory = useMemo(() => {
    const minDate =
      periodFilter === 'all'
        ? null
        : addDays(todayKey, -Number(periodFilter) + 1);

    return history.filter((item) => {
      if (minDate && item.date < minDate) {
        return false;
      }
      if (painFilter === 'with' && item.wellbeing.pain === null) {
        return false;
      }
      if (
        painFilter === 'high' &&
        (item.wellbeing.pain === null || item.wellbeing.pain < 6)
      ) {
        return false;
      }
      return true;
    });
  }, [history, periodFilter, painFilter, todayKey]);

  const openCreateToday = useCallback(() => {
    if (todayCheckin) {
      return;
    }
    setFormMode('create');
    setDateKey(todayKey);
    applyCheckinToForm(null);
    setFormError('');
    setMessage('');
    setModalOpen(true);
  }, [applyCheckinToForm, todayCheckin, todayKey]);

  const openExisting = useCallback(
    async (item: DailyCheckin, mode: 'view' | 'edit') => {
      setFormMode(mode);
      setDateKey(item.date);
      setFormError('');
      setMessage('');
      applyCheckinToForm(item);
      setModalOpen(true);

      if (!user) {
        return;
      }
      try {
        const fresh = await getCheckinByDate(user.uid, item.date);
        if (fresh) {
          applyCheckinToForm(fresh);
        }
      } catch {
        // mantém dados da lista
      }
    },
    [applyCheckinToForm, user],
  );

  const openViewExisting = (item: DailyCheckin) => {
    void openExisting(item, 'view');
  };

  const openEditExisting = (item: DailyCheckin) => {
    confirmEnterEditMode(() => {
      void openExisting(item, 'edit');
    });
  };

  const startEditFromView = () => {
    confirmEnterEditMode(() => {
      setFormMode('edit');
    });
  };

  useEffect(() => {
    if (
      openParam !== 'today' ||
      historyLoading ||
      modalOpen ||
      autoOpenHandledRef.current
    ) {
      return;
    }

    autoOpenHandledRef.current = true;
    router.setParams({ open: undefined });

    if (todayCheckin) {
      // Já feito: abre em visualização; edição exige confirmação.
      void openExisting(todayCheckin, 'view');
      return;
    }

    openCreateToday();
  }, [
    historyLoading,
    modalOpen,
    openCreateToday,
    openExisting,
    openParam,
    router,
    todayCheckin,
  ]);

  const handleSave = async () => {
    if (!user) {
      setFormError('Faça login novamente para salvar o check-in.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      await upsertCheckin({
        userId: user.uid,
        date: dateKey,
        treatments,
        activities,
        lifestyle,
        supplements,
        medications,
        wellbeing,
        measurements,
        notes,
      });
      setModalOpen(false);
      setMessage(
        formMode === 'edit'
          ? 'Check-in atualizado.'
          : 'Check-in de hoje registrado.',
      );
      await loadHistory();
    } catch (err) {
      const code =
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        typeof (err as { code: unknown }).code === 'string'
          ? (err as { code: string }).code
          : '';
      if (code === 'permission-denied') {
        setFormError('Sem permissão para salvar neste dia.');
      } else {
        setFormError(
          err instanceof Error
            ? err.message
            : 'Não foi possível salvar o check-in.',
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container
      scroll
      edges={['top', 'left', 'right']}
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow="Diário"
        title="Check-in"
        subtitle="Registre o dia e acompanhe seus registros anteriores."
      />

      <View style={styles.todayCard}>
        <View style={styles.todayTop}>
          <View style={styles.todayText}>
            <Typography variant="caption" color={colors.secondary}>
              Hoje · {formatDateLabel(todayKey)}
            </Typography>
            <Typography variant="h3">
              {todayCheckin ? 'Check-in feito' : 'Ainda sem check-in'}
            </Typography>
            <Typography variant="body" color={colors.textMuted}>
              {todayCheckin
                ? 'Você já registrou hoje. Pode editar se precisar.'
                : 'Reserve um momento para registrar como está se sentindo.'}
            </Typography>
          </View>
          <View
            style={[
              styles.statusDot,
              todayCheckin ? styles.statusDone : styles.statusPending,
            ]}
          >
            <Ionicons
              name={todayCheckin ? 'checkmark' : 'time-outline'}
              size={18}
              color={todayCheckin ? colors.textOnPrimary : colors.primary}
            />
          </View>
        </View>

        {todayCheckin ? (
          <>
            {summaryChips(todayCheckin).length > 0 ? (
              <View style={styles.chipRow}>
                {summaryChips(todayCheckin).map((chip) => (
                  <View key={chip} style={styles.metaChip}>
                    <Typography variant="caption" color={colors.primary}>
                      {chip}
                    </Typography>
                  </View>
                ))}
              </View>
            ) : null}
            <Button
              label="Editar check-in de hoje"
              variant="outline"
              onPress={() => openEditExisting(todayCheckin)}
            />
          </>
        ) : (
          <Button label="Fazer check-in de hoje" onPress={openCreateToday} />
        )}
      </View>

      {error ? <InlineMessage message={error} variant="error" /> : null}
      {message ? <InlineMessage message={message} variant="success" /> : null}

      <View style={styles.historyHeader}>
        <View style={styles.historyTitleRow}>
          <View style={styles.historyTextBlock}>
            <Typography variant="h3">Histórico</Typography>
            <Typography variant="caption" color={colors.textMuted}>
              Toque para ver · use Editar para alterar.
            </Typography>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir filtros do histórico"
            onPress={() => setFiltersOpen((open) => !open)}
            style={({ pressed }) => [
              styles.filterToggle,
              filtersOpen ? styles.filterToggleActive : null,
              pressed ? styles.filterTogglePressed : null,
            ]}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={colors.primary}
            />
            <Typography variant="caption" color={colors.primary}>
              Filtrar
            </Typography>
          </Pressable>
        </View>

        {(periodFilter !== 'all' || painFilter !== 'all') && !filtersOpen ? (
          <Pressable
            onPress={() => setFiltersOpen(true)}
            style={styles.activeFilterHint}
          >
            <Typography variant="caption" color={colors.textMuted}>
              {periodLabel(periodFilter)} · {painLabel(painFilter)}
            </Typography>
            <Typography variant="caption" color={colors.primary}>
              Alterar
            </Typography>
          </Pressable>
        ) : null}

        {filtersOpen ? (
          <View style={styles.filterPanel}>
            <Typography variant="label">Período</Typography>
            <View style={styles.segmentRow}>
              {PERIOD_OPTIONS.map((option) => {
                const selected = periodFilter === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setPeriodFilter(option.id)}
                    style={[
                      styles.segment,
                      selected ? styles.segmentSelected : null,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Typography
                      variant="caption"
                      color={selected ? colors.textOnPrimary : colors.text}
                      align="center"
                    >
                      {option.label}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>

            <Typography variant="label">Dor</Typography>
            <View style={styles.segmentRow}>
              {PAIN_OPTIONS.map((option) => {
                const selected = painFilter === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setPainFilter(option.id)}
                    style={[
                      styles.segment,
                      selected ? styles.segmentSelected : null,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Typography
                      variant="caption"
                      color={selected ? colors.textOnPrimary : colors.text}
                      align="center"
                    >
                      {option.label}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.filterActions}>
              <Pressable
                onPress={() => {
                  setPeriodFilter('all');
                  setPainFilter('all');
                }}
                hitSlop={8}
              >
                <Typography variant="caption" color={colors.textMuted}>
                  Limpar
                </Typography>
              </Pressable>
              <Pressable onPress={() => setFiltersOpen(false)} hitSlop={8}>
                <Typography variant="caption" color={colors.primary}>
                  Pronto
                </Typography>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>

      {historyLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : null}

      {!historyLoading && filteredHistory.length === 0 ? (
        <InlineMessage
          message="Nenhum registro neste filtro."
          variant="info"
        />
      ) : null}

      {filteredHistory.map((item) => {
        const chips = summaryChips(item);
        const isToday = item.date === todayKey;

        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`Ver check-in de ${formatDateLabel(item.date)}`}
            onPress={() => openViewExisting(item)}
            style={({ pressed }) => [
              styles.historyCard,
              isToday ? styles.historyToday : null,
              pressed ? styles.historyPressed : null,
            ]}
          >
            <View style={styles.historyTop}>
              <View style={styles.historyText}>
                <Typography variant="h3">
                  {formatDateLabel(item.date)}
                </Typography>
                <Typography variant="caption" color={colors.success}>
                  Registrado · toque para ver
                </Typography>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Editar check-in de ${formatDateLabel(item.date)}`}
                onPress={(event) => {
                  event.stopPropagation?.();
                  openEditExisting(item);
                }}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.editBadge,
                  pressed ? styles.editBadgePressed : null,
                ]}
              >
                <Ionicons
                  name="create-outline"
                  size={16}
                  color={colors.primary}
                />
                <Typography variant="caption" color={colors.primary}>
                  Editar
                </Typography>
              </Pressable>
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

      <CheckinFormModal
        visible={modalOpen}
        mode={formMode}
        dateKey={dateKey}
        treatments={treatments}
        activities={activities}
        lifestyle={lifestyle}
        supplements={supplements}
        medications={medications}
        wellbeing={wellbeing}
        measurements={measurements}
        notes={notes}
        onTreatments={setTreatments}
        onActivities={setActivities}
        onLifestyle={setLifestyle}
        onSupplements={setSupplements}
        onMedications={setMedications}
        onWellbeing={setWellbeing}
        onMeasurements={setMeasurements}
        onNotes={setNotes}
        saving={saving}
        error={formError}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
        onStartEdit={startEditFromView}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[4],
    paddingBottom: space[8],
  },
  todayCard: {
    gap: space[4],
    padding: space[5],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  todayTop: {
    flexDirection: 'row',
    gap: space[3],
    alignItems: 'flex-start',
  },
  todayText: {
    flex: 1,
    gap: space[1],
  },
  statusDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDone: {
    backgroundColor: colors.primary,
  },
  statusPending: {
    backgroundColor: colors.backgroundAccent,
  },
  historyHeader: {
    gap: space[3],
    marginTop: space[1],
  },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[3],
  },
  historyTextBlock: {
    flex: 1,
    gap: space[1],
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterToggleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundAccent,
  },
  filterTogglePressed: {
    opacity: 0.9,
  },
  activeFilterHint: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.md,
    backgroundColor: colors.backgroundAccent,
  },
  filterPanel: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: space[1],
  },
  segment: {
    flex: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[1],
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: space[1],
  },
  loader: {
    marginVertical: space[4],
  },
  historyCard: {
    gap: space[2],
    padding: space[4],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyToday: {
    borderColor: colors.primary,
  },
  historyPressed: {
    backgroundColor: colors.backgroundAccent,
  },
  historyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  historyText: {
    flex: 1,
    gap: 2,
  },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: space[2],
    paddingVertical: space[1],
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundAccent,
  },
  editBadgePressed: {
    opacity: 0.85,
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
