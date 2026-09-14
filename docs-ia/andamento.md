# Andamento do Projeto — Backend × Frontend

> Documento vivo. Atualizado em **14/09/2026** (padrão vídeo externo + UI pass profissional A–D).  
> **Não redefine escopo** — só registra o que já foi feito e o que ainda falta.

---

## Visão rápida

| Camada | Progresso estimado | Situação |
|--------|-------------------|----------|
| **Frontend** | ~88% | + UI pass profissional + vídeo externo |
| **Backend** | ~82% | + policies, likes, replies, memberships CG |
| **Diário / Check-in** | Spec ✅ · MVP ✅ | Form + histórico + filtros na mesma tab |
| **Cursos / mentoria** | Spec ✅ · Base ✅ | **Padrão `videoUrl` externo** (YouTube/https) |
| **Conteúdo singular** | Base ✅ | Notícias / pesquisas / artigos |
| **Comunidade** | Spec ✅ · **v2+** | Hub, posts sociais, policies, entrada com aprovação |
| **Diagnóstico inicial** | Spec ✅ · Código 0% | Aguarda fase R3 |
| **Área profissional** | Shell ✅ · vínculos ✅ · cursos ✅ · comunidade ✅ · **UI pass** ✅ | |

---

## O que falta implementar (fila atual)

> Itens *gate cliente* não devem ser inventados até confirmação.

### Fila técnica sugerida
- [x] UI vínculos profissional ↔ paciente (back já pronto)
- [x] Padrão de mídia externa (`docs-ia/padrao_midia_externa.md`)
- [x] UI pass área profissional (home com resumo, empty states, validação)
- [ ] **Validação E2E** vínculos + cursos + comunidade no dispositivo (`auditoria_profissional_e2e.md`)
- [ ] **R3** Diagnóstico inicial *(gate: campos oficiais)*
- [ ] **R4** Biblioteca avulsa de vídeos *(mesmo padrão de URL externa quando sair do gate)*
- [x] **R6** Comunidade base + **v2** — denúncia/Storage TBD
- [ ] **R7** Monetização do diário *(gate: modelo)*
- [ ] **R8** features clínicas extras do profissional *(gate cliente — chat/prontuário fora)*
- [ ] **R9** Voz / tendências / IA *(gate IA)*
- [ ] **R10** Integração / release / LGPD

### Pendências de detalhamento (espelho de `escopo.md`)
- Modelo de monetização do diário
- Campos oficiais do diagnóstico inicial
- Features concretas extras da área profissional
- Hospedagem definitiva de vídeo (**padrão atual = URL externa**; Storage depois)
- Moderação, unidades, insights IA, LGPD

---

## Cobertura do escopo

| Bloco | Spec | Código |
|-------|------|--------|
| 1. Estrutura plataforma | ✅ | ✅ parcial (shells ok) |
| 2. Cadastro e perfil | ✅ | ✅ (+ role admin manual) |
| 3. Cursos/mentoria | ✅ | ✅ base + validação URL externa |
| 4. Vídeos pacientes (biblioteca) | ✅ | ❌ (só aulas em curso; padrão URL pronto) |
| 5. Diagnóstico inicial | ✅ | ❌ |
| 6. Comunidade | ✅ | ✅ **v2** |
| 7. Integração | ✅ | Parcial |
| Diário + monetização | ✅ | Diário MVP ✅ · paywall ❌ |
| Área profissional | ✅ existência | Vínculos + cursos + comunidade + **UI pass 14/09** |

---

## BACKEND ✅ recente
- `course.service` + `courseProgress.service` + `article.service`
- Rules/indexes `courses`, `lessonProgress`, `contentArticles` (+ role `admin`) deployados
- Seed mock via admin (cursos + artigos + comunidades; filas pending incluídas)
- Vínculos profissional (anterior)

---

## FRONTEND ✅ recente (14/09/2026)
- Padrão vídeo externo: `externalVideoUrl` + `ExternalVideoPanel` / `ExternalVideoUrlField`
- LessonScreen: CTA por provedor (YouTube/Vimeo/externo) + thumbnail YouTube
- Profissional: home com contadores; pacientes/cursos/comunidades polidos
- Validação de URL no editor pro e no admin create

---

## Ordem (roadmap)

Ver `plano_roadmap.md`, `plano_cursos.md` e `padrao_midia_externa.md`.  
**Próximo passo operacional:** rodar checklist em `auditoria_profissional_e2e.md`.
