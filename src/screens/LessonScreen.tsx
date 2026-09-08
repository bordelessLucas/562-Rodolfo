import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  ScreenHeader,
  Typography,
} from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useLesson } from '@/src/hooks/useLesson';
import { colors, radius, space } from '@/src/theme';
import {
  patientCourseHref,
  patientLessonHref,
} from '@/src/utils/patientCoursesNav';
import { firstParam } from '@/src/utils/routeParams';

export function LessonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    courseId?: string | string[];
    lessonId?: string | string[];
    moduleId?: string | string[];
  }>();
  const courseId = firstParam(params.courseId);
  const lessonId = firstParam(params.lessonId);
  const moduleId = firstParam(params.moduleId);
  const { user } = useAuth();
  const {
    lesson,
    progress,
    loading,
    saving,
    error,
    info,
    nextLesson,
    markCompleted,
  } = useLesson({
    courseId,
    moduleId,
    lessonId,
    userId: user?.uid,
  });

  const openVideo = async () => {
    if (!lesson?.videoUrl) {
      return;
    }
    await Linking.openURL(lesson.videoUrl);
  };

  const goBackToCourse = () => {
    if (courseId) {
      router.replace(patientCourseHref(courseId) as Href);
      return;
    }
    router.back();
  };

  const goToNextLesson = () => {
    if (!courseId || !nextLesson) {
      return;
    }
    router.replace(
      patientLessonHref(
        courseId,
        nextLesson.lessonId,
        nextLesson.moduleId,
      ) as Href,
    );
  };

  if (loading && !lesson) {
    return (
      <Container edges={['top', 'left', 'right']} contentStyle={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Typography variant="caption" color={colors.textMuted}>
          Carregando aula…
        </Typography>
      </Container>
    );
  }

  if (!lesson) {
    return (
      <Container edges={['top', 'left', 'right']} contentStyle={styles.content}>
        <ScreenHeader
          title="Aula"
          onBack={goBackToCourse}
          backLabel="Curso"
        />
        <InlineMessage
          message={
            error ??
            'Aula não encontrada. Abra novamente a partir do módulo do curso.'
          }
          variant="error"
        />
        <Button
          label="Voltar ao curso"
          variant="outline"
          onPress={goBackToCourse}
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
        eyebrow={lesson.contentType === 'video' ? 'Videoaula' : 'Leitura'}
        title={lesson.title}
        subtitle={lesson.description}
        onBack={goBackToCourse}
        backLabel="Curso"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}
      {info ? <InlineMessage message={info} variant="info" /> : null}

      {progress?.completed ? (
        <InlineMessage
          message="Aula marcada como concluída na sua conta."
          variant="success"
        />
      ) : null}

      {lesson.contentType === 'video' ? (
        <View style={styles.panel}>
          <Typography variant="body" color={colors.textMuted}>
            O vídeo abre fora do app (navegador ou player do sistema). Quando
            terminar, volte aqui para marcar a aula como concluída.
          </Typography>
          <Button
            label="Abrir videoaula no app externo"
            onPress={openVideo}
            disabled={!lesson.videoUrl}
          />
          {!lesson.videoUrl ? (
            <InlineMessage
              message="URL de vídeo indisponível para esta aula."
              variant="info"
            />
          ) : null}
        </View>
      ) : (
        <View style={styles.panel}>
          <Typography variant="body">
            {lesson.textBody ?? 'Conteúdo textual indisponível.'}
          </Typography>
        </View>
      )}

      {!progress?.completed ? (
        <Button
          label="Voltei — marcar como concluída"
          onPress={markCompleted}
          loading={saving}
        />
      ) : (
        <Button label="Aula concluída" disabled onPress={() => undefined} />
      )}

      {progress?.completed ? (
        nextLesson ? (
          <Button
            label={`Próxima aula: ${nextLesson.title}`}
            onPress={goToNextLesson}
          />
        ) : (
          <Button
            label="Continuar no curso"
            variant="secondary"
            onPress={goBackToCourse}
          />
        )
      ) : null}
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
  panel: {
    gap: space[3],
    padding: space[4],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
