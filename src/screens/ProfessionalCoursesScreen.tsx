import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  ScreenHeader,
  Typography,
} from '@/src/components';
import { courseStatusLabel, type CourseStatus } from '@/src/domain/course';
import { useAuth } from '@/src/hooks/useAuth';
import { useMyCourses } from '@/src/hooks/useMyCourses';
import { colors, radius, space } from '@/src/theme';

function statusColor(status: CourseStatus): string {
  switch (status) {
    case 'published':
      return colors.success;
    case 'pending_review':
      return colors.warning;
    case 'rejected':
      return colors.error;
    case 'draft':
    default:
      return colors.primary;
  }
}

export function ProfessionalCoursesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { courses, loading, error, refresh } = useMyCourses(user?.uid);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <Container
      edges={['top', 'left', 'right']}
      scroll
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow="Conteúdo"
        title="Meus cursos"
        subtitle="Rascunhos com link externo de vídeo. Envie para aprovação do admin."
        onBack={() => router.replace('/(profissional)' as Href)}
        backLabel="Início"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}

      <Button
        label="Novo curso"
        onPress={() => router.push('/(profissional)/cursos/novo' as Href)}
      />

      {loading && courses.length === 0 ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator color={colors.primary} />
          <Typography variant="caption" color={colors.textMuted}>
            Carregando seus cursos…
          </Typography>
        </View>
      ) : null}

      {!loading && courses.length === 0 && !error ? (
        <View style={styles.emptyCard}>
          <Typography variant="h3">Nenhum curso ainda</Typography>
          <Typography variant="body" color={colors.textMuted}>
            Crie um rascunho com título, um módulo, uma aula e a URL do YouTube
            (ou outro link https). Depois envie para o administrador aprovar.
          </Typography>
        </View>
      ) : null}

      {courses.map((course) => {
        const tone = statusColor(course.status);
        return (
          <Pressable
            key={course.id}
            style={({ pressed }) => [
              styles.card,
              pressed ? styles.cardPressed : null,
            ]}
            onPress={() =>
              router.push(`/(profissional)/cursos/${course.id}` as Href)
            }
            accessibilityRole="button"
            accessibilityLabel={`Editar ${course.title}`}
          >
            <View style={styles.row}>
              <View style={[styles.badge, { backgroundColor: `${tone}22` }]}>
                <Typography variant="caption" color={tone}>
                  {courseStatusLabel(course.status)}
                </Typography>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </View>
            <Typography variant="h3">{course.title}</Typography>
            <Typography
              variant="body"
              color={colors.textMuted}
              numberOfLines={2}
            >
              {course.description || 'Sem descrição'}
            </Typography>
            {course.status === 'rejected' && course.rejectionReason ? (
              <Typography variant="caption" color={colors.error}>
                Motivo da rejeição: {course.rejectionReason}
              </Typography>
            ) : null}
            {course.status === 'draft' ? (
              <Typography variant="caption" color={colors.textMuted}>
                Toque para editar e enviar para aprovação
              </Typography>
            ) : null}
          </Pressable>
        );
      })}

      <Button label="Atualizar lista" variant="outline" onPress={refresh} />
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[4],
    paddingBottom: space[8],
  },
  centerBlock: {
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[5],
  },
  emptyCard: {
    gap: space[2],
    padding: space[5],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  card: {
    gap: space[2],
    padding: space[4],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    backgroundColor: colors.backgroundAccent,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: space[2],
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
});
