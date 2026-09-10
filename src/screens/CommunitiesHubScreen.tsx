import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import {
  Button,
  CommunityCard,
  Container,
  InlineMessage,
  Input,
  ScreenHeader,
  SelectableChip,
  SelectableChipGroup,
  Typography,
} from '@/src/components';
import { COMMUNITY_TAG_OPTIONS } from '@/src/domain/community';
import { useCommunitiesHub } from '@/src/hooks/useCommunitiesHub';
import { colors, radius, space } from '@/src/theme';

export function CommunitiesHubScreen() {
  const router = useRouter();
  const {
    joined,
    recommendations,
    searchResults,
    searching,
    queryText,
    setQueryText,
    tagFilter,
    setTagFilter,
    filtersOpen,
    setFiltersOpen,
    loading,
    error,
    refresh,
  } = useCommunitiesHub();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const openCommunity = (id: string) => {
    router.push(`/(paciente)/comunidade/${id}` as Href);
  };

  return (
    <Container
      scroll
      edges={['top', 'left', 'right']}
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow="Conexão"
        title="Comunidade"
        subtitle="Seus grupos, indicações e busca por temas do cuidado."
      />

      <Input
        label="Buscar comunidade"
        value={queryText}
        onChangeText={setQueryText}
        placeholder="Nome, descrição ou tema…"
        leftIcon="search-outline"
        autoCapitalize="none"
      />

      <View style={styles.filtersBlock}>
        <View style={styles.filtersHeader}>
          <Typography variant="caption" color={colors.textMuted}>
            Filtre por tema do grupo.
          </Typography>
          <Pressable
            accessibilityRole="button"
            onPress={() => setFiltersOpen((open) => !open)}
            style={({ pressed }) => [
              styles.filterToggle,
              filtersOpen ? styles.filterToggleActive : null,
              pressed ? styles.filterTogglePressed : null,
            ]}
          >
            <Ionicons name="options-outline" size={18} color={colors.primary} />
            <Typography variant="caption" color={colors.primary}>
              Filtrar
            </Typography>
          </Pressable>
        </View>

        {tagFilter !== 'todos' && !filtersOpen ? (
          <Pressable
            onPress={() => setFiltersOpen(true)}
            style={styles.activeFilterHint}
          >
            <Typography variant="caption" color={colors.textMuted}>
              Tema:{' '}
              {COMMUNITY_TAG_OPTIONS.find((item) => item.id === tagFilter)
                ?.label ?? tagFilter}
            </Typography>
            <Typography variant="caption" color={colors.primary}>
              Alterar
            </Typography>
          </Pressable>
        ) : null}

        {filtersOpen ? (
          <View style={styles.filterPanel}>
            <Typography variant="label">Tema</Typography>
            <SelectableChipGroup>
              <SelectableChip
                label="Todos"
                selected={tagFilter === 'todos'}
                onPress={() => setTagFilter('todos')}
              />
              {COMMUNITY_TAG_OPTIONS.map((item) => (
                <SelectableChip
                  key={item.id}
                  label={item.label}
                  selected={tagFilter === item.id}
                  onPress={() => setTagFilter(item.id)}
                />
              ))}
            </SelectableChipGroup>
            <View style={styles.filterActions}>
              <Pressable onPress={() => setTagFilter('todos')} hitSlop={8}>
                <Typography variant="caption" color={colors.textMuted}>
                  Limpar
                </Typography>
              </Pressable>
              <Pressable onPress={() => setFiltersOpen(false)} hitSlop={8}>
                <Typography variant="caption" color={colors.primary}>
                  Pronto
                </Typography>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>

      {error ? <InlineMessage message={error} variant="error" /> : null}

      {loading && joined.length === 0 && recommendations.length === 0 ? (
        <ActivityIndicator color={colors.primary} />
      ) : null}

      {searching ? (
        <View style={styles.section}>
          <Typography variant="h3">Resultados</Typography>
          {searchResults.length === 0 ? (
            <InlineMessage
              message="Nenhuma comunidade com esses filtros."
              variant="info"
            />
          ) : (
            searchResults.map((item) => (
              <CommunityCard
                key={item.id}
                community={item}
                onPress={() => openCommunity(item.id)}
              />
            ))
          )}
        </View>
      ) : (
        <>
          {joined.length > 0 ? (
            <View style={styles.section}>
              <Typography variant="h3">Suas comunidades</Typography>
              {joined.map((item) => (
                <CommunityCard
                  key={item.id}
                  community={item}
                  badge="Membro"
                  onPress={() => openCommunity(item.id)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.section}>
              <Typography variant="h3">Para você</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Sugestões com base no seu uso no app — não são indicação
                clínica.
              </Typography>
              {recommendations.length === 0 && !loading ? (
                <InlineMessage
                  message="Ainda não há comunidades publicadas. Volte em breve."
                  variant="info"
                />
              ) : null}
              {recommendations.map((item) => (
                <CommunityCard
                  key={item.id}
                  community={item}
                  badge="Sugestão"
                  onPress={() => openCommunity(item.id)}
                />
              ))}
            </View>
          )}

          {joined.length > 0 && recommendations.length > 0 ? (
            <View style={styles.section}>
              <Typography variant="h3">Também pode interessar</Typography>
              {recommendations.slice(0, 3).map((item) => (
                <CommunityCard
                  key={item.id}
                  community={item}
                  onPress={() => openCommunity(item.id)}
                />
              ))}
            </View>
          ) : null}
        </>
      )}

      <Button label="Atualizar" variant="outline" onPress={refresh} />
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[4],
    paddingBottom: space[8],
  },
  section: {
    gap: space[3],
  },
  filtersBlock: {
    gap: space[3],
  },
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterToggleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundAccent,
  },
  filterTogglePressed: {
    opacity: 0.9,
  },
  activeFilterHint: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.md,
    backgroundColor: colors.backgroundAccent,
  },
  filterPanel: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
