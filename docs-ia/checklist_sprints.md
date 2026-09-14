# Checklist de Sprints — Aplicativo para Lipedema

> Atualizado em 08/09/2026 — alinhado ao **`plano_roadmap.md`** (fases R0–R10).

---

## Mapa Sprint ↔ Fase roadmap

| Sprint | Fase | Foco |
|--------|------|------|
| 0–2.5 | R0 ✅ | Fundação, auth, polish |
| 1 (restante) + nav | **R1** | Shells + edição perfil |
| 3 | R2 | Check-in + histórico |
| 5 | R3 | Diagnóstico inicial |
| 6–7 | R4–R5 | Vídeos / cursos |
| 8 | R6 | Comunidade |
| 10 | R7 | Monetização diário |
| 9 | R8 | Profissional de saúde |
| 4 (+ IA) | R9 | Voz, tendências, insights |
| 11–12 | R10 | Integração / release |

---

## Sprint 0 — Fundação
- [x] Setup Expo SDK 57 + Firebase
- [x] Memory Bank inicial
- [x] Escopo completo consolidado em `escopo.md`
- [x] Roadmap em `plano_roadmap.md`
- [ ] Validar com o cliente: monetização + campos do questionário + hospedagem de vídeo

---

## Sprint 1 — Autenticação e perfis ✅ (parcial)
- [x] `users/{uid}` + role paciente | profissional
- [x] Login, cadastro, logout, reset senha
- [x] AuthContext + rotas por sessão
- [x] Firestore rules `users`
- [x] Shells separados por perfil → **Fase R1** ✅
- [x] Edição de dados cadastrais → **Fase R1** ✅

---

## Sprint 2 — UI base + polish Auth ✅
- [x] Tokens + Button, Input, Typography, Container
- [x] SelectableChip + InlineMessage
- [x] Login / Cadastro / Home polidos (Sprint 2.5)
- [x] SectionCard, WellbeingScale, DateNavigator, ScreenHeader (polish UI)
- [x] Navegação principal por perfil (tabs paciente + stacks profissional/admin) → R1
- [ ] Design System oficial do cliente (quando houver brand kit)

---

## Sprint 2.5 — Auth hardening + polish ✅
- [x] Ver `plano_fase_atual.md`

---

## Sprint 3 — Check-in / Diário (MVP) → Fase R2 ✅
- [x] Domain + `checkin.service` + rules + índice
- [x] UI Check-in + Histórico
- [x] Check-in unificado: form + histórico + filtros + minimizar após salvar
- [ ] (Depois) gate monetização → R7

---

## Sprint 4 — Voz + unidades + tendências → Fase R9
- [ ] Unidades, speech, gráficos, insights IA

---

## Sprint 5 — Diagnóstico inicial → Fase R3
- [ ] Questionário, resultado orientativo, disclaimer

---

## Sprint 6 — Conteúdos e vídeos → Fase R4
- [ ] Biblioteca avulsa por tema, player, orientação
- [x] Padrão de `videoUrl` **externo** (YouTube/Vimeo/https) em aulas de curso — ver `padrao_midia_externa.md`

---

## Sprint 7 — Cursos e mentoria → Fase R5
- [x] Domain + services (`courses` / modules / lessons / progress)
- [x] Rules + indexes deployados
- [x] Catálogo paciente + progresso de aulas
- [x] Submissão profissional + aprovação admin
- [x] Seed mock + docs (`plano_cursos.md`, `seed_cursos_mock.md`)
- [x] Home paciente: CTA check-in + semana 7 dias + continuar/sugerir
- [x] Explorar: busca por nome + filtros (curso/mentoria/notícia/pesquisa/artigo)
- [x] Conteúdo singular: `contentArticles` (notícia/pesquisa/artigo) + admin publicar
- [x] Validação de URL externa no editor pro + admin + LessonScreen
- [ ] Paywall de curso (TBD no escopo)
- [ ] Upload Storage (quando houver bucket) — padrão atual é link externo

---

## Sprint 8 — Comunidade → Fase R6
- [x] Model `communities` + members + posts + comments
- [x] Admin cria/publica; profissional solicita; paciente entra e interage
- [x] Tab Comunidade (substitui Histórico na bottom bar)
- [x] UI solicitação profissional (status / empty / Input DS)
- [ ] Moderação / denúncia / regras sensíveis (TBD)

---

## Sprint 9 — Área profissional → Fase R8
- [x] Backend: domain + services de vínculo (`professionalPatientLinks`)
- [x] Rules + indexes deployados (leitura de pacientes/check-ins só com vínculo active)
- [x] UI profissional: convidar, listar pacientes, ver check-ins
- [x] UI paciente: aceitar / recusar / revogar convites
- [x] UI pass: home com resumo, empty states, confirmação ao encerrar vínculo
- [x] Checklist E2E documentado (`auditoria_profissional_e2e.md`)
- [ ] Executar E2E no dispositivo e marcar itens
- [ ] Demais features clínicas após levantamento com o cliente
---

## Sprint 10 — Monetização do diário → Fase R7
- [ ] Modelo + entitlements + paywall

---

## Sprint 11 — Integração → Fase R10
- [ ] Navegação multi-módulo + validação de fluxos

---

## Sprint 12 — Release → Fase R10
- [ ] LGPD, testes Expo Go 57, preview

---

## Fora de escopo até nova confirmação

- Diagnóstico clínico definitivo / prescrição pelo app ou IA
- Telemedicina / prontuário completo
- Health Connect / Apple Health (salvo pedido)
- Copiar marca de apps de referência
