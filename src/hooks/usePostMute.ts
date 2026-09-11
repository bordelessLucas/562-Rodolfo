import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'community:mutedPostIds';

function buildKey(communityId: string, postId: string): string {
  return `${communityId}:${postId}`;
}

async function readMutedKeys(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

async function writeMutedKeys(keys: string[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

/**
 * Preferência local de silenciar publicação (MVP sem push/backend).
 */
export function usePostMute(
  communityId: string | undefined,
  postId: string | undefined,
) {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    let active = true;

    if (!communityId || !postId) {
      setMuted(false);
      return;
    }

    const key = buildKey(communityId, postId);
    void readMutedKeys().then((keys) => {
      if (!active) {
        return;
      }
      setMuted(keys.includes(key));
    });

    return () => {
      active = false;
    };
  }, [communityId, postId]);

  const toggleMute = useCallback(async () => {
    if (!communityId || !postId) {
      return;
    }

    const key = buildKey(communityId, postId);
    const keys = await readMutedKeys();
    const nextMuted = !keys.includes(key);
    const nextKeys = nextMuted
      ? [...keys, key]
      : keys.filter((item) => item !== key);

    await writeMutedKeys(nextKeys);
    setMuted(nextMuted);
  }, [communityId, postId]);

  return { muted, toggleMute };
}
