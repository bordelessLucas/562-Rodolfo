import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Input } from '@/src/components/Input';
import { Typography } from '@/src/components/Typography';
import { colors, space } from '@/src/theme';
import {
  EXTERNAL_VIDEO_FIELD_HINT,
  EXTERNAL_VIDEO_PLACEHOLDER,
  parseExternalVideoUrl,
} from '@/src/utils/externalVideoUrl';

export type ExternalVideoUrlFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  editable?: boolean;
  /** Exige URL válida (mostra erro sob o campo se preenchida e inválida). */
  showValidation?: boolean;
  label?: string;
};

export function ExternalVideoUrlField({
  value,
  onChangeText,
  editable = true,
  showValidation = true,
  label = 'URL do vídeo (externa)',
}: ExternalVideoUrlFieldProps) {
  const parsed = useMemo(() => parseExternalVideoUrl(value), [value]);
  const showError =
    showValidation && value.trim().length > 0 && !parsed.ok && parsed.error
      ? parsed.error
      : undefined;
  const hint =
    value.trim().length === 0
      ? EXTERNAL_VIDEO_FIELD_HINT
      : parsed.ok
        ? `${parsed.providerLabel} · pronto para abrir fora do app`
        : EXTERNAL_VIDEO_FIELD_HINT;

  return (
    <View style={styles.wrap}>
      <Input
        label={label}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        placeholder={EXTERNAL_VIDEO_PLACEHOLDER}
        editable={editable}
        error={showError}
        leftIcon="logo-youtube"
      />
      {!showError ? (
        <Typography variant="caption" color={colors.textMuted}>
          {hint}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: space[2],
  },
});
