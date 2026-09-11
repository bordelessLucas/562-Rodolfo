import React, { useMemo } from 'react';

import {
  OptionsPopup,
  type OptionsPopupItem,
} from '@/src/components/OptionsPopup';

export type CommunityOptionsSheetProps = {
  visible: boolean;
  muted: boolean;
  leaving?: boolean;
  leaveLabel: string;
  onClose: () => void;
  onToggleMute: () => void;
  onLeave: () => void;
};

export function CommunityOptionsSheet({
  visible,
  muted,
  leaving = false,
  leaveLabel,
  onClose,
  onToggleMute,
  onLeave,
}: CommunityOptionsSheetProps) {
  const items = useMemo<OptionsPopupItem[]>(
    () => [
      {
        id: 'mute',
        icon: muted ? 'notifications-off-outline' : 'notifications-outline',
        label: muted ? 'Ativar notificações' : 'Silenciar grupo',
        hint: muted
          ? 'Preferência salva neste aparelho.'
          : 'Evita avisos deste grupo neste aparelho.',
        onPress: onToggleMute,
      },
      {
        id: 'leave',
        icon: 'exit-outline',
        label: leaveLabel,
        hint: 'Você pode entrar de novo depois, se o grupo permitir.',
        destructive: true,
        disabled: leaving,
        onPress: onLeave,
      },
    ],
    [leaveLabel, leaving, muted, onLeave, onToggleMute],
  );

  return (
    <OptionsPopup
      visible={visible}
      title="Opções do grupo"
      items={items}
      onClose={onClose}
    />
  );
}
