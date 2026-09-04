# Andamento do Projeto — Backend × Frontend

> Documento vivo. Atualizado em **04/09/2026**.  
> **Não redefine escopo** — só registra o que já foi feito e o que ainda falta conforme `escopo.md` / `plano_roadmap.md`.

---

## Visão rápida

| Camada | Progresso estimado | Situação |
|--------|-------------------|----------|
| **Frontend** | ~55% | Auth + shells + Check-in/Histórico/Perfil |
| **Backend** | ~60% | Auth + users + dailyCheckins + professionalPatientLinks |
| **Diário / Check-in** | Spec ✅ · MVP ✅ | Voz/tendências/IA/monetização pendentes |
| **Cursos / vídeos / conteúdos** | Spec ✅ · Código 0% | Stub em Explorar |
| **Diagnóstico inicial** | Spec ✅ · Código 0% | Aguarda fase R3 |
| **Comunidade** | Spec ✅ · Código 0% | Stub em Explorar |
| **Área profissional** | Shell ✅ · Back vínculo ✅ · UI ❌ | Services prontos; UI na próxima sprint |

---

## O que falta implementar (fila atual)

> Lista de **trabalho técnico pendente**. Itens marcados como *gate cliente* não devem ser inventados no código até confirmação.

### Próxima sprint sugerida (UI profissional — consome back já pronto)
- [ ] UI profissional: convidar paciente por e-mail, listar vínculos, ver check-ins (somente leitura)
- [ ] UI paciente: ver convites pendentes, aceitar / recusar / revogar
- [ ] Hook(s) que encapsulam `professionalLink.service` / `professionalPatient.service` (sem Firebase na UI)

### Roadmap ainda sem código (ordem em `plano_roadmap.md`; não alterar escopo)
- [ ] **R3** Diagnóstico inicial *(gate: campos oficiais do questionário)*
- [ ] **R4** Conteúdos / vídeos pacientes *(gate: hospedagem de vídeo)*
- [ ] **R5** Cursos / mentoria
- [ ] **R6** Comunidade *(gate: moderação)*
- [ ] **R7** Monetização do diário *(gate: modelo de preço/trial)*
- [ ] **R8** restante da área profissional *(gate: features concretas além do vínculo — cliente TBD)*
- [ ] **R9** Voz, unidades, tendências, insights IA *(gate: escopo da 1ª versão de IA)*
- [ ] **R10** Integração / release / LGPD

### Pendências de detalhamento (espelho de `escopo.md` — não expandir produto aqui)
- Modelo de monetização do diário
- Campos oficiais do diagnóstico inicial
- Features concretas extras da área profissional (além de vínculo + leitura)
- Hospedagem de vídeo, moderação, unidades, insights IA, políticas LGPD

---

## Cobertura do escopo

| Bloco | Spec | Código |
|-------|------|--------|
| 1. Estrutura plataforma | ✅ | ✅ parcial (shells ok) |
| 2. Cadastro e perfil | ✅ | ✅ (edição nome ok) |
| 3. Cursos/mentoria | ✅ | ❌ (stub) |
| 4. Vídeos pacientes | ✅ | ❌ (stub) |
| 5. Diagnóstico inicial | ✅ | ❌ |
| 6. Comunidade | ✅ | ❌ (stub) |
| 7. Integração | ✅ | Parcial |
| Diário + monetização | ✅ | Diário MVP ✅ · paywall ❌ |
| Área profissional | ✅ existência | Back vínculo ✅ · UI ❌ · demais features TBD |

---

## BACKEND ✅ recente
- `updateUserProfile` + `updatedAt`
- `checkin.service` (get/upsert/list)
- `professionalLink.service` + `professionalPatient.service` (convite e-mail, aceite, leitura)
- Rules `professionalPatientLinks` + leitura vinculada de `users`/`dailyCheckins`
- Indexes de vínculos **deployados** em `rodolfo-39b15`

---

## FRONTEND ✅ recente
- `(paciente)` tabs: Check-in · Histórico · Explorar · Perfil
- `(profissional)` home stub + perfil
- Redirect por role pós-login
- Componentes: SectionCard, WellbeingScale, DateNavigator, ChipMultiSelect, RoleGate
- **Ainda sem UI** para fluxo de vínculos profissional ↔ paciente

---

## Ordem (roadmap)

Ver `plano_roadmap.md`.  
**Fila imediata sugerida:** UI da área profissional (consumir services existentes).  
**Alternativa:** R3 Diagnóstico (após aprovação e, idealmente, campos do cliente).
