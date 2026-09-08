import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  ScreenHeader,
  SectionCard,
  Typography,
} from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useCourseDetail } from '@/src/hooks/useCourseDetail';
import { colors, radius, space } from '@/src/theme';
import {
  PATIENT_COURSES_HREF,
  patientLessonHref,
} from '@/src/utils/patientCoursesNav';
import { firstParam } from '@/src/utils/routeParams';

export function CourseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId?: string | string[] }>();
  const courseId = firstParam(params.courseId);
  const { user } = useAuth();
  const { course, progress, loading, error, refresh } = useCourseDetail(
    courseId,
    user?.uid,
  );

  const completedSet = useMemo(() => {
    return new Set(
      progress.filter((item) => item.completed).map((item) => item.lessonId),
    );
  }, [progress]);

  const completedCount = completedSet.size;
  const totalLessons =
    course?.modules.reduce((acc, mod) => acc + mod.lessons.length, 0) ?? 0;

  if (loading && !course) {
    return (
      <Container edges={['top', 'left', 'right']} contentStyle={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Typography variant="caption" color={colors.textMuted}>
          Carregando curso…
        </Typography>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container edges={['top', 'left', 'right']} contentStyle={styles.content}>
        <ScreenHeader
          title="Curso"
          onBack={() => router.replace(PATIENT_COURSES_HREF as Href)}
          backLabel="Catálogo"
        />
        <InlineMessage
          message={error ?? 'Curso não encontrado.'}
          variant="error"
        />
        <Button
          label="Voltar ao catálogo"
          variant="outline"
          onPress={() => router.replace(PATIENT_COURSES_HREF as Href)}
        />
      </Container>
    );
  }

  return (
    <Container
      edges={['top', 'left', 'right']}
      scroll
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow={course.kind === 'mentoria' ? 'Mentoria' : 'Curso'}
        title={course.title}
        subtitle={course.description}
        onBack={() => router.replace(PATIENT_COURSES_HREF as Href)}
        backLabel="Catálogo"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}

      {totalLessons > 0 ? (
        <InlineMessage
          message={
            completedCount === 0
              ? `${totalLessons} aula(s) neste conteúdo.`
              : `Progresso: ${completedCount} de ${totalLessons} aula(s) concluída(s).`
          }
          variant={completedCount === totalLessons ? 'success' : 'info'}
        />
      ) : null}

      {course.modules.map((mod) => (
        <SectionCard
          key={mod.id}
          title={mod.title}
          description={mod.description}
        >
          {mod.lessons.length === 0 ? (
            <Typography variant="caption" color={colors.textMuted}>
              Nenhuma aula neste módulo.
            </Typography>
          ) : null}
          {mod.lessons.map((lesson) => {
            const done = completedSet.has(lesson.id);
            return (
              <Pressable
                key={lesson.id}
                style={({ pressed }) => [
                  styles.lessonRow,
                  pressed ? styles.lessonPressed : null,
                ]}
                onPress={() =>
                  router.push(
                    patientLessonHref(course.id, lesson.id, mod.id) as Href,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={`${lesson.title}${done ? ', concluída' : ''}`}
              >
                <View style={styles.lessonIcon}>
                  <Ionicons
                    name={
                      lesson.contentType === 'video'
                        ? 'play-circle-outline'
                        : 'document-text-outline'
                    }
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.lessonText}>
                  <Typography variant="body">{lesson.title}</Typography>
                  <Typography variant="caption" color={colors.textMuted}>
                    {lesson.contentType === 'video' ? 'Videoaula' : 'Leitura'}
                    {done ? ' · Concluída' : ''}
                  </Typography>
                </View>
                {done ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.success}
                  />
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.textMuted}
                  />
                )}
              </Pressable>
            );
          })}
        </SectionCard>
      ))}

      <Button label="Atualizar" variant="outline" onPress={refresh} />
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[4],
    paddingBottom: space[8],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  lessonPressed: {
    opacity: 0.75,
  },
  lessonIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonText: {
    flex: 1,
    gap: 2,
  },
});
