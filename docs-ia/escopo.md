# Escopo do Projeto — Aplicativo para Lipedema

> Documento vivo. Separar sempre: **confirmado** vs **pendente de detalhamento**.  
> Não implementar funcionalidades sem aprovação da etapa correspondente.

**Última atualização:** 08/09/2026 — status de implementação alinhado ao código (cursos R5, vínculos UI, Expo SDK 57). Escopo de produto inalterado quanto a gates TBD.

---

## Objetivo principal

Criar um aplicativo mobile especializado em **lipedema** que una, em um único ecossistema:

1. **Acompanhamento do paciente** (diário/check-in, histórico, tendências, insights)
2. **Conteúdo educativo** (vídeos, biblioteca, cursos e mentoria)
3. **Diagnóstico inicial** (questionário de sinais/sintomas → avaliação orientativa)
4. **Comunidade** (posts e comentários entre pacientes)
5. **Área para profissionais de saúde** que trabalham com lipedema (**não restrito a médicos**)

Stack atual: **React Native (Expo SDK 57) + Firebase (Auth + Firestore)**.

---

## Perfis de usuário

| Perfil | Status | Descrição |
|--------|--------|-----------|
| **Paciente** | Confirmado | Conta, diário/check-in, conteúdos/vídeos, diagnóstico inicial, comunidade, perfil. |
| **Profissional de saúde** | Confirmado | Qualquer profissional que trabalha com lipedema (não apenas médicos). Área dedicada; **detalhes de features ainda a especificar**. |

> Acesso **individualizado** conforme o perfil após autenticação.

---

## 1. Estrutura inicial da plataforma (confirmado)

| Item | Status | Notas |
|------|--------|-------|
| Acesso inicial ao aplicativo | Confirmado / implementado | Login, sessão, AuthGate |
| Identificação do perfil de acesso | Confirmado / implementado | `role`: `paciente` \| `profissional` \| `admin` (admin manual) |
| Área para profissionais de saúde | Confirmado / parcial | Vínculos + cursos; demais features a detalhar |
| Área para pacientes | Confirmado / parcial | Check-in, cursos; comunidade/diagnóstico/biblioteca ainda não |
| Navegação principal | Confirmado / implementado | Tabs: Início · Check-in (com histórico) · Comunidade · Explorar · Perfil |
| Estrutura inicial da conta | Confirmado / parcial | `users/{uid}` + edição de nome |

---

## 2. Cadastro e perfil (confirmado)

| Item | Status | Notas |
|------|--------|-------|
| Cadastro de paciente | Confirmado / implementado | Auth + Firestore |
| Cadastro de profissional de saúde | Confirmado / implementado | Mesmo fluxo, role `profissional` |
| Dados básicos do perfil | Confirmado / parcial | nome, e-mail, role, createdAt |
| Edição das informações cadastradas | Confirmado / implementado | Nome editável (e-mail/role imutáveis no app) |
| Identificação do tipo de usuário | Confirmado / implementado | role: paciente \| profissional \| admin (admin só manual) |
| Acesso individualizado conforme perfil | Confirmado / implementado | Shells `/(paciente)` · `/(profissional)` · `/(admin)` |

---

## 3. Área de cursos e mentoria (confirmado — detalhe a definir)

| Item | Status |
|------|--------|
| Catálogo inicial de cursos | Confirmado |
| Área de aulas | Confirmado |
| Inclusão de vídeos | Confirmado |
| Organização por módulos | Confirmado |
| Acesso ao conteúdo conforme usuário | Confirmado |
| Registro básico de aulas visualizadas | Confirmado |

**Pendências de detalhe:** modelo de hospedagem definitiva (Storage vs plataforma externa), paywall do curso vs incluso na assinatura.  
**Decisão operacional (app):** admin publica a maior parte; profissional pode submeter para aprovação; paciente só consome `published`.

---

## 4. Conteúdos para pacientes — vídeos e educação (confirmado)

| Item | Status |
|------|--------|
| Biblioteca de vídeos | Confirmado |
| Conteúdos educativos sobre lipedema | Confirmado |
| Organização dos conteúdos por tema | Confirmado |
| Acesso individual aos materiais | Confirmado |
| Área de orientação e informações gerais | Confirmado |
| Visualização em formato simplificado (mobile) | Confirmado |

---

