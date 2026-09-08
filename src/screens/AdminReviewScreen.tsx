import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  Input,
  ScreenHeader,
  Typography,
} from '@/src/components';
import { useAdminReviewWithPreview } from '@/src/hooks/useAdminReviewWithPreview';
import { colors, radius, space } from '@/src/theme';

export function AdminReviewScreen() {
  const router = useRouter();
  const {
    courses,
    loading,
    error,
    refresh,
    reasonById,
    setReason,
    busyId,
    message,
    actionError,
    approve,
    reject,
    previewById,
    previewLoadingId,
    previewErrorById,
    loadPreview,
  } = useAdminReviewWithPreview();

  return (
    <Container
      edges={['top', 'left', 'right']}
      scroll
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow="Moderação"
        title="Fila de aprovação"
        subtitle="Submissões de profissionais aguardando revisão."
        onBack={() => router.back()}
        backLabel="Início"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}
      {actionError ? (
        <InlineMessage message={actionError} variant="error" />
      ) : null}
      {message ? <InlineMessage message={message} variant="success" /> : null}

      {loading && courses.length === 0 ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator color={colors.primary} />
          <Typography variant="caption" color={colors.textMuted}>
            Carregando fila…
          </Typography>
        </View>
      ) : null}

      {!loading && courses.length === 0 ? (
        <InlineMessage
          message="Nenhuma submissão pendente no momento."
          variant="info"
        />
      ) : null}

      {courses.map((course) => {
        const preview = previewById[course.id];
        const previewError = previewErrorById[course.id];
        return (
          <View key={course.id} style={styles.card}>
            <Typography variant="h3">{course.title}</Typography>
            <Typography variant="body" color={colors.textMuted}>
              {course.description}
            </Typography>
            <Typography variant="caption" color={colors.textMuted}>
              Tipo: {course.kind === 'mentoria' ? 'Mentoria' : 'Curso'}
            </Typography>

            <Button
              label={preview ? 'Atualizar conteúdo' : 'Ver conteúdo'}
              variant="outline"
              loading={previewLoadingId === course.id}
              onPress={() => loadPreview(course.id)}
            />

            {previewError ? (
              <InlineMessage message={previewError} variant="error" />
            ) : null}

            {preview ? (
              <View style={styles.preview}>
                <Typography variant="label">Conteúdo enviado</Typography>
                {preview.modules.length === 0 ? (
                  <Typography variant="caption" color={colors.textMuted}>
                    Nenhum módulo cadastrado.
                  </Typography>
                ) : null}
                {preview.modules.map((mod) => (
                  <View key={mod.id} style={styles.previewBlock}>
                    <Typography variant="bodyStrong">{mod.title}</Typography>
                    {mod.lessons.map((lesson) => (
                      <Typography
                        key={lesson.id}
                        variant="caption"
                        color={colors.textMuted}
                      >
                        · {lesson.title}
                        {lesson.contentType === 'video'
                          ? lesson.videoUrl
                            ? ' (vídeo com URL)'
                            : ' (vídeo sem URL)'
                          : ' (texto)'}
                      </Typography>
                    ))}
                  </View>
                ))}
              </View>
            ) : null}

            <Input
              label="Motivo da rejeição (obrigatório se rejeitar)"
              value={reasonById[course.id] ?? ''}
              onChangeText={(text) => setReason(course.id, text)}
            />
            <Button
              label="Aprovar e publicar"
              loading={busyId === course.id}
              onPress={() => approve(course.id)}
            />
            <Button
              label="Rejeitar"
              variant="outline"
              loading={busyId === course.id}
              onPress={() => reject(course.id)}
            />
          </View>
        );
      })}

      <Button label="Atualizar fila" variant="outline" onPress={refresh} />
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
    gap: space[3],
    padding: space[4],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  preview: {
    gap: space[2],
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.backgroundAccent,
  },
  previewBlock: {
    gap: space[1],
  },
});
