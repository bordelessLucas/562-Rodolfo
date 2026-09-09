# Seed — conteúdos mock

Sem Firebase Storage. URLs de vídeo externas.

## Cursos publicados

1. **Introdução ao lipedema** (`seed_intro_lipedema`) — kind `curso`  
2. **Mentoria: compressão e rotina** (`seed_mentoria_compressao`) — kind `mentoria`

## Fila de aprovação — cursos

1. **[Demo] Curso: edema e cuidados diários** (`seed_pending_curso_edema`) — `pending_review`  
2. **[Demo] Mentoria: movimento seguro** (`seed_pending_mentoria_movimento`) — `pending_review`

## Comunidades publicadas (admin)

1. `demo_convivencia`  
2. `demo_novidades`

## Fila / histórico — comunidades (mesmo autor demo)

Todos com `createdBy` = UID do admin que rodou o seed (para abrir o histórico na fila).

1. `demo_pending_alimentacao` — `pending`  
2. `demo_pending_suporte` — `pending`  
3. `demo_rejected_treino` — `rejected` + motivo  
4. `demo_accepted_movimento` — `published` (aceito)

Na fila: toque em **Submetido por** → lista completa (aceito / rejeitado+motivo / pendente).

## Artigos

Ver `mockArticles.ts` (notícia / pesquisa / artigo).

URL de vídeo usada:

`https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`

## Como gravar

1. Conta com `role: admin`  
2. Admin → **Carregar conteúdos de demonstração**  
3. Ver badges e histórico na fila de comunidades  

Idempotente: se o ID já existe, o seed ignora.
