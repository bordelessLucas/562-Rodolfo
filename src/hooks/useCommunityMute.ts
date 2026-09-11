import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'community:mutedIds';

async function readMutedIds(): Promise<string[]> {
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

async function writeMutedIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

/**
 * Preferência local de silenciar grupo (MVP sem push/backend).
 */
export function useCommunityMute(communityId: string | undefined) {
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    if (!communityId) {
      setMuted(false);
      setReady(true);
      return;
    }

    setReady(false);
    void readMutedIds().then((ids) => {
      if (!active) {
        return;
      }
      setMuted(ids.includes(communityId));
      setReady(true);
    });

    return () => {
      active = false;
    };
  }, [communityId]);

  const toggleMute = useCallback(async () => {
    if (!communityId) {
      return;
    }

    const ids = await readMutedIds();
    const nextMuted = !ids.includes(communityId);
    const nextIds = nextMuted
      ? [...ids, communityId]
      : ids.filter((id) => id !== communityId);

    await writeMutedIds(nextIds);
    setMuted(nextMuted);
  }, [communityId]);

  return { muted, ready, toggleMute };
}
