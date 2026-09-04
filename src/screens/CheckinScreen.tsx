import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import {
  Button,
  ChipMultiSelect,
  Container,
  DateNavigator,
  InlineMessage,
  ScreenHeader,
  SectionCard,
  Typography,
  WellbeingScale,
} from '@/src/components';
import {
  ACTIVITY_OPTIONS,
  LIFESTYLE_OPTIONS,
  MEDICATION_OPTIONS,
  MEDICATION_SAFETY_NOTICE,
  SUPPLEMENT_OPTIONS,
  TREATMENT_OPTIONS,
  type BodyMeasurements,
  type WellbeingScores,
  createEmptyMeasurements,
  createEmptyWellbeing,
} from '@/src/domain/checkin';
import { useAuth } from '@/src/hooks/useAuth';
import {
  getCheckinByDate,
  upsertCheckin,
} from '@/src/services/checkin.service';
import { colors, radius, space } from '@/src/theme';
import {
  addDays,
  isFutureDate,
  toDateKey,
} from '@/src/utils/navigation';

const MEASUREMENT_FIELDS: {
  key: keyof BodyMeasurements;
  label: string;
}[] = [
  { key: 'ankleLeft', label: 'Tornozelo E (cm)' },
  { key: 'ankleRight', label: 'Tornozelo D (cm)' },
  { key: 'calfLeft', label: 'Panturrilha E (cm)' },
  { key: 'calfRight', label: 'Panturrilha D (cm)' },
  { key: 'kneeLeft', label: 'Joelho E (cm)' },
  { key: 'kneeRight', label: 'Joelho D (cm)' },
  { key: 'thighLeft', label: 'Coxa E (cm)' },
  { key: 'thighRight', label: 'Coxa D (cm)' },
  { key: 'upperArmLeft', label: 'Braço E (cm)' },
  { key: 'upperArmRight', label: 'Braço D (cm)' },
  { key: 'weight', label: 'Peso (kg)' },
];

