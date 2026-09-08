# UX Pass — Cursos (paciente / profissional / admin)

> Data: 08/09/2026  
> Papel: UX Specialist (+ atualização Fix Agent)  
> Escopo: shells por papel + fluxos de cursos  
> Modo: pass inicial readonly; blockers P0/P1 corrigidos no código (aguardando smoke device)

---

## Contexto de leitura

| Fonte | Status |
|-------|--------|
| `docs-ia/design_system.md` | Lido — tom calmo/clínico; tokens provisórios |
| `docs-ia/plano_cursos.md` | Lido — C1–C4 base; paciente só `published` |
| `docs-ia/ui_pass_cursos.md` | Nav original; cursos agora sob Explorar (fix pass) |
| Layouts `app/(paciente)`, `app/(profissional)`, `app/(admin)` | Atualizados no fix |

---

## 1. Flow audit (pós-fix)

| ID | Fluxo | Resultado | Notas |
|----|--------|-----------|-------|
| F1 | Login → home por papel | **PASS** | Inalterado |
| F2 | Explorar → catálogo → detalhe → aula → concluir | **PASS** | Continuidade pós-aula (UX-004); rotas `descobrir/cursos/**` |
| F3 | Bottom tabs — cursos **não** roubam tab | **PASS** | 4 tabs; stack aninhado sob Explorar (sem tab oculta) |
| F4 | Tabs visíveis no deep stack | **PASS aceitável (MVP)** | UX-001 aberto; foco permanece em Explorar |
| F5 | Profissional editor / envio | **PASS** | Reidratação + hint envio + bloqueio por status |
| F6 | Admin seed / criar / fila | **PASS** | Preview mínimo na fila (UX-008) |
| F7 | Empty / erro / loading | **PASS** | Empty paciente humano; demo explícito; progresso honesto |

---

## 2. UX issues

Severidade: **P0** bloqueia assinatura UX · **P1** corrige antes do sign-off · **P2** backlog · **P3** nice-to-have

| ID | Sev | Status | Notas |
|----|-----|--------|-------|
| **UX-001** | P2 | Aberto (MVP ok) | Tab bar ainda visível no deep stack; foco Explorar ok após nest |
| **UX-002** | P1 | **Resolvido** | Empty: “Nenhum curso disponível no momento. Volte em breve.” |
| **UX-003** | P2 | **Resolvido (copy/CTA)** | Player externo + “Voltei — marcar…”; in-app player adiado |
| **UX-004** | P1 | **Resolvido** | “Próxima aula” / “Continuar no curso” após concluir |
| **UX-005** | P1 | **Resolvido** | Hint “Salve o rascunho antes de enviar.” |
| **UX-006** | P0 | **Resolvido** | `getCourseDetail` reidrata módulo/aula/URL; save bloqueado até hydrate |
| **UX-007** | P2 | **Resolvido (copy)** | “um módulo e uma aula nesta fase” |
| **UX-008** | P1 | **Resolvido** | “Ver conteúdo” na fila admin |
| **UX-009** | P1 | **Resolvido** | Sem completed local silencioso; erro + copy do hub suavizada |
| **UX-010** | P3 | Aberto | Atualizar lista ainda competindo |
| **UX-011** | P2 | Aberto | Sem barra de progresso visual |
| **UX-012** | P3 | Aberto | Vários `replace` nos backs |
| **UX-013** | P2 | Aberto | Densidade de CTAs no home admin |
| **UX-014** | P2 | **Resolvido (mínimo)** | CTA “Ver meus cursos” após pending_review |
| **UX-015** | P3 | Aberto | Motivo de rejeição sempre visível |

### UX-BLOCKERS

1. ~~UX-006~~ **resolvido**  
2. ~~UX-002~~ **resolvido**  
3. ~~UX-004 + UX-005 + UX-009~~ **resolvidos**

Código dos blockers entregue. Falta **revalidação UX curta no device** para sign-off final.

---

## 3. Acordo — direção de UI

### Veredito: **APROVO COM CONDIÇÕES** (código atendido)

Condições de código:

1. ~~UX-006~~ feito  
2. ~~UX-002~~ feito  
3. ~~UX-004 / UX-009~~ feito  
4. ~~UX-005~~ feito  
5. Cursos fora da tab bar — **ok** (`descobrir/cursos`)  
6. Sem 5ª tab / tom gamificado — **ok**

---

## 4. Checklist de aceite

- [x] **Nav:** 4 tabs; cursos nunca na bottom bar  
- [x] **F2 continuidade** (UX-004)  
- [x] **Empty paciente** sem seed (UX-002)  
- [x] **Progresso** honesto (UX-009)  
- [x] **Profissional** sem overwrite + hint (UX-006/005)  
- [x] **Admin** preview mínimo (UX-008)  
- [ ] Revalidação UX curta no device → sign-off final

---

## 5. Veredito para o coordenador

| Dimensão | Status |
|----------|--------|
| Direção UI/nav | **Aprovada** |
| Sign-off UX final | **Pendente smoke device** |
| Tab bar / cursos | **OK** — sob Explorar |
| Paciente / profissional / admin | **OK** no código |

---

## Histórico

| Data | Evento |
|------|--------|
| 08/09/2026 | Primeiro UX pass (readonly) |
| 08/09/2026 | **Fix Agent:** UX-002, 004, 005, 006, 008, 009 (+ 003/007/014 parciais). Nav: `descobrir/cursos`. |
