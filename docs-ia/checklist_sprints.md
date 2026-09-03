# Checklist de Sprints — Aplicativo para Lipedema

> Sprints lógicas e sequenciais com base no **escopo inicial confirmado**.  
> Itens dependentes de levantamento do cliente ficam explícitos como validação — **sem presumir regras**.

---

## Sprint 0 — Alinhamento e Memory Bank
- [x] Setup Expo SDK 54 + Firebase (`.env`, `src/services/firebase.ts`)
- [x] `.cursorrules` e estrutura inicial do repositório
- [x] Criar `docs-ia/` (`escopo`, `design_system`, `checklist_sprints`)
- [ ] Validar com o cliente o resumo de sprints (este arquivo)
- [ ] Agendar levantamento: campos do diário, ficha de diagnóstico, área médica, conteúdo

---

## Sprint 1 — Autenticação e perfis
- [x] Definir modelo mínimo de usuário no Firebase Auth + perfil em Firestore (`role`: paciente | profissional)
- [x] Service de auth isolado em `src/services/` (sem Firebase direto na UI)
- [x] Fluxos: cadastro, login, logout, recuperação de senha (escopo mínimo)
- [x] Tela/fluxo de escolha ou atribuição de perfil (conforme regra confirmada pelo cliente)
- [x] Proteção de rotas (Expo Router) por sessão
- [x] Regras básicas de segurança Firestore alinhadas aos perfis
- [ ] Proteção de rotas por perfil (shells paciente vs profissional)

---

## Sprint 2 — UI base e navegação
- [x] Tokens provisórios + componentes atômicos (`Button`, `Input`, `Typography`, `Container`)
- [x] Telas Login, Cadastro e Home (mocks, sem Firebase)
- [x] Navegação expo-router (login / register / home)
- [ ] Shell completo paciente vs profissional com rotas separadas
- [ ] Home profissional + Perfil dedicados
- [ ] Estados vazios / loading / erro padronizados em todas as telas
- [ ] Incorporar Design System oficial quando o cliente enviar (atualizar `design_system.md`)

---

## Sprint 3 — Paciente: ficha de diagnóstico
- [ ] Levantar e confirmar com o cliente os campos da ficha
- [ ] Domínio (tipos/interfaces) da ficha em camada de domínio
- [ ] Service de persistência da ficha (`src/services/`)
- [ ] Fluxo de preenchimento / edição / visualização da ficha
- [ ] Validação de formulário e salvamento vinculado ao paciente autenticado

---

## Sprint 4 — Paciente: Diário de Lipedema (MVP)
- [ ] Levantar e confirmar estrutura das entradas do diário (dados, frequência, anexos)
- [ ] CRUD mínimo de entradas do diário (criar, listar, detalhar, editar — conforme confirmado)
- [ ] Service do diário isolado da UI + hooks de negócio
- [ ] Tela de histórico / acompanhamento das informações registradas
- [ ] Garantir que apenas o paciente dono acessa seus registros (regras Firestore)

---

## Sprint 5 — Área médica (após levantamento)
- [ ] Validar com o cliente: visualizações, vínculo médico–paciente, permissões
- [ ] Implementar somente o que for **confirmado** (ex.: lista de pacientes vinculados, leitura do diário, etc.)
- [ ] Services e regras de acesso específicos do perfil profissional
- [ ] Atualizar `escopo.md` com requisitos confirmados antes de codar

---

## Sprint 6 — Conteúdo educacional / produtos (após definição)
- [ ] Decidir modelo: hospedar, link externo, integração com plataforma, ou controle de compra
- [ ] Implementar acesso a mentoria / cursos / materiais **somente** conforme decisão do cliente
- [ ] Integrações externas (se houver) documentadas em `escopo.md`
- [ ] Atualizar checklist com subtarefas concretas pós-decisão

---

## Sprint 7 — Polimento, privacidade e release interno
- [ ] Revisão LGPD / dados sensíveis de saúde (consentimento, retenção — com orientação do cliente)
- [ ] Testes em Expo Go (SDK 54) nos fluxos paciente confirmados
- [ ] Ajustes de UX com base no Design System oficial
- [ ] Build de preview / checklist de release interno
- [ ] Congelar MVP confirmado e listar backlog pós-MVP

---

## Fora de escopo até confirmação

Não iniciar implementação de:

- Vínculo clínico médico ↔ paciente
- Avaliação/diagnóstico feito pelo médico no app
- Player/hospedagem de cursos ou paywall de mentoria
- Campos “inventados” do diário ou da ficha

Enquanto não houver aceite explícito do cliente.