export function CheckinScreen() {
  const { user } = useAuth();
  const [dateKey, setDateKey] = useState(toDateKey(new Date()));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

  const load = useCallback(async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const existing = await getCheckinByDate(user.uid, dateKey);
      if (existing) {
        setTreatments(existing.treatments);
        setActivities(existing.activities);
        setLifestyle(existing.lifestyle);
        setSupplements(existing.supplements);
        setMedications(existing.medications);
        setWellbeing(existing.wellbeing);
        setMeasurements(existing.measurements);
        setNotes(existing.notes);
      } else {
        setTreatments([]);
        setActivities([]);
        setLifestyle([]);
        setSupplements([]);
        setMedications([]);
        setWellbeing(createEmptyWellbeing());
        setMeasurements(createEmptyMeasurements());
        setNotes('');
      }
    } catch {
      setError('Não foi possível carregar o check-in deste dia.');
    } finally {
      setLoading(false);
    }
  }, [user, dateKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    if (!user) {
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

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
      setMessage('Check-in salvo com sucesso.');
    } catch {
      setError('Não foi possível salvar o check-in. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const updateMeasurement = (key: keyof BodyMeasurements, raw: string) => {
    const normalized = raw.replace(',', '.').trim();
    if (!normalized) {
      setMeasurements((prev) => ({ ...prev, [key]: null }));
      return;
    }
    const parsed = Number(normalized);
    setMeasurements((prev) => ({
      ...prev,
      [key]: Number.isFinite(parsed) ? parsed : prev[key],
    }));
  };

  return (
    <Container
      scroll
      keyboardAvoiding
      edges={['top', 'left', 'right']}
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow="Diário"
        title="Check-in"
        subtitle="Registre o que fizer sentido. Nenhuma seção é obrigatória."
      />

      <DateNavigator
        dateKey={dateKey}
        onPrevious={() => setDateKey((current) => addDays(current, -1))}
        onNext={() => setDateKey((current) => addDays(current, 1))}
        onToday={() => setDateKey(toDateKey(new Date()))}
        disableNext={isFutureDate(addDays(dateKey, 1))}
      />

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Typography variant="caption" color={colors.textMuted}>
            Carregando o dia…
          </Typography>
        </View>
      ) : (
        <>
          <SectionCard title="Tratamentos">
            <ChipMultiSelect
              options={TREATMENT_OPTIONS}
              selected={treatments}
              onChange={setTreatments}
            />
          </SectionCard>

          <SectionCard title="Atividades">
            <ChipMultiSelect
              options={ACTIVITY_OPTIONS}
              selected={activities}
              onChange={setActivities}
            />
          </SectionCard>

          <SectionCard
            title="Dieta e estilo de vida"
            description="Opções iniciais — a lista oficial pode evoluir com o cliente."
          >
            <ChipMultiSelect
              options={LIFESTYLE_OPTIONS}
              selected={lifestyle}
              onChange={setLifestyle}
            />
          </SectionCard>

          <SectionCard title="Suplementos e medicamentos">
            <InlineMessage message={MEDICATION_SAFETY_NOTICE} variant="info" />
            <Typography variant="label">Suplementos</Typography>
            <ChipMultiSelect
              options={SUPPLEMENT_OPTIONS}
              selected={supplements}
              onChange={setSupplements}
            />
            <Typography variant="label">Medicamentos</Typography>
            <ChipMultiSelect
              options={MEDICATION_OPTIONS}
              selected={medications}
              onChange={setMedications}
            />
          </SectionCard>

          <SectionCard title="Bem-estar">
            <WellbeingScale
              label="Dor"
              lowLabel="Nenhuma"
              highLabel="Intensa"
              value={wellbeing.pain}
              onChange={(pain) => setWellbeing((prev) => ({ ...prev, pain }))}
            />
            <WellbeingScale
              label="Sensação de peso"
              lowLabel="Leve"
              highLabel="Muito pesada"
              value={wellbeing.heaviness}
              onChange={(heaviness) =>
                setWellbeing((prev) => ({ ...prev, heaviness }))
              }
            />
            <WellbeingScale
              label="Energia"
              lowLabel="Exausto"
              highLabel="Energizado"
              value={wellbeing.energy}
              onChange={(energy) =>
                setWellbeing((prev) => ({ ...prev, energy }))
              }
            />
            <WellbeingScale
              label="Humor"
              lowLabel="Ruim"
              highLabel="Ótimo"
              value={wellbeing.mood}
              onChange={(mood) => setWellbeing((prev) => ({ ...prev, mood }))}
            />
          </SectionCard>

          <SectionCard
            title="Medidas"
            description="Preencha só o que quiser. Entrada por voz virá depois."
          >
            <View style={styles.measureGrid}>
              {MEASUREMENT_FIELDS.map((field) => (
                <View key={field.key} style={styles.measureField}>
                  <Typography variant="caption" color={colors.textMuted}>
                    {field.label}
                  </Typography>
                  <TextInput
                    keyboardType="decimal-pad"
                    value={
                      measurements[field.key] === null
                        ? ''
                        : String(measurements[field.key])
                    }
                    onChangeText={(text) =>
                      updateMeasurement(field.key, text)
                    }
                    placeholder="—"
                    placeholderTextColor={colors.textMuted}
                    style={styles.measureInput}
                  />
                </View>
              ))}
            </View>
          </SectionCard>

          <SectionCard title="Observações">
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Como você se sentiu hoje..."
              placeholderTextColor={colors.textMuted}
              multiline
              style={styles.notes}
            />
          </SectionCard>

          {error ? <InlineMessage message={error} variant="error" /> : null}
          {message ? (
            <InlineMessage message={message} variant="success" />
          ) : null}

          <View style={styles.saveBlock}>
            <Button
              label="Salvar check-in"
              loading={saving}
              onPress={handleSave}
            />
          </View>
        </>
      )}
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
    gap: space[3],
  },
  measureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[3],
  },
  measureField: {
    width: '47%',
    gap: space[1],
  },
  measureInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space[3],
    color: colors.text,
    backgroundColor: colors.background,
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 16,
  },
  notes: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: space[4],
    textAlignVertical: 'top',
    color: colors.text,
    backgroundColor: colors.background,
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  saveBlock: {
    paddingTop: space[2],
    paddingBottom: space[4],
  },
});
