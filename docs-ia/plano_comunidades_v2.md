# Plano — Comunidades v2 (hub, posts ricos, privacidade, UX)

> Spec de produto + implementação.  
> Escrita em **10/09/2026** a partir do pedido de base robusta (hoje: MVP simples).  
> **Não substitui** `escopo.md` — detalha o bloco Comunidade.  
> Implementação em **2 sprints**: (A) modelo + fluxos, (B) design/UX polish.

---

## 1. Visão

Transformar a aba Comunidade de um catálogo plano com posts texto-livre em uma experiência moderna de **grupos temáticos**:

1. **Hub** — “minhas comunidades” ou indicações se vazia; busca e filtros.  
2. **Detalhe do grupo** — capa, criador, cards das últimas publicações.  
3. **Publicação** — título, resumo, imagem opcional; detalhe com leitura completa, like e comentários com resposta.  
4. **Privacidade** — quem pode publicar / comentar (todos os membros, só dono, só profissionais de saúde).

Tom visual: alinhado ao design system (sage clínico, Literata + Source Sans 3) — clean, acolhedor, sem poluição de dashboard.

---

## 2. Fluxos de usuário (refinados)

### 2.1 Hub — `/(paciente)/comunidade`

```
[Entrar na aba]
        │
        ├─ Tem ≥1 membership?
        │     SIM → Seção "Suas comunidades" (cards)
        │     NÃO → Seção "Para você" (indicações)
        │
        └─ Sempre disponível:
              · Busca por nome/descrição
              · Filtros (tags / escopo)
              · CTA "Explorar todas" (catálogo published)
```

**Estados**

| Estado | UI |
|--------|-----|
| Loading | Skeleton / spinner |
| Membro de grupos | Lista “Suas comunidades” + busca/filtros no topo |
| Sem grupos | Empty state curto + recomendações (não catálogo frio) |
| Busca ativa | Resultados filtrados (independente de membership) |
| Erro | InlineMessage + retry |

**Busca**

- Campo único: nome e descrição (client-side no MVP se volume baixo; query Firestore se crescer).
- Placeholder: “Buscar comunidade…”

**Filtros (escopo lipedema / app)**

Chips (multi ou single — Sprint A: single “tipo” + “Todos”):

| Id | Label | Uso |
|----|--------|-----|
| `todos` | Todos | Sem filtro de tag |
| `rotina` | Rotina e cuidados | Compressão, dia a dia |
| `movimento` | Movimento | Caminhada, exercícios seguros |
| `alimentacao` | Alimentação | Nutrição / bem-estar |
| `apoio` | Apoio emocional | Rede de suporte |
| `noticias` | Notícias e pesquisa | Conteúdo científico/educativo |
| `profissionais` | Com profissionais | Grupos com política voltada a pros |

Tags ficam no documento da comunidade (`tags: string[]`).

**Indicações (“Para você”)** quando o usuário **não** participa de nenhuma:

Ordem de sinais (melhor esforço, sem inventar diagnóstico):

1. Sobreposição de `tags` com opções frequentes do **check-in** (`treatments`, `activities`, `lifestyle`).  
2. Comunidades com mais `memberCount` (sociais).  
3. Comunidades criadas por **profissional** (confiança).  
4. Fallback: as N mais recentes `published`.

Disclaimer opcional no empty: “Sugestões com base no seu perfil de uso no app — não são indicação clínica.”

---

### 2.2 Detalhe da comunidade — `/(paciente)/comunidade/[communityId]`

Layout (topo → baixo):

1. **Capa** (`coverUrl`) — full-bleed / hero suave (placeholder sage se null).  
2. **Bloco de identidade**  
   - Título  
   - Tags chips  
   - Descrição  
   - Criador: nome + papel (Admin / Profissional)  
   - Contagem de membros  
   - Políticas resumidas (“Quem pode publicar: …”)  
3. **Ação** — Entrar / Sair (paciente). Dono/admin: atalho futuro de editar (fora do Sprint A se não couber).  
4. **Últimas publicações** — cards (não texto completo):  
   - Título  
   - Resumo (2–3 linhas)  
   - Thumb da imagem se houver  
   - Autor · data · likes · nº comentários  
5. **FAB / botão** “Nova publicação” — só se membro **e** política permitir.

Não-membro: vê capa + info + CTA Entrar; **não** vê feed completo (mantém regra atual de privacidade do grupo). Após entrar, carrega posts.

---

### 2.3 Composer de publicação

Campos:

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| `title` | Sim | Curto, máx. ~80 chars |
| `summary` | Sim | Resumo do card, máx. ~160 chars |
| `body` | Sim | Texto completo da leitura |
| `imageUrl` | Não | URL externa no Sprint A; Storage em fase futura |

