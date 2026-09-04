# Checklist de Sprints — Aplicativo para Lipedema

> Atualizado em 04/09/2026 — alinhado ao **`plano_roadmap.md`** (fases R0–R10).

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
- [x] Setup Expo SDK 54 + Firebase
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
- [ ] Navegação principal multi-módulo → R1
- [ ] Design System oficial do cliente (quando houver brand kit)

---

## Sprint 2.5 — Auth hardening + polish ✅
- [x] Ver `plano_fase_atual.md`

---

## Sprint 3 — Check-in / Diário (MVP) → Fase R2 ✅
- [x] Domain + `checkin.service` + rules + índice
- [x] UI Check-in + Histórico
- [ ] (Depois) gate monetização → R7

---

## Sprint 4 — Voz + unidades + tendências → Fase R9
- [ ] Unidades, speech, gráficos, insights IA

---

## Sprint 5 — Diagnóstico inicial → Fase R3
- [ ] Questionário, resultado orientativo, disclaimer

---

## Sprint 6 — Conteúdos e vídeos → Fase R4
- [ ] Biblioteca, temas, player, orientação

---

## Sprint 7 — Cursos e mentoria → Fase R5
- [ ] Catálogo, módulos, aulas, progresso

---

## Sprint 8 — Comunidade → Fase R6
- [ ] Posts + comentários

---

## Sprint 9 — Área profissional → Fase R8
- [x] Backend: domain + services de vínculo (`professionalPatientLinks`)
- [x] Rules + indexes deployados (leitura de pacientes/check-ins só com vínculo active)
- [ ] UI profissional: convidar, listar pacientes, ver check-ins
- [ ] UI paciente: aceitar / recusar / revogar convites
- [ ] Demais features após levantamento com o cliente

---

## Sprint 10 — Monetização do diário → Fase R7
- [ ] Modelo + entitlements + paywall

---

## Sprint 11 — Integração → Fase R10
- [ ] Navegação multi-módulo + validação de fluxos

---

## Sprint 12 — Release → Fase R10
- [ ] LGPD, testes Expo Go 54, preview

---

## Fora de escopo até nova confirmação

- Diagnóstico clínico definitivo / prescrição pelo app ou IA
- Telemedicina / prontuário completo
- Health Connect / Apple Health (salvo pedido)
- Copiar marca de apps de referência
