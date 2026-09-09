import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import React, { useCallback } from 'react';
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
import {
  insightToneColor,
  type CheckinInsightLevel,
} from '@/src/domain/checkinInsight';
import { useAuth } from '@/src/hooks/useAuth';
import { useContinueLearning } from '@/src/hooks/useContinueLearning';
import { useTodayCheckinInsight } from '@/src/hooks/useTodayCheckinInsight';
import { useWeekCheckins } from '@/src/hooks/useWeekCheckins';
import { colors, radius, space } from '@/src/theme';
import {
  PATIENT_COURSES_HREF,
  patientLessonHref,
} from '@/src/utils/patientCoursesNav';

function toneToColor(
  tone: ReturnType<typeof insightToneColor>,
): string {
  switch (tone) {
    case 'success':
      return colors.success;
    case 'secondary':
      return colors.secondary;
    case 'warning':
      return colors.warning;
    case 'error':
      return colors.error;
    default:
      return colors.textMuted;
  }
}

function levelIcon(
  level: CheckinInsightLevel,
): keyof typeof Ionicons.glyphMap {
  switch (level) {
    case 'ok':
      return 'checkmark-circle';
    case 'comum':
      return 'ellipse';
    case 'anormal':
      return 'alert-circle';
    case 'risco':
      return 'warning';
    case 'muito_risco':
      return 'warning';
    default:
      return 'help-circle-outline';
  }
}

export function PatientHomeScreen() {
  const router = useRouter();
  const { profile, user } = useAuth();
  const {
    weekDays,
    todayDone,
    loading: weekLoading,
    error: weekError,
    refresh: refreshWeek,
  } = useWeekCheckins(user?.uid);
  const {
    insight,
    loading: insightLoading,
    error: insightError,
    refresh: refreshInsight,
  } = useTodayCheckinInsight(user?.uid);
  const {
    suggestion,
    featured,
    featuredArticle,
    loading: learnLoading,
  } = useContinueLearning(user?.uid);

  useFocusEffect(
    useCallback(() => {
      void refreshWeek();
      void refreshInsight();
    }, [refreshWeek, refreshInsight]),
  );

  const firstName = profile?.name?.split(' ')[0] ?? 'olá';
  const insightColor = toneToColor(insightToneColor(insight.level));

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
        subtitle="Continuidade do cuidado, check-in e um olhar orientativo do dia."
      />

      <SectionCard
        title="Sua semana"
        description="Acompanhe a continuidade do tratamento e registre o dia."
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

        <View style={styles.todayBlock}>
          <Typography variant="label">
            {todayDone ? 'Check-in de hoje feito' : 'Check-in de hoje'}
          </Typography>
          <Typography variant="body" color={colors.textMuted}>
            {todayDone
              ? 'Você já registrou o dia. Pode revisar ou ajustar no Check-in.'
              : 'Reserve um momento para registrar como está se sentindo.'}
          </Typography>
          <Button
            label={
              todayDone ? 'Abrir check-in de hoje' : 'Fazer check-in diário'
            }
            onPress={() => router.push('/(paciente)/checkin' as Href)}
          />
        </View>
      </SectionCard>

      <SectionCard
        title="Indicador do dia"
        description="Leitura orientativa do check-in. Não é diagnóstico clínico."
      >
        {insightError ? (
          <InlineMessage message={insightError} variant="error" />
        ) : null}
        {insightLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={styles.insightBlock}>
            <View style={styles.insightHeader}>
              <View
                style={[
                  styles.insightBadge,
                  { backgroundColor: `${insightColor}22` },
                ]}
              >
                <Ionicons
                  name={levelIcon(insight.level)}
                  size={22}
                  color={insightColor}
                />
              </View>
              <View style={styles.insightTitles}>
                <Typography variant="caption" color={colors.textMuted}>
                  Resultado orientativo
                </Typography>
                <Typography variant="h3" color={insightColor}>
                  {insight.label}
                </Typography>
              </View>
            </View>

            <View style={styles.meterTrack}>
              <View
                style={[
                  styles.meterFill,
                  {
                    width: `${insight.score}%`,
                    backgroundColor: insightColor,
                  },
                ]}
              />
            </View>

            <Typography variant="body" color={colors.textMuted}>
              {insight.summary}
            </Typography>

            {insight.factors.length > 0 ? (
              <View style={styles.factorRow}>
                {insight.factors.map((factor) => (
                  <View key={factor} style={styles.factorChip}>
                    <Typography variant="caption" color={colors.primary}>
                      {factor}
                    </Typography>
                  </View>
                ))}
              </View>
            ) : null}

            {insight.level === 'sem_dados' ? (
              <Button
                label="Fazer check-in para analisar"
                variant="outline"
                onPress={() => router.push('/(paciente)/checkin' as Href)}
              />
            ) : null}
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
  todayBlock: {
    gap: space[2],
    marginTop: space[2],
    paddingTop: space[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  insightBlock: {
    gap: space[3],
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  insightBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitles: {
    flex: 1,
    gap: 2,
  },
  meterTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.backgroundAccent,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 4,
  },
  factorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
  factorChip: {
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundAccent,
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
