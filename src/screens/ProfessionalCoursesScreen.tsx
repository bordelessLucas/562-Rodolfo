import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  ScreenHeader,
  Typography,
} from '@/src/components';
import { courseStatusLabel } from '@/src/domain/course';
import { useAuth } from '@/src/hooks/useAuth';
import { useMyCourses } from '@/src/hooks/useMyCourses';
import { colors, radius, space } from '@/src/theme';

export function ProfessionalCoursesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { courses, loading, error, refresh } = useMyCourses(user?.uid);

  return (
    <Container
      edges={['top', 'left', 'right']}
      scroll
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow="Conteúdo"
        title="Meus cursos"
        subtitle="Crie rascunhos e envie para aprovação do administrador."
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
        <InlineMessage
          message="Você ainda não criou nenhum curso. Use “Novo curso” para começar um rascunho."
          variant="info"
        />
      ) : null}

      {courses.map((course) => (
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
            <View style={styles.badge}>
              <Typography variant="caption" color={colors.primary}>
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
          <Typography variant="body" color={colors.textMuted} numberOfLines={2}>
            {course.description}
          </Typography>
          {course.status === 'rejected' && course.rejectionReason ? (
            <Typography variant="caption" color={colors.error}>
              Motivo da rejeição: {course.rejectionReason}
            </Typography>
          ) : null}
        </Pressable>
      ))}

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
    backgroundColor: colors.backgroundAccent,
  },
});
