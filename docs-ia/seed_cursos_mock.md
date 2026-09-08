# Seed — cursos mock

Sem Firebase Storage. URLs de vídeo externas.

## Conteúdo

1. **Introdução ao lipedema** (`seed_intro_lipedema`) — kind `curso`, 2 módulos, aulas vídeo + texto  
2. **Mentoria: compressão e rotina** (`seed_mentoria_compressao`) — kind `mentoria`, 1 módulo, 1 videoaula  

URL de vídeo usada:

`https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`

## Como gravar

1. Conta com `role: admin` no Firestore  
2. Login no app → Admin → **Carregar cursos mock (seed)**  
3. Paciente: Explorar → Cursos  

Idempotente: se o ID já existe, o seed ignora.
