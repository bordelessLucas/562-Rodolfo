import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

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
import { useAdminCourseCreate } from '@/src/hooks/useAdminCourseCreate';
import { space } from '@/src/theme';

export function AdminCourseCreateScreen() {
  const router = useRouter();
  const {
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
    sortOrder,
    setSortOrder,
    loading,
    message,
    error,
    publish,
  } = useAdminCourseCreate();

  return (
    <Container
      edges={['top', 'left', 'right']}
      scroll
      keyboardAvoiding
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow="Publicação"
        title="Novo curso"
        subtitle="Crie e publique diretamente para o catálogo de pacientes."
        onBack={() => router.back()}
        backLabel="Início"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}
      {message ? <InlineMessage message={message} variant="success" /> : null}

      <Input label="Título" value={title} onChangeText={setTitle} />
      <Input
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Input
        label="Ordem de exibição"
        value={sortOrder}
        onChangeText={setSortOrder}
        keyboardType="number-pad"
      />

      <View style={styles.block}>
        <Typography variant="label">Tipo de conteúdo</Typography>
        <SelectableChipGroup>
          <SelectableChip
            label="Curso"
            selected={kind === 'curso'}
            onPress={() => setKind('curso')}
          />
          <SelectableChip
            label="Mentoria"
            selected={kind === 'mentoria'}
            onPress={() => setKind('mentoria')}
          />
        </SelectableChipGroup>
      </View>

      <Input
        label="Título do módulo"
        value={moduleTitle}
        onChangeText={setModuleTitle}
      />
      <Input
        label="Título da aula"
        value={lessonTitle}
        onChangeText={setLessonTitle}
      />
      <Input
        label="URL do vídeo (demonstração)"
        value={videoUrl}
        onChangeText={setVideoUrl}
        autoCapitalize="none"
      />

      <Button label="Publicar agora" loading={loading} onPress={publish} />
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[4],
    paddingBottom: space[8],
  },
  block: {
    gap: space[2],
  },
});
