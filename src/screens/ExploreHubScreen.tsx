import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

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
import {
  useExploreFeed,
  type ExploreFilter,
} from '@/src/hooks/useExploreFeed';
import { colors, radius, space } from '@/src/theme';
import { patientCourseHref } from '@/src/utils/patientCoursesNav';

const FILTERS: { id: ExploreFilter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'curso', label: 'Cursos' },
  { id: 'mentoria', label: 'Mentorias' },
  { id: 'noticia', label: 'Notícias' },
  { id: 'pesquisa', label: 'Pesquisas' },
  { id: 'artigo', label: 'Artigos' },
];

export function ExploreHubScreen() {
  const router = useRouter();
  const {
    items,
    loading,
    error,
    refresh,
    usingDemo,
    queryText,
    setQueryText,
    filter,
    setFilter,
  } = useExploreFeed();

  return (
    <Container
      edges={['top', 'left', 'right']}
      scroll
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow="Explorar"
        title="Conteúdos"
        subtitle="Busque cursos, mentorias, notícias, pesquisas e artigos."
      />

      <Input
        label="Buscar por nome"
        value={queryText}
        onChangeText={setQueryText}
        placeholder="Ex.: compressão, lipedema…"
        leftIcon="search-outline"
        autoCapitalize="none"
      />

      <View style={styles.filters}>
        <Typography variant="label">Filtrar</Typography>
        <SelectableChipGroup>
          {FILTERS.map((item) => (
            <SelectableChip
              key={item.id}
              label={item.label}
              selected={filter === item.id}
              onPress={() => setFilter(item.id)}
            />
          ))}
        </SelectableChipGroup>
      </View>

      {error ? <InlineMessage message={error} variant="error" /> : null}
      {usingDemo ? (
        <InlineMessage
          message="Modo demonstração: parte do catálogo pode ser local."
          variant="info"
        />
      ) : null}

      {loading && items.length === 0 ? (
        <ActivityIndicator color={colors.primary} />
      ) : null}

      {!loading && items.length === 0 && !error ? (
        <InlineMessage
          message="Nenhum conteúdo encontrado com esses filtros."
          variant="info"
        />
      ) : null}

      {items.map((item) => (
        <Pressable
          key={item.key}
          style={({ pressed }) => [
            styles.card,
            pressed ? styles.cardPressed : null,
          ]}
          onPress={() => {
            if (item.type === 'course') {
              router.push(patientCourseHref(item.course.id) as Href);
            } else {
              router.push(
                `/(paciente)/descobrir/artigos/${item.article.id}` as Href,
              );
            }
          }}
          accessibilityRole="button"
        >
          <View style={styles.badge}>
            <Typography variant="caption" color={colors.primary}>
              {item.badge}
            </Typography>
          </View>
          <Typography variant="h3">{item.title}</Typography>
          <Typography variant="body" color={colors.textMuted} numberOfLines={3}>
            {item.summary}
          </Typography>
          <View style={styles.row}>
            <Typography variant="caption" color={colors.textMuted}>
              Abrir
            </Typography>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          </View>
        </Pressable>
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
  filters: {
    gap: space[2],
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
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: space[2],
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundAccent,
  },
  row: {
    marginTop: space[1],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
