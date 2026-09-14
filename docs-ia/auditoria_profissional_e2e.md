# Auditoria E2E — Área profissional + vídeo externo

> Checklist para validar no Expo Go / build.  
> Atualizado em **14/09/2026** após UI pass A–D.

---

## Contas necessárias

| Papel | Uso |
|-------|-----|
| Profissional | convites, cursos, comunidade |
| Paciente (mesmo e-mail do convite) | aceite + check-in + assistir aula |
| Admin | aprovar curso e comunidade |

---

## Fluxo 1 — Vínculo profissional ↔ paciente

1. Profissional → **Meus pacientes** → convidar e-mail válido do paciente.
2. Ver convite em **Convites pendentes**; cancelar um teste e reenviar.
3. Paciente logado → aceitar convite (tela de vínculos).
4. Profissional → paciente aparece em **Pacientes vinculados**.
5. Abrir detalhe → ver check-ins **somente leitura**.
6. Encerrar vínculo → confirmação → paciente some da lista.
7. **Negativo:** e-mail inválido mostra erro local; sem aceite não há check-ins.

- [ ] Passou no dispositivo

---

## Fluxo 2 — Curso com YouTube / URL externa

1. Profissional → **Meus cursos** → **Novo curso**.
2. Preencher título, módulo, aula e URL YouTube válida → **Salvar rascunho**.
3. **Negativo:** URL vazia/inválida bloqueia save.
4. **Enviar para aprovação** → status “Em revisão”.
5. Admin aprova o curso.
6. Paciente vê no catálogo → abre aula → CTA “Assistir no YouTube” (ou provedor) abre fora do app.
7. Paciente marca aula como concluída.
8. **Negativo:** aula sem `videoUrl` mostra empty honesto.

- [ ] Passou no dispositivo

---

## Fluxo 3 — Solicitar comunidade

1. Profissional → **Comunidades** → preencher título/descrição/políticas → enviar.
2. Item aparece como **Aguardando** no resumo.
3. Admin aprova.
4. Status muda para publicada; paciente consegue entrar conforme `joinPolicy`.

- [ ] Passou no dispositivo

---

## Fluxo 4 — Home profissional (resumo)

1. Abrir **Início** profissional.
2. Contadores refletem pacientes ativos, cursos publicados e comunidades.
3. Hints de “em revisão” / “convites pendentes” aparecem quando > 0.
4. Atalhos navegam para pacientes / cursos / comunidades.

- [ ] Passou no dispositivo

---

## Fora de escopo (não testar como bug)

- Chat profissional ↔ paciente  
- Editar check-in do paciente  
- Upload de vídeo para Storage  
- Lista global de todos os pacientes  

---

## Resultado

| Data | Quem | Resultado |
|------|------|-----------|
| — | — | Pendente |
