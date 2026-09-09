# Andamento do Projeto — Backend × Frontend

> Documento vivo. Atualizado em **09/09/2026** (check-in unificado + comunidade base).  
> **Não redefine escopo** — só registra o que já foi feito e o que ainda falta.

---

## Visão rápida

| Camada | Progresso estimado | Situação |
|--------|-------------------|----------|
| **Frontend** | ~82% | + Check-in+histórico unificados · **Comunidade base** |
| **Backend** | ~78% | + `communities` / members / posts / comments |
| **Diário / Check-in** | Spec ✅ · MVP ✅ | Form + histórico + filtros na mesma tab |
| **Cursos / mentoria** | Spec ✅ · Base ✅ | URLs mock; sem Storage |
| **Conteúdo singular** | Base ✅ | Notícias / pesquisas / artigos |
| **Comunidade** | Spec ✅ · Base ✅ | Grupos + aprovação; posts/comentários MVP |
| **Diagnóstico inicial** | Spec ✅ · Código 0% | Aguarda fase R3 |
| **Área profissional** | Shell ✅ · vínculos ✅ · cursos ✅ · solicitar comunidade ✅ | |

---

## O que falta implementar (fila atual)

> Itens *gate cliente* não devem ser inventados até confirmação.

### Fila técnica sugerida
- [x] UI vínculos profissional ↔ paciente (back já pronto)
- [ ] **R3** Diagnóstico inicial *(gate: campos oficiais)*
- [ ] **R4** Biblioteca avulsa de vídeos *(gate: hospedagem)* — cursos já usam `videoUrl` mock
- [x] **R6** Comunidade base (grupos + aprovação + posts/comentários) — moderação avançada TBD
- [ ] **R7** Monetização do diário *(gate: modelo)*
- [ ] **R8** features extras do profissional *(gate cliente)*
- [ ] **R9** Voz / tendências / IA *(gate IA)*
- [ ] **R10** Integração / release / LGPD

### Pendências de detalhamento (espelho de `escopo.md`)
- Modelo de monetização do diário
- Campos oficiais do diagnóstico inicial
- Features concretas extras da área profissional
- Hospedagem definitiva de vídeo (Storage/YouTube/Vimeo), moderação, unidades, insights IA, LGPD

---

## Cobertura do escopo

| Bloco | Spec | Código |
|-------|------|--------|
| 1. Estrutura plataforma | ✅ | ✅ parcial (shells ok) |
| 2. Cadastro e perfil | ✅ | ✅ (+ role admin manual) |
| 3. Cursos/mentoria | ✅ | ✅ base (catálogo, módulos, aulas, progresso, aprovação) |
| 4. Vídeos pacientes (biblioteca) | ✅ | ❌ (só aulas em curso) |
| 5. Diagnóstico inicial | ✅ | ❌ |
| 6. Comunidade | ✅ | ✅ base (grupos + feed; moderação TBD) |
| 7. Integração | ✅ | Parcial |
| Diário + monetização | ✅ | Diário MVP ✅ · paywall ❌ |
| Área profissional | ✅ existência | Back + **UI vínculos** ✅ · submissão de cursos ✅ · extras TBD |

---

## BACKEND ✅ recente
- `course.service` + `courseProgress.service` + `article.service`
- Rules/indexes `courses`, `lessonProgress`, `contentArticles` (+ role `admin`) deployados
- Seed mock via admin (cursos + artigos + comunidades; filas pending incluídas)
- Vínculos profissional (anterior)

---

## FRONTEND ✅ recente
- Paciente: **Início** (CTA check-in, semana Seg–Dom, continuar curso/sugestão)
- Paciente: Explorar com **busca + chips** (cursos, mentorias, notícias, pesquisas, artigos)
- Paciente: detalhe de artigo; catálogo de cursos com busca/filtros
- Paciente: Perfil → **Profissionais vinculados**
- Profissional: Meus cursos / criar / enviar aprovação · **Meus pacientes**
- Admin: seed, publicar curso/artigo, fila aprovar/rejeitar (+ histórico do submetente em comunidades)
- Shell `/(admin)`

---

## Ordem (roadmap)

Ver `plano_roadmap.md` e `plano_cursos.md`.  
**R5 base de cursos:** ✅  
**UI vínculos (Sprint 9):** ✅  
**Fila sugerida:** R3 Diagnóstico **ou** R4 biblioteca (ambos com gate) · validação E2E vínculos no Expo Go.
