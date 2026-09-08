# UI Pass — Cursos (paciente / profissional / admin)

> Data: 08/09/2026  
> Papel: UI Specialist  
> Status: **concluído** (pronto para revisão UX)  
> Escopo: navegação shell + área de cursos com mocks

---

## Nav structure after fix

### Paciente (Tabs)
| Tab | Rota | Visível na bottom bar |
|-----|------|------------------------|
| Check-in | `/(paciente)/checkin` | Sim |
| Histórico | `/(paciente)/historico` | Sim |
| Explorar | `/(paciente)/descobrir` | Sim |
| Perfil | `/(paciente)/perfil` | Sim |
| Vínculos | `/(paciente)/vinculos` | **Não** (`href: null`) |

Fluxo cursos paciente (pós fix BUG-007):

1. Explorar → card **Cursos e mentorias**
2. Catálogo `/(paciente)/descobrir/cursos`
3. Detalhe `/(paciente)/descobrir/cursos/[courseId]`
4. Aula `/(paciente)/descobrir/cursos/[courseId]/aulas/[lessonId]?moduleId=…`
5. Marcar como concluída (Firestore; falha → erro honesto, sem fake completed)

Stack: `app/(paciente)/descobrir/_layout.tsx` + `descobrir/cursos/_layout.tsx`  
Cursos **não** são mais `Tabs.Screen` oculto.

### Profissional (Stack)
- Início `/(profissional)` → Meus cursos / Perfil
- `/(profissional)/cursos` → lista
- `/(profissional)/cursos/novo` | `[courseId]` → editor (rascunho → enviar)
- Perfil `/(profissional)/perfil` (voltar → início)

Stack interno: `app/(profissional)/cursos/_layout.tsx`  
Shell: `app/(profissional)/_layout.tsx` com telas explícitas `index` / `perfil` / `cursos`

### Admin (Stack)
- Início com seed **Carregar cursos de demonstração**
- Fila `/(admin)/revisao`
- Criar/publicar `/(admin)/cursos/novo`
- Perfil com voltar → início

---

## Screens / files changed

| Arquivo | Mudança |
|---------|---------|
| `app/(paciente)/_layout.tsx` | Cursos ocultos da tab bar |
| `app/(paciente)/cursos/_layout.tsx` | Stack de cursos |
| `app/(profissional)/_layout.tsx` | Stack explícito + RoleGate |
| `app/(profissional)/cursos/_layout.tsx` | Stack de cursos |
| `src/components/ScreenHeader.tsx` | Botão Voltar opcional |
| `src/components/SectionCard.tsx` | Accent primary |
| `ExploreHubScreen` | Entrada para cursos + copy |
| `CoursesCatalogScreen` | Back Explorar, mock banner, estados |
| `CourseDetailScreen` | Progresso, SectionCard, back |
| `LessonScreen` | Copy, back, marcar concluída |
| `ProfessionalHomeScreen` | SectionCard + CTAs |
| `ProfessionalCoursesScreen` | Status badge, empty, back |
| `ProfessionalCourseEditorScreen` | Hook (sem Firebase no `.tsx`) |
| `ProfileScreen` | Voltar para profissional/admin |
| `AdminHomeScreen` / `AdminReviewScreen` / `AdminCourseCreateScreen` | Hooks + polish |
| `src/data/mockCourses.ts` | Helpers de domínio + copy educativa |
| `src/services/course.service.ts` | Fallback catálogo/detalhe/aula mock |
| Hooks: `usePublishedCourses`, `useProfessionalCourseEditor`, `useAdminCourseCreate`, `useAdminReview`, `useAdminSeed`, `useLesson`, `useCourseDetail` | Lógica fora da UI |

---

## Visual rules applied

- Tokens de `docs-ia/design_system.md` / `src/theme/tokens.ts` (sage `#1F6B5C`, fundo `#F3F6F4`, surface branca, bordas `#D5E0DB`)
- Tipografia via componentes (`ScreenHeader`, `Typography`) — Literata display / Source Sans 3 body
- Espaçamento `space[]`, radius `md`/`lg` (sem pills em CTAs)
- Feedback via `InlineMessage` (error / success / info)
- Cards de interação com borda DS; pressed → `backgroundAccent`
- Tom PT-BR educativo/profissional (disclaimer: não substitui consulta)

---

## Mocks / seed path (testável hoje)

1. **Modo demo explícito:** `EXPO_PUBLIC_COURSES_DEMO_MODE=true` (ou `__DEV__` se flag ausente) — catálogo/detalhe/aula podem usar mocks locais com banner. Sem modo demo: empty/erro honestos.
2. **Seed admin:** botão **Carregar cursos de demonstração** grava os IDs no Firestore (idempotente). Preferível para progresso persistente.
3. **Marcar concluída:** grava em `lessonProgress`; se falhar, mostra erro (não marca concluído localmente).

---

## Known remaining UI risks

1. Videoaula abre URL externa (`Linking`) — sem player embutido / Storage (copy/CTA honestos).
2. Sem seed/Firestore, catálogo vazio fora do modo demo — progresso só após conteúdo real.
3. Editor profissional: um módulo/aula nesta fase — UI ainda não edita vários módulos.
4. Bottom tabs do paciente continuam visíveis dentro do stack sob Explorar (MVP aceitável).
5. Brand kit oficial ainda provisório — tokens podem mudar com o cliente.