Validação: bloquear se política da comunidade não permitir o autor.

Após sucesso → volta ao detalhe (ou abre o post).

---

### 2.4 Detalhe do post — `/(paciente)/comunidade/[communityId]/posts/[postId]`

1. Imagem (se houver)  
2. Título + autor + data  
3. Corpo completo  
4. **Like** (toggle) + contador  
5. **Comentários** em thread:  
   - Comentário raiz  
   - Respostas (`parentCommentId`) indentadas  
   - Campo “Responder” por comentário  
6. Composer de comentário (se política permitir)

---

### 2.5 Privacidade / políticas do grupo

Definidas na **criação/edição** da comunidade (admin publica; profissional solicita — admin pode ajustar na aprovação no futuro).

Dois eixos independentes:

#### Quem pode **publicar** (`postPolicy`)

| Valor | Significado |
|-------|-------------|
| `members` | Qualquer membro |
| `owner` | Só o dono (`createdBy`) |
| `professionals` | Só membros com role `profissional` (e dono/admin) |

#### Quem pode **comentar** (`commentPolicy`)

| Valor | Significado |
|-------|-------------|
| `members` | Qualquer membro |
| `owner` | Só o dono |
| `professionals` | Só profissionais (e dono/admin) |

**Interpretação do pedido do usuário**

> “todos usuários ou todos ou somente dono do grupo, ou somente profissionais da saúde”

Mapeamento adotado:

- “Todos (membros)” → `members` (só quem entrou no grupo; não visitantes anônimos).  
- “Somente dono” → `owner`.  
- “Somente profissionais de saúde” → `professionals`.

Visitantes não membros **nunca** postam/comentam (regra base).

Enforcement: **Firestore rules** + checagem no service (fail-fast na UI).

---

### 2.6 Admin / profissional (impacto nesta sprint)

| Ação | Mudança |
|------|---------|
| Criar / solicitar comunidade | + `coverUrl` (URL), `tags[]`, `postPolicy`, `commentPolicy` |
| Seed | Capas placeholder URL, tags, políticas variadas, posts demo ricos |
| Fila de aprovação | Continua; exibir políticas no card (resumo) |

---

## 3. Modelo de dados (Firestore)

### 3.1 `communities/{communityId}`

Campos atuais + novos:

```
coverUrl: string | null
tags: string[]                 // ex.: ['rotina','movimento']
postPolicy: 'members' | 'owner' | 'professionals'
commentPolicy: 'members' | 'owner' | 'professionals'
```

Defaults para docs antigos (mapper):

- `coverUrl: null`  
- `tags: []`  
- `postPolicy: 'members'`  
- `commentPolicy: 'members'`

### 3.2 `communities/{id}/members/{userId}`

Sem mudança estrutural. Opcional Sprint A+: espelho em `users/{uid}/communityMemberships/{communityId}` para hub mais barato — **preferência Sprint A:** collection group query `members` where `userId == uid`.

### 3.3 `communities/{id}/posts/{postId}`

```
title: string
summary: string
body: string
imageUrl: string | null
authorId, authorName
likeCount: number
commentCount: number
createdAt, updatedAt
```

### 3.4 `communities/{id}/posts/{postId}/likes/{userId}`

```
userId: string
createdAt: timestamp
```

Toggle like atualiza `likeCount` em batch.

### 3.5 `communities/{id}/posts/{postId}/comments/{commentId}`

```
parentCommentId: string | null   // null = raiz
authorId, authorName
body: string
createdAt
```

Profundidade: 1 nível de resposta (raiz → reply). Responder a reply anexa ao mesmo raiz (evita árvore infinita no MVP).

---

## 4. Regras e indexes

### Rules (essência)

- Post create: membro + autor self + campos válidos + `canPost(community, user)`.  
- Comment create: idem + `canComment` + `parentCommentId` null ou existe no mesmo post.  
- Like create/delete: membro + self.  
- Read posts/comments/likes: published + (membro \| admin) — igual espírito atual.  
- `canPost` / `canComment`:  
  - `members` → qualquer membro  
  - `owner` → `createdBy == auth.uid` (admin bypass)  
  - `professionals` → profile.role == profissional \| owner \| admin  

### Indexes

- Collection group `members`: `userId` ASC + `joinedAt` DESC (ou só `userId`).  
- Posts: já por subcollection `orderBy createdAt`.  
- Comunidades: se filtrar por tag no server — `status` + `tags` (array-contains) + `publishedAt` (avaliar custo; MVP pode filtrar tags client-side na lista published).

