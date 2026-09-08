# Plano / implementação — Módulo de Cursos (R5)

> **Status:** base implementada (C1–C4) + polish UI/QA 08/09/2026  
> **Escopo:** [escopo.md](escopo.md) §3 — catálogo, módulos, aulas com vídeo, acesso por perfil, progresso  
> **Nav:** cursos sob Explorar (não são tab inferior)  
> **Fora:** Storage, OpenAI, paywall, biblioteca R4 avulsa

## Papéis

| Papel | Ação |
|-------|------|
| **Paciente** | Consome só cursos `published` |
| **Profissional** | Cria `draft`, envia `pending_review` |
| **Admin** | Publica direto; aprova/rejeita fila (role **manual** no Firestore) |

## Dados

- `courses` → `modules` → `lessons` (`contentType`: video \| text; `videoUrl` mock)
- `lessonProgress/{userId}_{lessonId}`
- `users.role` inclui `admin` (não disponível no cadastro self-service)

## Como promover admin

1. Crie usuário normal no app (paciente ou profissional) **ou** Auth Console.
2. No Firestore, em `users/{uid}`, altere `role` para `"admin"`.
3. Faça login de novo — redireciona para `/(admin)`.

## Seed mock

No app admin: botão **Carregar cursos mock (seed)**  
IDs fixos: `seed_intro_lipedema`, `seed_mentoria_compressao`  
Vídeo placeholder: Big Buck Bunny (URL pública). Detalhes: [seed_cursos_mock.md](seed_cursos_mock.md)

## Services

- `src/services/course.service.ts`
- `src/services/courseProgress.service.ts`
- Domain: `src/domain/course.ts`
