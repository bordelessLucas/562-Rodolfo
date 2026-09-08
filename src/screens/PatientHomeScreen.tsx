import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  ScreenHeader,
  SectionCard,
  Typography,
} from '@/src/components';
import { articleKindLabel } from '@/src/domain/article';
import { useAuth } from '@/src/hooks/useAuth';
import { useContinueLearning } from '@/src/hooks/useContinueLearning';
import { useWeekCheckins } from '@/src/hooks/useWeekCheckins';
import { colors, radius, space } from '@/src/theme';
import {
  PATIENT_COURSES_HREF,
  patientLessonHref,
} from '@/src/utils/patientCoursesNav';

export function PatientHomeScreen() {
  const router = useRouter();
  const { profile, user } = useAuth();
  const { weekDays, todayDone, loading: weekLoading, error: weekError } =
    useWeekCheckins(user?.uid);
  const {
    suggestion,
    featured,
    featuredArticle,
    loading: learnLoading,
  } = useContinueLearning(user?.uid);

  const firstName = profile?.name?.split(' ')[0] ?? 'olá';

  const openContinue = () => {
    if (suggestion) {
      router.push(
        patientLessonHref(
          suggestion.progress.courseId,
          suggestion.progress.lessonId,
          suggestion.progress.moduleId,
        ) as Href,
      );
      return;
    }
    if (featured) {
      router.push(`${PATIENT_COURSES_HREF}/${featured.id}` as Href);
      return;
    }
    if (featuredArticle) {
      router.push(
        `/(paciente)/descobrir/artigos/${featuredArticle.id}` as Href,
      );
      return;
    }
    router.push('/(paciente)/descobrir' as Href);
  };

  return (
    <Container
      edges={['top', 'left', 'right']}
      scroll
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow="Início"
        title={`Olá, ${firstName}`}
        subtitle="Acompanhe seu check-in da semana e continue seus conteúdos."
      />

      <SectionCard
        title="Check-in de hoje"
        description={
          todayDone
            ? 'Você já registrou o dia. Pode revisar ou ajustar o check-in.'
            : 'Reserve um momento para registrar como está se sentindo.'
        }
      >
        <Button
          label={todayDone ? 'Abrir check-in de hoje' : 'Fazer check-in diário'}
          onPress={() => router.push('/(paciente)/checkin' as Href)}
        />
      </SectionCard>

      <SectionCard
        title="Sua semana"
        description="Dias com check-in registrado nesta semana."
      >
        {weekError ? (
          <InlineMessage message={weekError} variant="error" />
        ) : null}
        {weekLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={styles.weekRow}>
            {weekDays.map((day) => (
              <View key={day.dateKey} style={styles.dayCol}>
                <View
                  style={[
                    styles.dot,
                    day.done ? styles.dotDone : styles.dotEmpty,
                    day.isToday ? styles.dotToday : null,
                  ]}
                >
                  {day.done ? (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={colors.textOnPrimary}
                    />
                  ) : null}
                </View>
                <Typography
                  variant="caption"
                  color={day.isToday ? colors.primary : colors.textMuted}
                  align="center"
                >
                  {day.label}
                </Typography>
              </View>
            ))}
          </View>
        )}
      </SectionCard>

      <SectionCard
        title="Continuar aprendendo"
        description="Retome o que você começou ou veja uma sugestão publicada."
      >
        {learnLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : suggestion ? (
          <Pressable
            style={({ pressed }) => [
              styles.suggestCard,
              pressed ? styles.suggestPressed : null,
            ]}
            onPress={openContinue}
            accessibilityRole="button"
          >
            <Typography variant="caption" color={colors.primary}>
              Continuar{' '}
              {suggestion.course.kind === 'mentoria' ? 'mentoria' : 'curso'}
            </Typography>
            <Typography variant="h3">{suggestion.course.title}</Typography>
            <Typography variant="body" color={colors.textMuted} numberOfLines={2}>
              {suggestion.course.description}
            </Typography>
          </Pressable>
        ) : featured ? (
          <Pressable
            style={({ pressed }) => [
              styles.suggestCard,
              pressed ? styles.suggestPressed : null,
            ]}
            onPress={openContinue}
            accessibilityRole="button"
          >
            <Typography variant="caption" color={colors.primary}>
              Sugestão para começar
            </Typography>
            <Typography variant="h3">{featured.title}</Typography>
            <Typography variant="body" color={colors.textMuted} numberOfLines={2}>
              {featured.description}
            </Typography>
          </Pressable>
        ) : featuredArticle ? (
          <Pressable
            style={({ pressed }) => [
              styles.suggestCard,
              pressed ? styles.suggestPressed : null,
            ]}
            onPress={openContinue}
            accessibilityRole="button"
          >
            <Typography variant="caption" color={colors.primary}>
              {articleKindLabel(featuredArticle.kind)} sugerido
            </Typography>
            <Typography variant="h3">{featuredArticle.title}</Typography>
            <Typography variant="body" color={colors.textMuted} numberOfLines={2}>
              {featuredArticle.summary}
            </Typography>
          </Pressable>
        ) : (
          <InlineMessage
            message="Nenhum conteúdo em andamento. Explore cursos e artigos quando quiser."
            variant="info"
          />
        )}
        <Button
          label="Abrir Explorar"
          variant="outline"
          onPress={() => router.push('/(paciente)/descobrir' as Href)}
        />
      </SectionCard>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[4],
    paddingBottom: space[8],
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space[1],
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    gap: space[2],
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  dotEmpty: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  dotDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dotToday: {
    borderColor: colors.secondary,
    borderWidth: 2,
  },
  suggestCard: {
    gap: space[2],
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.backgroundAccent,
  },
  suggestPressed: {
    opacity: 0.9,
  },
});
