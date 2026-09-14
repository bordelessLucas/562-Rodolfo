import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { InlineMessage } from '@/src/components/InlineMessage';
import { Typography } from '@/src/components/Typography';
import { colors, radius, space } from '@/src/theme';
import { parseExternalVideoUrl } from '@/src/utils/externalVideoUrl';

export type ExternalVideoPanelProps = {
  videoUrl: string | null | undefined;
  /** Texto auxiliar acima do CTA. */
  helperText?: string;
};

export function ExternalVideoPanel({
  videoUrl,
  helperText = 'O vídeo abre fora do app (navegador ou app do provedor). Quando terminar, volte aqui para marcar a aula como concluída.',
}: ExternalVideoPanelProps) {
  const parsed = parseExternalVideoUrl(videoUrl);
  const [opening, setOpening] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);

  const openVideo = useCallback(async () => {
    if (!parsed.ok || !parsed.watchUrl) {
      return;
    }
    setOpening(true);
    setOpenError(null);
    try {
      const canOpen = await Linking.canOpenURL(parsed.watchUrl);
      if (!canOpen) {
        setOpenError('Não foi possível abrir este link neste dispositivo.');
        return;
      }
      await Linking.openURL(parsed.watchUrl);
    } catch {
      setOpenError('Falha ao abrir o vídeo. Verifique a URL e tente de novo.');
    } finally {
      setOpening(false);
    }
  }, [parsed.ok, parsed.watchUrl]);

  if (!parsed.ok) {
    return (
      <View style={styles.panel}>
        <Typography variant="label" color={colors.textMuted}>
          Videoaula
        </Typography>
        <InlineMessage
          message={
            parsed.provider === 'empty'
              ? 'URL de vídeo indisponível para esta aula.'
              : (parsed.error ?? 'URL de vídeo inválida.')
          }
          variant="info"
        />
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <View style={styles.meta}>
        <Typography variant="label">{parsed.providerLabel}</Typography>
        <Typography variant="caption" color={colors.textMuted}>
          Link externo · sem armazenamento no app
        </Typography>
      </View>

      {parsed.thumbnailUrl ? (
        <Image
          source={{ uri: parsed.thumbnailUrl }}
          style={styles.thumb}
          contentFit="cover"
          accessibilityLabel={`Prévia ${parsed.providerLabel}`}
        />
      ) : (
        <View style={styles.thumbPlaceholder}>
          <Typography variant="caption" color={colors.textMuted}>
            Vídeo externo
          </Typography>
        </View>
      )}

      <Typography variant="body" color={colors.textMuted}>
        {helperText}
      </Typography>

      {openError ? <InlineMessage message={openError} variant="error" /> : null}

      <Button
        label={parsed.ctaLabel}
        loading={opening}
        onPress={() => void openVideo()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: space[3],
    padding: space[4],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  meta: {
    gap: space[1],
  },
  thumb: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundAccent,
  },
  thumbPlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
