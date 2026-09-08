import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  Input,
  ScreenHeader,
  SelectableChip,
  SelectableChipGroup,
  Typography,
} from '@/src/components';
import { useProfessionalCourseEditor } from '@/src/hooks/useProfessionalCourseEditor';
import { colors, space } from '@/src/theme';

export function ProfessionalCourseEditorScreen() {
  const {
    isNew,
    title,
    setTitle,
    description,
    setDescription,
    kind,
    setKind,
    moduleTitle,
    setModuleTitle,
    lessonTitle,
    setLessonTitle,
    videoUrl,
    setVideoUrl,
    savedCourseId,
    status,
    statusLabel,
    canEditContent,
    contentHydrated,
    loadingCourse,
    loading,
    message,
    error,
    saveDraft,
    submit,
    goBack,
    goToMyCourses,
  } = useProfessionalCourseEditor();

  if (loadingCourse) {
    return (
      <Container edges={['top', 'left', 'right']} contentStyle={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Typography variant="caption" color={colors.textMuted}>
          Carregando curso…
        </Typography>
      </Container>
    );
  }

  const awaitingReview = status === 'pending_review';
  const fieldsDisabled = !canEditContent || !contentHydrated;

  return (
    <Container
      edges={['top', 'left', 'right']}
      scroll
      keyboardAvoiding
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow="Edição"
        title={isNew ? 'Novo curso' : 'Editar curso'}
        subtitle={`Status: ${statusLabel}. Nesta fase você edita um módulo e uma aula.`}
        onBack={goBack}
        backLabel="Meus cursos"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}
      {message ? <InlineMessage message={message} variant="success" /> : null}

      {awaitingReview ? (
        <InlineMessage
          message="Aguardando revisão do administrador. Edição bloqueada até uma decisão (aprovação ou rejeição)."
          variant="info"
        />
      ) : null}

      {!canEditContent && status === 'published' ? (
        <InlineMessage
          message="Curso publicado. Alterações de conteúdo não estão disponíveis nesta tela."
          variant="info"
        />
      ) : null}

      <Input
        label="Título"
        value={title}
        onChangeText={setTitle}
        editable={!fieldsDisabled}
      />
      <Input
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        multiline
        editable={!fieldsDisabled}
      />

      <View style={styles.block}>
        <Typography variant="label">Tipo de conteúdo</Typography>
        <SelectableChipGroup>
          <SelectableChip
            label="Curso"
            selected={kind === 'curso'}
            onPress={() => {
              if (!fieldsDisabled) {
                setKind('curso');
              }
            }}
          />
          <SelectableChip
            label="Mentoria"
            selected={kind === 'mentoria'}
            onPress={() => {
              if (!fieldsDisabled) {
                setKind('mentoria');
              }
            }}
          />
        </SelectableChipGroup>
      </View>

      <Input
        label="Título do módulo"
        value={moduleTitle}
        onChangeText={setModuleTitle}
        editable={!fieldsDisabled}
      />
      <Input
        label="Título da aula"
        value={lessonTitle}
        onChangeText={setLessonTitle}
        editable={!fieldsDisabled}
      />
      <Input
        label="URL do vídeo (demonstração)"
        value={videoUrl}
        onChangeText={setVideoUrl}
        autoCapitalize="none"
        editable={!fieldsDisabled}
      />

      <Button
        label="Salvar rascunho"
        loading={loading}
        onPress={saveDraft}
        disabled={fieldsDisabled}
      />

      {!savedCourseId && canEditContent ? (
        <InlineMessage
          message="Salve o rascunho antes de enviar para aprovação."
          variant="info"
        />
      ) : null}

      <Button
        label="Enviar para aprovação"
        variant="secondary"
        loading={loading}
        onPress={submit}
        disabled={!savedCourseId || !canEditContent || loading}
      />

      {status === 'pending_review' ? (
        <Button
          label="Ver meus cursos"
          variant="outline"
          onPress={goToMyCourses}
        />
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
  block: {
    gap: space[2],
  },
});