## 5. Diagnóstico inicial (confirmado — campos a detalhar)

| Item | Status |
|------|--------|
| Questionário para pacientes | Confirmado |
| Perguntas sobre principais sinais e sintomas | Confirmado |
| Registro das respostas | Confirmado |
| Processamento das informações preenchidas | Confirmado |
| Exibição de uma avaliação inicial | Confirmado |
| Orientação para buscar avaliação profissional quando aplicável | Confirmado |

**Regras:**
- Avaliação é **orientativa / inicial**, **não substitui** diagnóstico clínico.
- Orientar busca a **profissional de saúde** quando aplicável.
- Perguntas oficiais do questionário: **a validar com o cliente**.

---

## 6. Comunidade (confirmado)

| Item | Status |
|------|--------|
| Área de comunidade | Confirmado / implementado (base) |
| Comunidades/grupos publicados pelo app | Confirmado / implementado |
| Admin cria ou aprova comunidades | Confirmado / implementado |
| Profissional solicita comunidade (pendente aprovação) | Confirmado / implementado |
| Paciente entra e interage (post + comentário) | Confirmado / implementado |
| Publicações de pacientes | Confirmado / implementado |
| Campo para criação de posts | Confirmado / implementado |
| Comentários nas publicações | Confirmado / implementado |
| Visualização das interações | Confirmado / implementado |
| Estrutura básica de participação entre usuários | Confirmado / implementado |

**Objetivo:** pacientes trocarem informações **dentro do próprio app** em comunidades temáticas (postagem + comentário).

**Pendências:** moderação avançada, denúncia, regras de conteúdo sensível, papéis internos no grupo.

---

## 7. Integração e validação (confirmado como princípio)

| Item | Status |
|------|--------|
| Integração entre cadastro, conteúdos, diagnóstico e comunidade | Confirmado (arquitetura) |
| Navegação entre as principais áreas | Confirmado |
| Ajustes de funcionamento | Contínuo |
| Validação dos principais fluxos de usuário | Contínuo |
| Organização para futuras expansões | Confirmado (Clean Arch + docs-ia) |
| Preparação da base para novos módulos | Confirmado |

---

## 8. Diário / Check-in do paciente (confirmado + monetização)

Funcionalidade central de acompanhamento. Referências visuais do cliente detalham o **Check-in diário**.

### Monetização (confirmado como intenção de negócio)
- **Monetizar o diário** para o paciente registrar avaliações e acompanhamento.
- Modelo exato (assinatura, compra única, freemium): **pendente de definição**.
- Até definir o modelo, implementar a **capacidade técnica** do diário; o gate de pagamento é etapa posterior.

### Check-in diário (UX confirmada)

Registrar por data:

| Seção | Conteúdo |
|-------|----------|
| Tratamentos | Multi-seleção + Outros |
| Atividades | Multi-seleção + Outros |
| Dieta e estilo de vida | Opções configuráveis + Outros |
| Suplementos e medicamentos | Multi-seleção + Outros + aviso de segurança |
| Bem-estar | Escalas 1–10: dor, peso, energia, humor |
| Medidas corporais | Bilateral + peso; manual + voz (com revisão) |
| Observações | Texto livre |

**Também confirmados:** navegação por data, histórico, tendências, análise IA como **insights** (não diagnóstico/prescrição), check-in parcial, autosave a definir.

### Navegação paciente (referência)
```text
CHECK-IN | HISTÓRICO | TENDÊNCIAS | ANÁLISE IA
```
(+ acesso a conteúdos, comunidade, diagnóstico e perfil na estrutura geral do app — IA de navegação final a consolidar no design).

---

## Regras de negócio (consolidadas)

1. Dois públicos: **pacientes** e **profissionais de saúde** (amplos, não só médicos).
2. Acesso e navegação **por perfil**.
3. Diário/check-in é o núcleo de acompanhamento do paciente e **será monetizado** (modelo TBD).
4. Conteúdos e **vídeos** para pacientes fazem parte do produto.
5. Cursos e mentoria fazem parte do produto (formato de entrega TBD).
6. Diagnóstico inicial = questionário orientativo, **não** diagnóstico clínico definitivo.
7. Comunidade = posts + comentários entre pacientes.
8. Medicamentos/suplementos no diário = **somente registro**; sem recomendação de dose/uso.
9. IA (quando houver) = insights sobre dados do usuário; **sem** diagnóstico nem prescrição.
10. Não implementar detalhes inventados (listas oficiais, preços, CMS) sem validação.