---

## 5. Arquitetura de código (Clean Arch)

| Camada | Responsabilidade |
|--------|------------------|
| `domain/community.ts` | Tipos, labels de policy/tags, helpers `canUserPost` |
| `services/community.service.ts` | Firestore (sem UI) |
| `services/communityRecommendation.service.ts` | Scoring indicações |
| Hooks | Estado + orquestração |
| Screens / components “burros” | Apresentação |

**Sem Firebase nas telas.**

### Telas / rotas novas ou reescritas

| Rota | Screen |
|------|--------|
| `comunidade/index` | `CommunitiesHubScreen` (reescrita) |
| `comunidade/[communityId]` | `CommunityDetailScreen` (reescrita) |
| `comunidade/[communityId]/posts/[postId]` | `CommunityPostDetailScreen` (**nova**) |
| Composer | Modal ou screen `CommunityPostComposer` |

### Componentes UI novos (Sprint A base + Sprint B polish)

- `CommunityCard`  
- `CommunityCover`  
- `PostCard`  
- `CommentThread`  
- `CommunityPolicyBadge`  
- `CommunitySearchBar` / filtro chips (padrão Explorar)

---

## 6. Mídia (imagem)

**Sprint A:** `coverUrl` / `imageUrl` como **URL string** (https), com placeholders se vazio.  
**Fora desta fase (gate Storage):** upload Firebase Storage + `expo-image-picker`.

Motivo: app ainda não tem Storage rules/client; não bloquear a sprint de produto.

---

## 7. Sprints

### Sprint A — Implementação funcional (grande)

Objetivo: fluxos completos e utilizáveis.

Checklist:

- [x] Domínio + mapper + defaults  
- [x] Service: memberships do usuário, search/filter local, posts ricos, likes, replies, policies  
- [x] Recommendation service (check-in + tags + popularidade)  
- [x] Rules + indexes + deploy  
- [x] Hub (minhas / indicações / busca / filtros)  
- [x] Detalhe comunidade (capa, criador, cards)  
- [x] Composer (título, resumo, body, imageUrl)  
- [x] Detalhe post (like, comentários + resposta)  
- [x] Admin/pro forms: tags, policies, coverUrl  
- [x] Seed demo enriquecido  
- [x] Docs `andamento` / este arquivo  
- [x] Typecheck

### Sprint B — Design & UX polish

Objetivo: “clean e bonito como apps modernos de comunidade”.

Checklist:

- [x] Hierarquia visual da capa (gradiente/overlay leve no título)  
- [x] Cards com tipografia, spacing e thumb consistentes  
- [x] Empty states / copy acolhedora  
- [x] Microinterações (like, press scale, image transition)  
- [x] Filtros no padrão Filtrar recolhido (Explorar/Check-in)  
- [x] Pass visual em `docs-ia/ux_pass_comunidades.md`  
- [ ] Validação humana no Expo Go  

---

## 8. Critérios de aceite (produto)

1. Usuário sem comunidades vê **indicações**, não só lista fria.  
2. Usuário com memberships vê **Suas comunidades** primeiro.  
3. Busca e filtro por tag funcionam no hub.  
4. Detalhe mostra capa (ou placeholder), criador e cards de posts.  
5. Post tem título, resumo, body; imagem opcional.  
6. Like e comentário com resposta funcionam para quem a política permite.  
7. Política `owner` / `professionals` bloqueia UI + rules.  
8. Sprint B deixa a aba visualmente alinhada a um feed moderno sem perder o tom clínico do app.

---

## 9. Fora de escopo (agora)

- Denúncia / moderação avançada de conteúdo  
- Upload Storage nativo  
- Notificações push de resposta/like  
- Papéis internos (moderador do grupo) além de dono  
- Chat 1:1  
- Feed global cross-comunidades  

---

## 10. Ordem de execução sugerida (Sprint A)

1. Domínio + rules/indexes  
2. Service + recommendations  
3. Hub  
4. Detalhe comunidade + composer  
5. Detalhe post (like + thread)  
6. Admin/pro + seed  
7. Docs + typecheck + deploy Firebase  

---

## 11. Decisões travadas neste doc

| Tema | Decisão |
|------|---------|
| “Todos usuários” | = todos os **membros** do grupo |
| Imagens Sprint A | URL externa / placeholder |
| Respostas | 1 nível (raiz + replies) |
| Hub membership | Collection group `members` |
| Indicações | Check-in overlap + popularidade + pro-led |
| UX polish | Sprint B separada |

---

*Próximo passo após aprovação: executar Sprint A conforme §7 e §10.*
