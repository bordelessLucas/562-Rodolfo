import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  ChipMultiSelect,
  InlineMessage,
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
} from '@/src/domain/checkin';
import { colors, radius, space } from '@/src/theme';
import { formatDateLabel } from '@/src/utils/navigation';

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

export type CheckinFormModalProps = {
  visible: boolean;
  mode: 'create' | 'edit' | 'view';
  dateKey: string;
  treatments: string[];
  activities: string[];
  lifestyle: string[];
  supplements: string[];
  medications: string[];
  wellbeing: WellbeingScores;
  measurements: BodyMeasurements;
  notes: string;
  onTreatments: (value: string[]) => void;
  onActivities: (value: string[]) => void;
  onLifestyle: (value: string[]) => void;
  onSupplements: (value: string[]) => void;
  onMedications: (value: string[]) => void;
  onWellbeing: (value: WellbeingScores) => void;
  onMeasurements: (value: BodyMeasurements) => void;
  onNotes: (value: string) => void;
  saving: boolean;
  error: string;
  onSave: () => void;
  onClose: () => void;
  /** Em modo view, permite ir para edição sem fechar o fluxo. */
  onStartEdit?: () => void;
};

export function CheckinFormModal({
  visible,
  mode,
  dateKey,
  treatments,
  activities,
  lifestyle,
  supplements,
  medications,
  wellbeing,
  measurements,
  notes,
  onTreatments,
  onActivities,
  onLifestyle,
  onSupplements,
  onMedications,
  onWellbeing,
  onMeasurements,
  onNotes,
  saving,
  error,
  onSave,
  onClose,
  onStartEdit,
}: CheckinFormModalProps) {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const readOnly = mode === 'view';

  useEffect(() => {
    if (visible) {
      progress.value = withTiming(1, {
        duration: 320,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progress.value = 0;
    }
  }, [visible, progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.45,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 56 }],
    opacity: 0.35 + progress.value * 0.65,
  }));

  const requestClose = () => {
    progress.value = withTiming(
      0,
      { duration: 220, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(onClose)();
        }
      },
    );
  };

  const updateMeasurement = (key: keyof BodyMeasurements, raw: string) => {
    if (readOnly) {
      return;
    }
    const normalized = raw.replace(',', '.').trim();
    if (!normalized) {
      onMeasurements({ ...measurements, [key]: null });
      return;
    }
    const parsed = Number(normalized);
    onMeasurements({
      ...measurements,
      [key]: Number.isFinite(parsed) ? parsed : measurements[key],
    });
  };

  const titleByMode =
    mode === 'view'
      ? 'Detalhe do check-in'
      : mode === 'edit'
        ? 'Ajustar o dia'
        : 'Registrar o dia';

  const eyebrowByMode =
    mode === 'view'
      ? 'Visualizar'
      : mode === 'edit'
        ? 'Editar registro'
        : 'Novo check-in';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={requestClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={requestClose}>
          <Animated.View
            style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
          />
        </Pressable>

        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            { paddingBottom: Math.max(insets.bottom, space[4]) },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitles}>
              <Typography variant="caption" color={colors.secondary}>
                {eyebrowByMode}
              </Typography>
              <Typography variant="h2">{titleByMode}</Typography>
            </View>
            <Pressable
              onPress={requestClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              hitSlop={10}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            <Typography variant="body" color={colors.textMuted}>
              {mode === 'view'
                ? `${formatDateLabel(dateKey)} · somente leitura`
                : mode === 'edit'
                  ? `Editando ${formatDateLabel(dateKey)}`
                  : 'Registro de hoje — preencha só o que quiser.'}
            </Typography>

            {readOnly ? (
              <InlineMessage
                message="Você está só visualizando. Use Editar para alterar."
                variant="info"
              />
            ) : null}

            <View pointerEvents={readOnly ? 'none' : 'auto'} style={styles.fields}>
            <Typography variant="label">Tratamentos</Typography>
            <ChipMultiSelect
              options={TREATMENT_OPTIONS}
              selected={treatments}
              onChange={onTreatments}
              allowCustom={!readOnly}
            />

            <Typography variant="label">Atividades</Typography>
            <ChipMultiSelect
              options={ACTIVITY_OPTIONS}
              selected={activities}
              onChange={onActivities}
              allowCustom={!readOnly}
            />

            <Typography variant="label">Dieta e estilo de vida</Typography>
            <ChipMultiSelect
              options={LIFESTYLE_OPTIONS}
              selected={lifestyle}
              onChange={onLifestyle}
              allowCustom={!readOnly}
            />

            {!readOnly ? (
              <InlineMessage
                message={MEDICATION_SAFETY_NOTICE}
                variant="info"
              />
            ) : null}
            <Typography variant="label">Suplementos</Typography>
            <ChipMultiSelect
              options={SUPPLEMENT_OPTIONS}
              selected={supplements}
              onChange={onSupplements}
              allowCustom={!readOnly}
            />
            <Typography variant="label">Medicamentos</Typography>
            <ChipMultiSelect
              options={MEDICATION_OPTIONS}
              selected={medications}
              onChange={onMedications}
              allowCustom={!readOnly}
            />

            <WellbeingScale
              label="Dor"
              lowLabel="Nenhuma"
              highLabel="Intensa"
              value={wellbeing.pain}
              onChange={(pain) => onWellbeing({ ...wellbeing, pain })}
            />
            <WellbeingScale
              label="Sensação de peso"
              lowLabel="Leve"
              highLabel="Muito pesada"
              value={wellbeing.heaviness}
              onChange={(heaviness) =>
                onWellbeing({ ...wellbeing, heaviness })
              }
            />
            <WellbeingScale
              label="Energia"
              lowLabel="Exausto"
              highLabel="Energizado"
              value={wellbeing.energy}
              onChange={(energy) => onWellbeing({ ...wellbeing, energy })}
            />
            <WellbeingScale
              label="Humor"
              lowLabel="Ruim"
              highLabel="Ótimo"
              value={wellbeing.mood}
              onChange={(mood) => onWellbeing({ ...wellbeing, mood })}
            />

            <Typography variant="label">Medidas</Typography>
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
                    editable={!readOnly}
                    style={styles.measureInput}
                  />
                </View>
              ))}
            </View>

            <Typography variant="label">Observações</Typography>
            <TextInput
              value={notes}
              onChangeText={onNotes}
              placeholder={
                readOnly ? 'Sem observações' : 'Como você se sentiu hoje...'
              }
              placeholderTextColor={colors.textMuted}
              multiline
              editable={!readOnly}
              style={styles.notes}
            />
            </View>

            {error ? <InlineMessage message={error} variant="error" /> : null}

            {mode === 'view' ? (
              <Button
                label="Editar este check-in"
                onPress={() => onStartEdit?.()}
              />
            ) : (
              <Button
                label="Salvar check-in"
                loading={saving}
                onPress={onSave}
              />
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: colors.text,
  },
  sheet: {
    maxHeight: '92%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: space[2],
    borderWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: space[2],
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: space[5],
    paddingBottom: space[3],
    gap: space[3],
  },
  sheetTitles: {
    flex: 1,
    gap: space[1],
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAccent,
  },
  sheetContent: {
    paddingHorizontal: space[5],
    paddingBottom: space[8],
    gap: space[3],
  },
  fields: {
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
    minHeight: 110,
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
});
