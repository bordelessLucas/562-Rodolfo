import { useCallback, useState } from 'react';

import { useAuth } from '@/src/hooks/useAuth';
import { createCommunityPost } from '@/src/services/community.service';

export function useCommunityPostComposer(communityId: string | undefined) {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = useCallback(async () => {
    if (!user || !profile || !communityId) {
      return null;
    }
    setSaving(true);
    setError('');
    try {
      const post = await createCommunityPost({
        communityId,
        authorId: user.uid,
        authorName: profile.name,
        title,
        summary,
        body,
        imageUrl: imageUrl.trim() || null,
      });
      setTitle('');
      setSummary('');
      setBody('');
      setImageUrl('');
      return post;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível publicar.',
      );
      return null;
    } finally {
      setSaving(false);
    }
  }, [user, profile, communityId, title, summary, body, imageUrl]);

  return {
    title,
    setTitle,
    summary,
    setSummary,
    body,
    setBody,
    imageUrl,
    setImageUrl,
    saving,
    error,
    setError,
    submit,
  };
}
