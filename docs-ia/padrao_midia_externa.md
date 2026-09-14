# Padrão de mídia externa (vídeo)

> **Status:** ativo (MVP)  
> **Data:** 14/09/2026  
> **Premissa:** até o plano de Storage/banco de mídia ser atualizado, **não** guardamos o arquivo do vídeo no Firebase Storage.

---

## Contrato atual

| Campo | Onde | Tipo | Regra |
|-------|------|------|--------|
| `videoUrl` | `courses/{id}/modules/{mid}/lessons/{lid}` | `string \| null` | URL `http`/`https` absoluta |

### Provedores aceitos
1. **YouTube** (`youtube.com`, `youtu.be`, Shorts, embed)
2. **Vimeo** (`vimeo.com`, `player.vimeo.com`)
3. **Link https genérico** (mp4 público, landing, etc.)

### O que **não** fazemos nesta fase
- Upload de arquivo de vídeo para Storage
- Player embutido nativo (WebView / expo-av obrigatório)
- CDN própria / transcoding

---

## Código de referência

| Peça | Caminho |
|------|---------|
| Parse / validação | `src/utils/externalVideoUrl.ts` |
| Campo de formulário | `src/components/ExternalVideoUrlField.tsx` |
| Painel na aula (paciente) | `src/components/ExternalVideoPanel.tsx` |
| Editor profissional | `useProfessionalCourseEditor` + `ProfessionalCourseEditorScreen` |
| Admin publicar | `useAdminCourseCreate` + `AdminCourseCreateScreen` |

### Comportamento na UI
- **Salvar / publicar:** bloqueia URL vazia ou inválida.
- **Aula do paciente:** CTA “Assistir no YouTube / Vimeo / Abrir vídeo externo” via `Linking.openURL`.
- **YouTube:** tenta thumbnail `i.ytimg.com` quando o id é detectável.
- Sem URL: empty state honesto (sem crash).

---

## Quando o plano de Storage/DB for atualizado

Migração sugerida (não implementar agora):

1. Manter `videoUrl` para links externos **ou**
2. Adicionar `videoStoragePath` / `videoProvider: 'external' | 'storage'`
3. Player interno só quando `videoProvider === 'storage'`
4. Seed/admin passam a escolher provedor

O schema atual **já** é compatível com links externos; a evolução deve ser aditiva.

---

## Critérios de aceite deste padrão

- [x] Util de validação sem Firebase na UI
- [x] Editor pro + admin com hint e validação
- [x] LessonScreen abre link externo com rótulo por provedor
- [x] Docs neste arquivo
- [ ] Validação E2E no dispositivo (ver `auditoria_profissional_e2e.md`)