---

## Modelo de dados (conceitual — evolução)

```text
users/{userId}
  uid, name, email, role, createdAt
  (+ preferências, units, updatedAt — edição de perfil)

dailyCheckins/{checkinId}
  userId, date, treatments[], activities[], lifestyle[]
  supplements[], medications[]
  wellbeing { pain, heaviness, energy, mood }
  measurements { ... bilateral, weight }
  notes, createdAt, updatedAt

# Módulos futuros (estrutura a detalhar na implementação)
courses / modules / lessons / videos
contentLibrary / themes
diagnosticQuestionnaires / responses / results
communityPosts / comments
subscriptions / entitlements   # monetização do diário (TBD)
```

---

## Mapa de cobertura do escopo (cliente × docs)

| Bloco | No escopo? |
|-------|------------|
| 1. Estrutura da plataforma | ✅ |
| 2. Cadastro e perfil | ✅ (edição nome + shells por role implementados) |
| 3. Cursos e mentoria | ✅ |
| 4. Conteúdos/vídeos pacientes | ✅ |
| 5. Diagnóstico inicial | ✅ |
| 6. Comunidade (post + comentário) | ✅ |
| 7. Integração e validação | ✅ |
| Diário/check-in + monetização | ✅ |
| Profissionais amplos (não só médico) | ✅ |

---

## Ainda pendente de detalhamento (não bloqueia constar no escopo)

- [ ] Modelo de monetização do diário (preço, trial, o que é free)
- [ ] Campos oficiais do questionário de diagnóstico inicial
- [ ] Opções oficiais dieta/tratamentos/atividades/suplementos do check-in
- [ ] Features concretas da área do profissional de saúde
- [ ] Hospedagem de vídeo (Storage, YouTube, Vimeo, etc.)
- [ ] Moderação da comunidade
- [ ] Unidades cm/kg vs in/lbs
- [ ] Escopo da 1ª versão de insights IA
- [ ] Políticas LGPD / dados sensíveis

---

## Fora de escopo (até nova confirmação)

- Diagnóstico clínico definitivo ou prescrição pelo app/IA
- Telemedicina / prontuário eletrônico completo
- Apple Health / Google Health Connect (salvo pedido futuro)
- Copiar marca/UI de apps de referência pixel a pixel

---

## Status da implementação (resumo)

| Área | Spec no escopo | Código |
|------|----------------|--------|
| Auth / cadastro / role | ✅ | ✅ |
| Edição de perfil / shells por perfil | ✅ | ✅ |
| Check-in / diário (MVP) | ✅ | ✅ |
| Monetização diário | ✅ (intenção) | ❌ |
| Cursos / mentoria (base) | ✅ | ✅ |
| Vídeos pacientes (biblioteca R4) | ✅ | ❌ |
| Diagnóstico inicial | ✅ | ❌ |
| Comunidade | ✅ | ❌ |
| Área profissional (vínculo) | ✅ | ✅ back + UI |
| Área profissional (features extras) | ✅ existência · detalhe TBD | ❌ |

Detalhes de andamento: `andamento.md` · Sprints: `checklist_sprints.md` · **Roadmap:** `plano_roadmap.md` · Cursos: `plano_cursos.md` · Vínculos: `plano_profissional_backend.md` · Continuidade: `sprint_continuidade_pass.md`.

---

## Status do planejamento

**Roadmap:** R0–R2 ✅ · R5 cursos base ✅ · R8 vínculo (back+UI) ✅ · R3/R4/R6/R7/R9/R10 e extras do profissional aguardam.  
**Implementação atual:** Auth + shells (paciente/profissional/admin) + Check-in + Cursos (consumo, submissão, moderação, demo mock) + vínculos profissional↔paciente (UI).  
**Firestore:** rules/indexes `dailyCheckins`, `professionalPatientLinks`, `courses`, `lessonProgress` (`rodolfo-39b15`).  
**Fila sugerida:** R3 Diagnóstico **ou** R4 biblioteca (gates do cliente).  
**Não inventar:** paywall de curso, Storage, features clínicas extras do profissional, campos oficiais do questionário — ver pendências acima.
