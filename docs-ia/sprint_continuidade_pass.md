# Sprint Continuity Pass — UI de vínculos profissional ↔ paciente

> Data: **08/09/2026**  
> Agente: Sprint Continuity  
> Fatia: Sprint 9 / R8 mínimo (UI sobre back já existente)

---

## O que foi entregue

### Profissional
- Home com entrada **Meus pacientes**
- Tela de lista: convidar por e-mail, ver pendentes (cancelar), ver ativos
- Detalhe do paciente: dados básicos + check-ins **somente leitura** + encerrar vínculo
- Rotas: `/(profissional)/pacientes` e `/(profissional)/pacientes/[patientId]`

### Paciente
- Perfil → **Profissionais vinculados**
- Aceitar / recusar convites pendentes
- Revogar vínculos ativos
- Rota: `/(paciente)/vinculos` (oculta na tab bar)

### Hooks / domínio
- `useProfessionalPatients`, `usePatientLinks`, `useLinkedPatientDetail`
- `professionalName` denormalizado no convite (paciente não lê `users/{profissional}` pelas rules)

### Docs
- `andamento.md` e `checklist_sprints.md` atualizados (status apenas)

### Qualidade
- `npx tsc --noEmit` passou
- Alias `normalizeRouteParam` em `routeParams` para não bloquear tsc com diff paralelo de cursos

---

## Fora desta fatia (sem inventar)

- Features extras do profissional (gate cliente)
- Chat, edição de check-in pelo profissional, prontuário
- R3 diagnóstico / R4 biblioteca / paywall / Storage

---

## Próximo sugerido

1. Validar fluxo end-to-end no Expo Go (dois usuários: profissional + paciente)
2. **R3** Diagnóstico *(gate: campos oficiais)* **ou** **R4** biblioteca avulsa *(gate: hospedagem)*
3. Demais itens R8 só após levantamento com o cliente
