import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Container,
  InlineMessage,
  ScreenHeader,
  Typography,
} from '@/src/components';
import { colors, radius, space } from '@/src/theme';

export type ComingSoonScreenProps = {
  title: string;
  description: string;
};

export function ComingSoonScreen({
  title,
  description,
}: ComingSoonScreenProps) {
  return (
    <Container edges={['top', 'left', 'right']} contentStyle={styles.content}>
      <ScreenHeader eyebrow="Em breve" title={title} subtitle={description} />

      <View style={styles.panel}>
        <View style={styles.iconWrap}>
          <Ionicons name="sparkles-outline" size={28} color={colors.secondary} />
        </View>
        <Typography variant="h3" align="center">
          Conteúdos, cursos e comunidade
        </Typography>
        <Typography variant="body" color={colors.textMuted} align="center">
          Esta área receberá biblioteca de vídeos, mentoria e a comunidade de
          pacientes nas próximas fases.
        </Typography>
        <InlineMessage
          message="Previsto no escopo — ainda não liberado para uso."
          variant="info"
        />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[5],
  },
  panel: {
    alignItems: 'center',
    gap: space[3],
    padding: space[6],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.backgroundAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[1],
  },
});
