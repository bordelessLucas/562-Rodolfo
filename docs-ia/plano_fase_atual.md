# Plano da Fase Atual — Back (só o que o Front usa) + Polish UI/UX

> **Status histórico:** ✅ A+B+C executados (auth polish).  
> **Superseded:** o andamento vivo está em `andamento.md` / `plano_roadmap.md` (R0–R2, R5, R8 vínculo ✅).  
> Este arquivo descreve a fase de endurecimento de Auth — não use como fila atual de produto.

> Escopo do produto: ver `escopo.md`. Novos módulos exigem aprovação de fase.

---

## 1. Princípios desta fase

1. **Back só para front existente** — Login, Cadastro, Recuperar senha, Sessão, Home (perfil), Logout.
2. **Sem novas features de produto** (Check-in, tabs de negócio, voz, IA) até nova aprovação.
3. **UI/UX polish** nas telas já entregues, alinhado ao `design_system.md`.
4. Cada etapa abaixo exige **aprovação** antes de codar (ou aprovação deste plano inteiro de uma vez).
5. Ao concluir cada etapa, **atualizar** `andamento.md`, `escopo.md` (se mudar regra) e este arquivo.

### Fluxos front existentes (contrato desta fase)

```text
[App] → sessão?
   ├─ não → Login
   │         ├─ Entrar → Auth + carregar profile → Home
   │         ├─ Esqueci senha → e-mail reset
   │         └─ Criar conta → Register
   │                           ├─ role + dados → Auth + users/{uid} → Home
   │                           └─ Já tenho conta → Login
   └─ sim → Home
             ├─ saudação com nome/role do profile
             └─ Sair → logout → Login
```

---

## 2. Mapa: Front atual × Back necessário

| Fluxo UI | Back hoje | Lacunas / riscos | Ação nesta fase |
|----------|-----------|------------------|-----------------|
| Login | `signIn` | OK | Hardening erros + loading |
| Cadastro | `signUp` + `createUserProfile` | Se Firestore falhar após Auth, usuário órfão | Retry / compensação / mensagem clara |
| Recuperar senha | `resetPassword` | OK (Alert genérico) | Feedback UI polido |
| Sessão persistente | Auth + AsyncStorage | Profile pode vir `null` | Reload profile / estado de erro |
| Home | lê `profile` | Placeholder; nav fake | Polish visual; não inventar Check-in |
| Logout | `signOut` | OK | Feedback + limpeza de estado |
| Rotas | AuthGate | OK | Micro-ajustes loading |

**Fora desta fase (explicitamente):** `dailyCheckins`, tabs Check-in/Histórico/Tendências/IA, voz, ficha, área médica.

---

## 3. Etapas detalhadas (ordem)

### Etapa A — Auditoria e hardening do Backend de Auth/Perfil ✅
**Objetivo:** os 6 fluxos acima confiáveis no Firebase.

| # | Tarefa | Status |
|---|--------|--------|
| A1 | Cadastro: retry perfil + delete Auth se falhar | ✅ |
| A2 | `refreshProfile` + `profileError` / `profileLoading` | ✅ |
| A3 | Normalizar e-mail | ✅ |
| A4 | Erros PT incl. permission-denied / unavailable | ✅ |
| A5 | Auth e-mail/senha no console | checklist manual |
| A6 | Rules `users` (sem dailyCheckins) | ✅ sem mudança necessária |

---

### Etapa B — Polish UI/UX das telas existentes ✅

| # | Tarefa | Status |
|---|--------|--------|
| B1 | Login + InlineMessage | ✅ |
| B2 | Cadastro + SelectableChip | ✅ |
| B3 | Home honesta (em breve Check-in) | ✅ |
| B4 | Loading AuthGate + perfil | ✅ |
| B5 | InlineMessage | ✅ |
| B6 | Toques / press states | ✅ |
| B7 | design_system atualizado | ✅ |

---

### Etapa C — Documentação viva ✅

Docs atualizados: `andamento`, `checklist`, `escopo`, `design_system`, este plano.

---

### Etapa D — Critérios de aceite da fase (teste manual)

- [ ] Criar conta paciente → chega na Home com nome correto  
- [ ] Criar conta profissional → Home mostra role  
- [ ] Logout → Login; voltar app → continua deslogado  
- [ ] Login de novo → Home  
- [ ] Esqueci senha com e-mail válido → feedback claro  
- [ ] E-mail/senha inválidos → erro em PT, sem crash  
- [ ] App kill/reopen logado → sessão restaura + profile  
- [ ] Visual Login/Cadastro/Home coerente com DS (espaçamento, tipografia, contraste)

---

## 4. O que NÃO entra (até nova aprovação)

- Coleção / service / rules de `dailyCheckins`  
- Bottom tabs Check-in | Histórico | Tendências | IA  
- Medidas, voz, gráficos, insights  
- Ficha de diagnóstico, área médica, conteúdo  
- Troca de SDK (permanece **54**)

---

## 5. Ordem de execução proposta

```text
1. Você aprova este plano (ou ajusta escopo)
2. Etapa A (back hardening) → atualiza docs-ia
3. Você inspeciona fluxos de conta no Expo Go
4. Etapa B (polish UI) → atualiza docs-ia
5. Você inspeciona visual
6. Encerrar fase → liberar planejamento da Sprint Check-in (back+front juntos)
```

---

## 6. Arquivos previstos (resumo)

**Provável edição (Etapa A):**  
`src/services/auth.service.ts`, `src/services/user.service.ts`, `src/contexts/AuthContext.tsx`, `src/hooks/useAuth.ts`, opcional `firestore.rules`

**Provável edição (Etapa B):**  
`src/screens/LoginScreen.tsx`, `RegisterScreen.tsx`, `HomeScreen.tsx`, `src/components/*`, `src/theme/tokens.ts`, `docs-ia/design_system.md`

**Docs (sempre):**  
`andamento.md`, `checklist_sprints.md`, `escopo.md`, este `plano_fase_atual.md`

---

## 7. Aprovação

Responda com uma das opções:

1. **Aprovar fase inteira (A + B + C)** — executo na ordem  
2. **Aprovar só Etapa A** (back) — polish depois  
3. **Aprovar só Etapa B** (UI) — back depois  
4. **Ajustar** — diga o que incluir/excluir  

**Nenhum código de feature será escrito até sua resposta.**
