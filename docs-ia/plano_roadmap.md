# Plano Roadmap — Escopo Completo do Projeto

> **Status:** R0–R2 ✅ · R5 cursos ✅ · R8 vínculo (back+UI) ✅ — atualizado **08/09/2026**  
> **Próxima fase sugerida:** R3 Diagnóstico **ou** R4 biblioteca (gates do cliente)  
> **Cursos:** `plano_cursos.md` (URLs mock; sem Storage)  
> **Vínculos:** `plano_profissional_backend.md` + `sprint_continuidade_pass.md`  
> **SDK:** Expo 57

---

## 1. Onde estamos

| Já feito | Ainda não |
|----------|-----------|
| Auth, cadastro, sessão, rules `users` (+ admin manual) | R3 diagnóstico *(gate: campos)* |
| Shells paciente/profissional/admin + edição de perfil | R4 biblioteca avulsa *(gate: hospedagem)* |
| Check-in MVP + histórico | Monetização diário (modelo TBD) |
| **Cursos base (R5):** catálogo, módulos, aulas, progresso, aprovação | R6 comunidade; R9 voz/IA; R10 release |
| **Vínculos (R8 mín.):** convite, aceite, check-ins RO | Features extras do profissional (gate) |
| UI Login/Cadastro polida | Paywall de curso; Storage definitivo |

**Princípio de execução**
1. Entregar **valor em fatias** (módulo usável).
2. Em cada módulo: **back (service + rules + domain) → front (telas) → docs**.
3. Não bloquear o diário MVP esperando monetização — gate de pagamento em fase própria.
4. Decisões de cliente (preço, CMS vídeo, campos do questionário, features do profissional) = **gates** documentados; se faltar resposta, usar **placeholder seguro** aprovado.

---

## 2. Visão das fases (ordem recomendada)

```text
R0 ─── concluído ✅
  │
R1 ─── shells por perfil + edição de conta ✅
  │
R2 ─── Diário / Check-in MVP + Histórico ✅
  │
R3 ─── Diagnóstico inicial ← sugerida (gate campos)
  │
R4 ─── Conteúdos e vídeos para pacientes ← alternativa (gate hospedagem)
  │
R5 ─── Cursos e mentoria ✅ (base; paywall/Storage TBD)
  │
R6 ─── Comunidade (posts + comentários)
  │
R7 ─── Monetização do diário
  │
R8 ─── Área do profissional ✅ vínculo mín. · extras TBD
  │
R9 ─── Tendências + voz + insights IA (evolução do diário)
  │
R10 ── Integração, validação de fluxos, polimento, release
```

**Por que esta ordem?**
- **R1** fecha o bloco 1–2 do escopo (estrutura + perfil) e desbloqueia nav multi-módulo.
- **R2** é o núcleo de negócio do paciente (e base da monetização depois).
- **R3** completa o funil “conhecer → avaliar → acompanhar”.
- **R4/R5** entregam educação (vídeos/cursos) — dependem de decisão de hospedagem.
- **R6** comunidade depois que há usuários autenticados e navegação estável.
- **R7** monetização quando o diário já prova valor.
- **R8** profissional quando o cliente detalhar a área (evitar inventar).
- **R9** enriquece o diário (tendências/voz/IA).
- **R10** amarra tudo.

---

## 3. Detalhamento por fase

### Fase R0 — Concluída ✅
Auth, Firebase, UI base, polish, Memory Bank, escopo completo documentado.

---

### Fase R1 — Estrutura da plataforma + conta ✅

**Objetivo:** acesso individualizado por perfil + conta editável + navegação base. **Entregue.**

#### Backend
| # | Entrega |
|---|---------|
| R1.B1 | Expandir `UserProfile` (`updatedAt`; campos editáveis: name; opcional telefone/especialidade placeholder) |
| R1.B2 | `user.service`: `updateUserProfile` |
| R1.B3 | Ajustar Firestore rules (`update` de nome — role/email imutáveis como hoje) |
| R1.B4 | Deploy rules se necessário (`rodolfo-39b15`) |

#### Frontend
| # | Entrega |
|---|---------|
| R1.F1 | Rotas/shells: grupo **paciente** vs **profissional** (Expo Router) |
| R1.F2 | Paciente: tabs placeholder (Check-in, Conteúdos, Comunidade, Perfil) — telas stub honestas |
| R1.F3 | Profissional: home/shell stub (“área em construção” + logout) |
| R1.F4 | Tela **Perfil**: ver dados + editar nome + logout |
| R1.F5 | Redirect pós-login conforme `role` |

#### Docs
Atualizar `andamento.md`, `checklist_sprints.md`, este plano.

#### Critérios de aceite
- [ ] Paciente loga → shell paciente  
- [ ] Profissional loga → shell profissional  
- [ ] Editar nome → persiste e reflete na UI  
- [ ] Sem Check-in real ainda (stub ok)

**Fora de R1:** CRUD check-in, vídeos, comunidade real, paywall.

---

### Fase R2 — Diário / Check-in MVP + Histórico

**Objetivo:** paciente registra e revisita check-ins por data.

