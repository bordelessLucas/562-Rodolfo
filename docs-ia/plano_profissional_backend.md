# Plano — Backend da Área do Profissional de Saúde

> **Status:** ✅ backend + UI mínima (P0–P5)  
> **Data UI:** 08/09/2026  
> **Escopo:** domain + services + Firestore rules + indexes + UI vínculos  
> **SDK:** Expo 57

---

## 1. Problema atual

| Item | Situação |
|------|----------|
| Role `profissional` | Existe no cadastro |
| Shell profissional | ✅ Home + pacientes + cursos |
| Vínculo profissional ↔ paciente | ✅ Collection + services + UI |
| Rules | ✅ Leitura de pacientes/check-ins só com link `active` |
| Indexes | ✅ Inclui queries de `professionalPatientLinks` |

Backend de vínculo **implementado**. UI de convite/lista/aceite **implementada**.

---

## 2. Premissas do MVP (proposta segura)

Como o cliente ainda não detalhou 100% a área profissional, o MVP assume o mínimo útil e seguro:

1. Profissional **não lista todos os pacientes do sistema** (LGPD).
2. Existe um **vínculo explícito** (convite / código / aceite).
3. Profissional com vínculo **ativo** pode:
   - ver dados básicos do paciente (nome, e-mail);
   - **ler** check-ins do paciente (somente leitura);
   - listar seus pacientes vinculados.
4. Profissional **não pode**:
   - editar check-in do paciente;
   - alterar role/perfil do paciente;
   - ver pacientes sem vínculo.
5. Paciente pode **aceitar**, **recusar** ou **revogar** o vínculo.
6. Profissional pode **enviar convite** e **cancelar** convite pendente / encerrar vínculo (com regra clara).

Se você quiser outro modelo (ex.: só o profissional adiciona por e-mail sem aceite; ou código de 6 dígitos gerado pelo paciente), diga na aprovação.

### Fluxo proposto (convite por e-mail)

```text
Profissional informa e-mail do paciente
        ↓
Cria professionalPatientLinks (status: pending)
        ↓
Paciente (logado com esse e-mail) vê convite pendente
        ↓
Aceita → status: active  |  Recusa → status: rejected
        ↓
Profissional lista vínculos active e lê check-ins
        ↓
Qualquer lado pode revogar → status: revoked
```

---

## 3. Modelo de dados

### Collection `professionalPatientLinks/{linkId}`

```text
professionalId: string   # uid do profissional
patientId: string        # uid do paciente (preenchido no aceite; no pending pode ser null se só tiver email)
patientEmail: string     # e-mail normalizado do convite
status: 'pending' | 'active' | 'rejected' | 'revoked'
createdAt: timestamp
updatedAt: timestamp
acceptedAt: timestamp | null
revokedAt: timestamp | null
revokedBy: 'profissional' | 'paciente' | null
```

**ID sugerido no aceite:** pode ser auto-id; queries por `professionalId`+`status` e `patientEmail`+`status`.

### Sem mudança estrutural em `dailyCheckins`
Continua `userId` + `date`. A autorização de leitura pelo profissional vem das **rules** via existência de link `active`.

### `users`
- Manter leitura própria.
- **Opcional MVP:** permitir que profissional com link `active` leia `name`/`email`/`role` do paciente (não senha — Auth separado).
- Profissional **não** edita o paciente.

---

## 4. Services (Data Layer)

Arquivos novos:

| Arquivo | Funções |
|---------|---------|
| `src/domain/professionalLink.ts` | Tipos `LinkStatus`, `ProfessionalPatientLink` |
| `src/services/professionalLink.service.ts` | Convite, listar, aceitar, recusar, revogar |
| `src/services/professionalPatient.service.ts` | Listar pacientes ativos do profissional; obter perfil paciente vinculado; listar check-ins do paciente (leitura) |

### API proposta

```ts
// professionalLink.service
invitePatientByEmail(professionalId, patientEmail)
listLinksForProfessional(professionalId, status?)
listPendingInvitesForPatient(patientEmail) // ou patientId após match
acceptLink(linkId, patientId)
rejectLink(linkId, patientId)
revokeLink(linkId, actorId, actorRole)

// professionalPatient.service
listActivePatients(professionalId) // join link + user profile
getPatientProfileIfLinked(professionalId, patientId)
listPatientCheckinsIfLinked(professionalId, patientId, limit?)
```

