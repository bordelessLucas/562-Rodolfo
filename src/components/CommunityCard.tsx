import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/src/components/Typography';
import type { Community } from '@/src/domain/community';
import { communityTagLabel } from '@/src/domain/community';
import { colors, radius, space } from '@/src/theme';

type CommunityCardProps = {
  community: Community;
  onPress: () => void;
  badge?: string;
};

export function CommunityCard({
  community,
  onPress,
  badge,
}: CommunityCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.coverWrap}>
        {community.coverUrl ? (
          <Image
            source={{ uri: community.coverUrl }}
            style={styles.cover}
            contentFit="cover"
            transition={220}
          />
        ) : (
          <LinearGradient
            colors={[colors.secondary, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cover}
          />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(26, 43, 38, 0.35)']}
          style={styles.coverShade}
        />
        {badge ? (
          <View style={styles.badge}>
            <Typography variant="caption" color={colors.primary}>
              {badge}
            </Typography>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Typography variant="h3">{community.title}</Typography>
        <Typography variant="body" color={colors.textMuted} numberOfLines={2}>
          {community.description}
        </Typography>
        {community.tags.length > 0 ? (
          <View style={styles.tags}>
            {community.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Typography variant="caption" color={colors.primary}>
                  {communityTagLabel(tag)}
                </Typography>
              </View>
            ))}
          </View>
        ) : null}
        <View style={styles.footer}>
          <Typography variant="caption" color={colors.textMuted}>
            {community.memberCount} membro(s) · {community.createdByName}
          </Typography>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: colors.text,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.995 }],
  },
  coverWrap: {
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: 148,
    backgroundColor: colors.backgroundAccent,
  },
  coverShade: {
    ...StyleSheet.absoluteFill,
  },
  badge: {
    position: 'absolute',
    top: space[3],
    left: space[3],
    paddingHorizontal: space[2],
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  body: {
    gap: space[2],
    padding: space[4],
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
  tag: {
    paddingHorizontal: space[2],
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundAccent,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
  },
});
