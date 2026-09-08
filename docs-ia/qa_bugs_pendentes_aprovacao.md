# QA — Bugs (fila aplicada)

> **Data:** 08/09/2026  
> **Estado:** fila BUG-001…014 **aplicada** (BUG-013: skip player in-app — só URL externa)  
> **Não é fila aberta** — histórico da correção. Pendências UX residuais: ver `ux_pass_cursos.md`.

---

## 1. Summary

Fila QA **aprovada para fix completo** e aplicada. Catálogo/detalhe/aula usam mock **somente** com modo demo explícito (`EXPO_PUBLIC_COURSES_DEMO_MODE` / `__DEV__` via `isCoursesDemoMode()`), com banner honesto. Editor profissional reidrata módulo/aula e bloqueia save fora de `draft`/`rejected`. Progresso não marca concluído em falha remota. RoleGate mostra recuperação (retry/sair) se Auth ok e perfil `null`. Stack de cursos aninhado sob **Explorar** (`/(paciente)/descobrir/cursos/**`) — 4 tabs; cursos não são ícone.

---

## 2. Bug list

### BUG-001 — **FIXED**
- **Severity:** high  
- **Area:** cursos  
- **Fix:** `listPublishedCourses()` retorna `{ courses, usedDemoFallback, demoReason }`. Empty Firestore → `[]` (ou mocks só em demo). Catch → throw (ou mocks + `demoReason: 'error'` em demo). Hook propaga erro.

### BUG-002 — **FIXED**
- **Severity:** high  
- **Area:** cursos  
- **Fix:** `getCourseDetail` / `getLesson` — mock só se documento inexistente + demo + ID conhecido. Erros de rede/permissão são rethrow (sem mascarar).

### BUG-003 — **FIXED** (= UX-006)
- **Severity:** high  
- **Area:** profissional / cursos  
- **Fix:** `useProfessionalCourseEditor` carrega `getCourseDetail` e popula módulo/aula/URL; bloqueia save até hidratação; upsert usa IDs reais carregados.

### BUG-004 — **FIXED**
- **Severity:** high  
- **Area:** profissional / cursos  
- **Fix:** Save/submit desabilitados se status ∉ `draft`|`rejected`; copy “Aguardando revisão”.

### BUG-005 — **FIXED**
- **Severity:** high  
- **Area:** cursos / paciente  
- **Fix:** `markCompleted` em falha **não** seta `completed` local; `error` visível na UI.

### BUG-006 — **FIXED**
- **Severity:** high  
- **Area:** auth / nav  
- **Fix:** `RoleGate` — com `user` e sem `profile`: tela de recuperação (mensagem + Tentar novamente + Sair), sem redirect silencioso para `/login`.

### BUG-007 — **FIXED**
- **Severity:** medium  
- **Area:** nav / paciente / cursos  
- **Fix:** Cursos aninhados sob `descobrir` (`app/(paciente)/descobrir/cursos/**`). Tab Explorar permanece focada; removido `Tabs.Screen` oculto de cursos.

### BUG-008 — **FIXED** (= UX-002)
- **Severity:** medium  
- **Area:** cursos / paciente  
- **Fix:** Empty: “Nenhum curso disponível no momento. Volte em breve.” Banner demo sem jargão de seed para paciente.

### BUG-009 — **FIXED**
- **Severity:** medium  
- **Area:** profissional / cursos  
- **Fix:** Após criar rascunho, `router.replace('/(profissional)/cursos/${id}')`.

### BUG-010 — **FIXED**
- **Severity:** medium  
- **Area:** cursos / nav  
- **Fix:** `firstParam` / `normalizeRouteParam`; erro claro se `moduleId` ausente.

### BUG-011 — **FIXED**
- **Severity:** medium  
- **Area:** admin  
- **Fix:** `approveCourse` / `rejectCourse` exigem `pending_review`. Rules: admin só muda status para published/rejected a partir de `pending_review`.

### BUG-012 — **FIXED**
- **Severity:** low  
- **Area:** admin  
- **Fix:** Copy: “Cursos de demonstração carregados: …”

### BUG-013 — **FIXED (copy/CTA; player in-app skipped)**
- **Severity:** low  
- **Area:** cursos / paciente  
- **Fix:** Disclaimer + CTA “Abrir videoaula no app externo” + “Voltei — marcar como concluída”. **Skip:** player in-app / WebView (fora do escopo MVP; sem Storage/SDK de vídeo).

### BUG-014 — **FIXED**
- **Severity:** low  
- **Area:** nav  
- **Fix:** Resolvido com BUG-007 (stack sob Explorar). `vinculos` oculto com `href: null` se presente no grupo de tabs.

---

## 3. Flows validated (pós-fix)

| Flow | Result | Notes |
|------|--------|-------|
| Paciente tabs: Check-in / Histórico / Explorar / Perfil | **Pass (code)** | 4 tabs; cursos sob Explorar |
| Cursos **não** como ícone de tab | **Pass** | Sem `Tabs.Screen` de cursos |
| Explorar → catálogo → detalhe → aula | **Pass** | Rotas `descobrir/cursos/**` + `moduleId` |
| Progresso marcar concluída | **Pass** | Falha remota com erro; sem fake completed |
| Catálogo vazio / erro Firestore | **Pass** | Empty honesto; demo explícito com banner |
| Profissional editor reabrir / status | **Pass** | Reidrata + bloqueio pending |
| Admin review guards + preview | **Pass** | Status guard + Ver conteúdo |
| RoleGate perfil null | **Pass** | Recovery UI |

---

## 4. Demo mode

- Flag: `EXPO_PUBLIC_COURSES_DEMO_MODE=true|false`
- Ausente: em `__DEV__` permite demo; produção sem flag não usa mock silencioso (`src/config/coursesDemo.ts`)
- Preferível para progresso persistente: seed admin no Firestore

---

## 5. Status da fila

**Todos os BUG-001…014 corrigidos ou documentados (BUG-013 skip de player).**  
Nenhuma aprovação adicional pendente nesta fila.