#### Backend
- Domain check-in + `checkin.service` (get/upsert por `userId`+`date`)
- Collection `dailyCheckins` + rules (só dono) + índice composto
- Opções padrão iniciais (tratamentos/atividades/etc.) em constants — listas editáveis depois

#### Frontend
- `SectionCard`, `WellbeingScale`, reuso `SelectableChip` (+ Outros)
- Tela Check-in (data, seções, parcial, save)
- Histórico (lista + detalhe/editar via check-in)
- Tab Check-in/Histórico ativas; outras tabs ainda stub se necessário

#### Docs + aceite
Fluxo criar/editar/listar no Expo Go; rules deployadas.

**Fora de R2:** voz, gráficos, paywall, IA.

---

### Fase R3 — Diagnóstico inicial

**Gate cliente:** lista oficial de perguntas (se não houver, usar questionário **placeholder** aprovado + disclaimer).

#### Backend
- `diagnostic.service` — questionário, respostas, resultado orientativo (regras simples/score)

#### Frontend
- Fluxo questionário → resultado → “busque um profissional de saúde quando aplicável”
- Disclaimer obrigatório

---

### Fase R4 — Conteúdos e vídeos (pacientes)

**Gate cliente:** onde hospedar vídeo (Firebase Storage / YouTube / Vimeo).

#### Backend
- Modelos `contents` / temas; URLs ou refs de mídia
- Rules de leitura (paciente autenticado; depois entitlement se houver)

#### Frontend
- Biblioteca por tema, player/visualização simples, área de orientação

---

### Fase R5 — Cursos e mentoria

#### Entregue (base)
- `courses` → `modules` → `lessons`; `lessonProgress`
- Paciente consome published; profissional submete; admin publica/aprova
- Vídeo via `videoUrl` mock (sem Storage)

#### Pendente
- Paywall (TBD); upload Storage quando houver; refinamentos de CMS

**Dependência mídia:** compartilhada com R4 — padrão URL já validado nas aulas.

---

### Fase R6 — Comunidade

#### Backend
- `posts` + `comments`; rules (autor edita/apaga o próprio; leitura autenticada paciente)

#### Frontend
- Feed, criar post, comentários, empty states

**Gate:** regras de moderação mínimas (mesmo que v1 = denúncia depois).

---

### Fase R7 — Monetização do diário

**Gate cliente:** modelo (assinatura / compra / freemium) e o que é free.

#### Backend
- Entitlements / status de assinatura (Firestore + eventualmente RevenueCat/Stripe — decidir)

#### Frontend
- Paywall; liberar check-in completo conforme plano

---

### Fase R8 — Área do profissional de saúde

**Gate cliente:** features concretas além do vínculo (conteúdo only? mais ações clínicas? etc.).

#### Já entregue
- Vínculo profissional ↔ paciente (convite por e-mail, aceite, leitura de check-ins)
- Services + rules + indexes — ver `plano_profissional_backend.md`
- **UI:** Meus pacientes (pro) + Profissionais vinculados (paciente) — ver `sprint_continuidade_pass.md`
- Submissão de cursos pelo profissional + moderação admin (R5)

#### Pendente nesta fase
- Só expandir outras features **confirmadas** pelo cliente (não inventar)

---

### Fase R9 — Evolução do diário (voz, tendências, IA)

- Unidades + speech-to-text com revisão
- Gráficos / filtros
- Insights IA (não diagnóstico)

---

### Fase R10 — Integração e release

- Navegação entre todos os módulos
- Testes dos fluxos principais
- LGPD / disclaimers
- Preview / checklist release
- Congelar MVP e backlog

---

## 4. Gates de decisão (cliente / produto)

| Gate | Bloqueia | Se atrasar |
|------|----------|------------|
| G1 — Perguntas do diagnóstico | R3 “oficial” | Placeholder + disclaimer |
| G2 — Hospedagem de vídeo | R4/R5 “final” | URLs mock / YouTube unlisted |
| G3 — Modelo de monetização | R7 | Diário free em R2 |
| G4 — Features do profissional | R8 completo | Vínculo back+UI ✅ · extras TBD |
| G5 — Moderação comunidade | R6 produção | MVP só posts/comentários + report depois |

---

## 5. Como vamos trabalhar daqui pra frente

1. Você **aprova a fase** (ex.: R1).  
2. Eu descrevo arquivos a criar/editar (se o `.cursorrules` exigir detalhe fino) e implemento.  
3. Você valida no Expo Go.  
4. Atualizo `andamento.md` / checklist / escopo (status).  
5. Só então proponho a **próxima** fase.

**Não** iniciar R2–R10 em paralelo sem aprovação.

---

## 6. Pedido de aprovação

Responda com:

1. **Aprovar R1** — começar shells + edição de perfil (recomendado)  
2. **Aprovar R1 + R2** — plataforma + check-in MVP em sequência  
3. **Ajustar ordem** — diga se prefere Check-in antes dos shells, ou conteúdos antes do diagnóstico, etc.  
4. **Pausar** — só docs, sem código

**Nenhum código desta roadmap será escrito até sua resposta.**
