import { useRouter, type Href } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Container,
  ExternalVideoUrlField,
  InlineMessage,
  Input,
  ScreenHeader,
  SelectableChip,
  SelectableChipGroup,
  Typography,
} from '@/src/components';
import { useToast } from '@/src/contexts/ToastContext';
import { useAdminCourseCreate } from '@/src/hooks/useAdminCourseCreate';
import { space } from '@/src/theme';

export function AdminCourseCreateScreen() {
  const router = useRouter();
  const { showToast } = useToast();
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
    error,
    publish,
  } = useAdminCourseCreate();

  const handlePublish = async () => {
    const result = await publish();
    if (!result.ok) {
      showToast({
        message: result.error,
        variant: 'error',
      });
      return;
    }

    const kindLabel = result.kind === 'mentoria' ? 'Mentoria' : 'Curso';
    showToast({
      message: `${kindLabel} publicado: ${result.title}`,
      variant: 'success',
    });
    router.replace('/(admin)' as Href);
  };

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
        subtitle="Publique com link externo de vídeo (YouTube / Vimeo / https)."
        onBack={() => router.replace('/(admin)' as Href)}
        backLabel="Início"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}

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
      <ExternalVideoUrlField
        value={videoUrl}
        onChangeText={setVideoUrl}
      />

      <Button
        label="Publicar agora"
        loading={loading}
        onPress={() => void handlePublish()}
      />
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
