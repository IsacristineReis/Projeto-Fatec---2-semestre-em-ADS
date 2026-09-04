# mini-Notion — projeto unificado

Este projeto junta as duas partes que estavam separadas:

- **Front-end** (telas de login, criar conta e bloco de notas, com modo escuro e widget de clima) — veio do projeto Fatec 2º semestre.
- **Back-end real** (Flask + SQLAlchemy + MySQL, com cadastro de usuário, login por token e notas isoladas por usuário) — veio do projeto mini-notion.

## Estrutura
```
app.py            -> rotas da API (usuarios, login, logout, notas) + rotas que renderizam as páginas
models.py         -> tabelas Usuario, Nota, Tarefa (SQLAlchemy)
database.py       -> conexão com o MySQL (lê as variáveis do .env)
templates/        -> login.html, signup.html, index.html
static/           -> styles.css, script.js, img/
```

## Como rodar
1. Configure o `.env` com os dados do seu MySQL (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME).
2. Instale as dependências:
   ```
   pip install -r requirements.txt
   ```
3. Rode:
   ```
   python app.py
   ```
4. Acesse `http://127.0.0.1:5000/` — ele já redireciona para a tela de login.

## O que foi ajustado ao juntar os dois
- `script.js` foi reescrito para chamar as rotas reais do backend (`/usuarios`, `/login`, `/logout`, `/notas`) em vez das rotas fictícias que existiam no front (`/notas` em memória, `/signup`).
- Login agora guarda o token no `localStorage` e manda esse token em `Authorization: Bearer <token>` em toda chamada às notas — sem token, o backend responde 401 e o front redireciona pro login.
- Criar conta cria o usuário e já faz login automaticamente, levando direto para o bloco de notas.
- `login.html`/`signup.html`/`index.html` agora usam `{{ url_for(...) }}` do Flask para achar o CSS, o JS e as imagens (antes usavam caminhos relativos que só funcionavam abrindo os HTML soltos).
- Adicionado um botão "Sair" na tela principal.
