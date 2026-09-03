# Escopo do Projeto — Aplicativo para Lipedema

> Documento vivo. Separar sempre: **confirmado** vs **pendente de validação com o cliente**.  
> Não implementar funcionalidades presumidas sem confirmação.

---

## Objetivo principal

Criar um aplicativo mobile especializado em **lipedema**, concentrando conteúdos, acompanhamento e ferramentas relacionadas em um único ecossistema digital, atendendo:

- **Pacientes**
- **Médicos / profissionais de saúde**

Stack atual: **React Native (Expo SDK 54) + Firebase**.

---

## Perfis de usuário

| Perfil | Status | Descrição |
|--------|--------|-----------|
| **Paciente** | Confirmado | Usa o app para cadastro, ficha de diagnóstico e Diário de Lipedema. |
| **Médico / profissional de saúde** | Confirmado (existência do perfil) | Experiência dedicada; **funcionalidades específicas ainda não detalhadas**. |

> Hipóteses (vínculo médico–paciente, visualização do diário, avaliações etc.) **não são requisitos** até validação com o cliente.

---

## Regras de negócio (confirmadas / diretrizes)

1. O produto atende **dois públicos**: pacientes e profissionais de saúde.
2. O módulo central inicial do paciente é o **Diário de Lipedema**.
3. O paciente deve poder **cadastrar-se / entrar** no sistema.
4. O paciente deve poder preencher uma **ficha de diagnóstico**.
5. O paciente deve poder **registrar e acompanhar** informações relacionadas ao lipedema no diário.
6. O cliente já possui / desenvolve produtos externos (mentoria, curso online, conteúdos, Diário) que **poderão** integrar-se ao app no futuro — forma de integração **não definida**.
7. **Não implementar** funcionalidades presumidas sem confirmação do cliente.
8. Novos requisitos devem ser incorporados separando: confirmados, regras, perfis, funcionalidades, integrações, dados a armazenar, pendências e ideias a validar.

---

## Funcionalidades core (confirmadas no escopo inicial)

### Área do paciente
- Cadastro / autenticação do paciente
- Preenchimento de **ficha de diagnóstico**
- **Diário de Lipedema**: registro e acompanhamento de informações relacionadas à condição
- Estrutura completa dos campos do diário: **pendente de levantamento**

### Área médica
- Existência de experiência / área destinada a médicos/profissionais
- Funcionalidades específicas: **pendentes de detalhamento**

### Conteúdo educacional / produtos digitais
- Mentoria, cursos online e materiais relacionados existem no contexto do cliente
- Papel do app (hospedar, linkar, integrar plataforma externa, controle de compra): **não definido**

---

## Frentes do produto (visão inicial)

1. **Acompanhamento do paciente** — Diário, ficha de diagnóstico, registros  
2. **Área médica** — a detalhar  
3. **Conteúdo educacional** — mentoria, cursos, materiais  

---

## Requisitos pendentes de definição (levantamento)

### Diário / paciente
- [ ] Quais dados exatamente serão registrados no diário
- [ ] Estrutura completa da ficha de diagnóstico
- [ ] Frequência, histórico, edições, anexos (imagens etc.)

### Área médica
- [ ] O que o médico visualiza
- [ ] Se haverá vínculo médico–paciente
- [ ] Se o médico acompanha o diário
- [ ] Se realiza avaliações/diagnósticos no app
- [ ] Informações clínicas disponíveis e permissões por perfil

### Conteúdo / integrações
- [ ] Hospedagem in-app vs acesso externo vs integração
- [ ] Controle de usuários que compraram cursos/mentorias
- [ ] Relação dos produtos atuais do cliente com o app

### Dados a armazenar
- [ ] Modelo de dados completo (paciente, ficha, entradas do diário, perfil médico)
- [ ] Políticas de privacidade / dados de saúde (LGPD e sensíveis)

---

## Ideias / hipóteses (não confirmadas)

- Vínculo e acompanhamento clínico médico ↔ paciente via diário
- Avaliações/diagnósticos feitos pelo profissional no app
- Integração da mentoria e cursos como módulo nativo ou SSO/plataforma externa
- Evolução do “Diário de Lipedema” já existente do cliente para dentro do app

---

## Status do escopo

**Fase:** levantamento inicial de requisitos.  
Este documento deve ser atualizado a cada nova transcrição, reunião ou artefato do cliente.
