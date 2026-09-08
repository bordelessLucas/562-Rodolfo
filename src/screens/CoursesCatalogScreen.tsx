import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

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
import type { CourseKind } from '@/src/domain/course';
import { usePublishedCourses } from '@/src/hooks/usePublishedCourses';
import { matchesSearch } from '@/src/services/article.service';
import { colors, radius, space } from '@/src/theme';
import { patientCourseHref } from '@/src/utils/patientCoursesNav';

type CourseFilter = 'todos' | CourseKind;

export function CoursesCatalogScreen() {
  const router = useRouter();
  const { courses, loading, error, refresh, usingLocalMock, demoReason } =
    usePublishedCourses();
  const [queryText, setQueryText] = useState('');
  const [filter, setFilter] = useState<CourseFilter>('todos');

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      if (filter !== 'todos' && course.kind !== filter) {
        return false;
      }
      return matchesSearch(course.title, queryText);
    });
  }, [courses, filter, queryText]);

  return (
    <Container
      edges={['top', 'left', 'right']}
      scroll
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow="Educação"
        title="Cursos e mentorias"
        subtitle="Conteúdos em módulos. Não substituem consulta profissional."
        onBack={() => router.replace('/(paciente)/descobrir' as Href)}
        backLabel="Explorar"
      />

      <Input
        label="Buscar por nome"
        value={queryText}
        onChangeText={setQueryText}
        placeholder="Nome do curso ou mentoria"
        leftIcon="search-outline"
        autoCapitalize="none"
      />

      <SelectableChipGroup>
        <SelectableChip
          label="Todos"
          selected={filter === 'todos'}
          onPress={() => setFilter('todos')}
        />
        <SelectableChip
          label="Cursos"
          selected={filter === 'curso'}
          onPress={() => setFilter('curso')}
        />
        <SelectableChip
          label="Mentorias"
          selected={filter === 'mentoria'}
          onPress={() => setFilter('mentoria')}
        />
      </SelectableChipGroup>

      {error ? <InlineMessage message={error} variant="error" /> : null}

      {usingLocalMock ? (
        <InlineMessage
          message={
            demoReason === 'error'
              ? 'Modo demonstração ativo: o servidor não respondeu; exibindo catálogo local.'
              : 'Modo demonstração ativo: catálogo local (ainda sem cursos publicados no servidor).'
          }
          variant="info"
        />
      ) : null}

      {loading && courses.length === 0 ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator color={colors.primary} />
          <Typography variant="caption" color={colors.textMuted}>
            Carregando catálogo…
          </Typography>
        </View>
      ) : null}

      {!loading && filtered.length === 0 && !error ? (
        <InlineMessage
          message="Nenhum curso encontrado com esses filtros."
          variant="info"
        />
      ) : null}

      {filtered.map((course) => (
        <Pressable
          key={course.id}
          style={({ pressed }) => [
            styles.card,
            pressed ? styles.cardPressed : null,
          ]}
          onPress={() => router.push(patientCourseHref(course.id) as Href)}
          accessibilityRole="button"
          accessibilityLabel={`Abrir ${course.title}`}
        >
          <View style={styles.badge}>
            <Typography variant="caption" color={colors.primary}>
              {course.kind === 'mentoria' ? 'Mentoria' : 'Curso'}
            </Typography>
          </View>
          <Typography variant="h3">{course.title}</Typography>
          <Typography variant="body" color={colors.textMuted} numberOfLines={3}>
            {course.description}
          </Typography>
          <View style={styles.row}>
            <Typography variant="caption" color={colors.primary}>
              Ver módulos
            </Typography>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          </View>
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
    paddingVertical: space[6],
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
