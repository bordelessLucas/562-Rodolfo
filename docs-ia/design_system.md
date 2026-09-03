# Design System — Aplicativo para Lipedema

> Documento vivo. Tokens abaixo são **provisórios** (UI base) até o cliente enviar brand kit oficial.  
> Fácil de trocar via `src/theme/tokens.ts`.

---

## Status visual

| Item | Status |
|------|--------|
| Paleta de cores | **Provisória** — sage clínico (validar com cliente) |
| Tipografia | **Provisória** — Literata (display) + Source Sans 3 (body) |
| Estilo de UI | **Provisório** — calmo, clínico, acolhedor, light mode |
| Referências visuais | **Pendente** — não fornecidas |
| Dark mode | **Pendente** — não definido (app inicia em light) |
| Identidade da marca | **Pendente** — a levantar |

---

## Direção visual (provisória)

Interface **calma, clínica e acolhedora**, neutra e acessível (alto contraste, toques amplos), foco em formulários e diário — sem gamificação nem visual de dashboard genérico.

---

## Paleta de cores (provisória)

| Token | Hex | Uso |
|-------|-----|-----|
| `color.primary` | `#1F6B5C` | CTAs, links, ênfase |
| `color.primaryPressed` | `#18574A` | Pressed primary |
| `color.secondary` | `#5B8A7A` | Ações secundárias |
| `color.background` | `#F3F6F4` | Fundo das telas (névoa sage) |
| `color.backgroundAccent` | `#E4EFEB` | Faixas / wash suave |
| `color.surface` | `#FFFFFF` | Campos, header, superfícies |
| `color.text` | `#1A2B26` | Texto principal |
| `color.textMuted` | `#5C6F68` | Captions, placeholders |
| `color.success` | `#2D8A5E` | Feedback positivo |
| `color.warning` | `#C4892A` | Alertas |
| `color.error` | `#C44B4B` | Erros de formulário |
| `color.border` | `#D5E0DB` | Bordas de input / divisores |
| `color.overlay` | `rgba(26, 43, 38, 0.45)` | Overlays leves |

---

## Tipografia (provisória)

| Token | Família | Uso |
|-------|---------|-----|
| `font.display` | **Literata** | Nome do produto, títulos de tela |
| `font.body` | **Source Sans 3** | Body, labels, botões, captions |

| Token | Size | Weight |
|-------|------|--------|
| `display` | 32 | 600 |
| `h1` | 28 | 600 |
| `h2` | 22 | 600 |
| `h3` | 18 | 600 |
| `body` | 16 | 400 |
| `bodyStrong` | 16 | 600 |
| `caption` | 13 | 400 |
| `label` | 14 | 600 |

---

## Espaçamento e radius

| Token | Valor |
|-------|-------|
| `space.1` … `space.8` | 4, 8, 12, 16, 20, 24, 32, 40 |
| `radius.sm` | 8 |
| `radius.md` | 12 |
| `radius.lg` | 16 |
| `radius.pill` | 999 (evitar em CTAs principais; preferir `md`) |

---

## Componentes base

- `Button` — primary / secondary / outline + loading + disabled  
- `Input` — ícone, senha, erro  
- `Typography` — display, h1–h3, body, caption, label  
- `Container` — SafeArea + padding horizontal do DS  

---

## Referências visuais a coletar

- [ ] Logo e manual da marca
- [ ] Paleta oficial (hex)
- [ ] Fontes licenciadas
- [ ] Figma / wireframes
- [ ] Apps de referência do cliente
- [ ] Materiais do Diário / curso / mentoria

---

## Regra de aplicação

Seguir estes tokens em `src/theme/tokens.ts`. Quando o cliente enviar o brand kit, atualizar **este arquivo** e os tokens — os componentes atômicos herdam automaticamente.
 