**Regra de negócio no service:** só chama Firestore; UI/hooks consomem o service (sem Firebase nas telas).

---

## 5. Firestore Rules (proposta)

### Helper

```javascript
function isProfessional() {
  return isSignedIn()
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'profissional';
}

function isPatient() {
  return isSignedIn()
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'paciente';
}

function hasActiveLink(professionalId, patientId) {
  // Nota: rules não fazem query fácil; estratégia recomendada:
  // docId determinístico OU validação via campo denormalizado.
}
```

### Estratégia recomendada para rules (evita query impossível)

Usar **document ID determinístico** no vínculo ativo:

```text
professionalPatientLinks/{professionalId}_{patientId}
```

- No **pending**, usar auto-id OU `pending_{professionalId}_{emailHash}`.
- No **accept**, criar/atualizar doc `{professionalId}_{patientId}` com `status: active`.

Assim a rule de check-in fica:

```javascript
function linkedProfessional(patientId) {
  return exists(/databases/$(database)/documents/professionalPatientLinks/$(request.auth.uid + '_' + patientId))
    && get(...).data.status == 'active';
}

match /dailyCheckins/{id} {
  allow read: if resource.data.userId == request.auth.uid
    || linkedProfessional(resource.data.userId);
  // writes: só o paciente (inalterado)
}
```

### `professionalPatientLinks`

| Ação | Quem |
|------|------|
| create pending | profissional (valida role + `professionalId == auth.uid`) |
| read | profissional dono do link **ou** paciente (email/uid match) |
| update accept/reject | paciente alvo |
| update revoke | profissional ou paciente do vínculo |
| delete | false (só revoke) |

### `users`

| Ação | Quem |
|------|------|
| read próprio | dono |
| read paciente | profissional com link active para esse `userId` |
| update | só dono (como hoje) |

---

## 6. Indexes compostos

| Collection | Campos | Uso |
|------------|--------|-----|
| `professionalPatientLinks` | `professionalId` ASC + `status` ASC + `updatedAt` DESC | Lista do profissional |
| `professionalPatientLinks` | `patientEmail` ASC + `status` ASC | Convites pendentes por e-mail |
| `professionalPatientLinks` | `patientId` ASC + `status` ASC | Links do paciente logado |

(`dailyCheckins` userId+date já existe.)

Deploy: `firestore.rules` + `firestore.indexes.json` no projeto `rodolfo-39b15`.

---

## 7. Etapas de implementação (após aprovação)

| Etapa | Entrega |
|-------|---------|
| **P0** | Domain + `professionalLink.service` + `professionalPatient.service` |
| **P1** | Rules + indexes + deploy Firebase |
| **P2** | Hook `useProfessionalPatients` (sem UI Firebase) |
| **P3** | Front mínimo profissional: convidar por e-mail, listar pacientes, ver check-ins (read-only) |
| **P4** | Front mínimo paciente: banner/lista “Convites pendentes” (aceitar/recusar) |
| **P5** | Atualizar `escopo.md` / `andamento.md` / `checklist` / este plano |

### Opções na aprovação

**A)** Backend completo (P0–P1–P2) **sem** UI de produto (só services testáveis depois)  
**B)** Backend + UI mínima (P0–P5) — **recomendado** para validar no Expo Go  
**C)** Ajustar premissas (ex.: código do paciente em vez de e-mail)

---

## 8. Fora desta fase

- Chat profissional ↔ paciente  
- Edição de check-in pelo profissional  
- Prontuário / prescrição  
- Listagem global de todos os pacientes  
- Custom Claims (role só no Firestore, como hoje)  
- Notificações push de convite  

---

## 9. Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| Rules com `get(users/...)` em toda leitura | Cacheable; evitar em hot paths; ID determinístico no link |
| Convite para e-mail sem conta | Fica `pending` até o paciente cadastrar com o mesmo e-mail |
| Paciente troca e-mail no Auth | MVP: e-mail imutável no perfil (já é a regra atual) |
| Índice ainda building | Queries podem falhar por minutos após deploy |

---

## 10. Critérios de aceite

- [x] Domain + services de vínculo e leitura de pacientes  
- [x] Rules + indexes deployados em `rodolfo-39b15`  
- [x] Docs-ia atualizados  
- [x] UI profissional/paciente (Sprint Continuity 08/09/2026)  
- [ ] Validação end-to-end no Expo Go
