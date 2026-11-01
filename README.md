# Node.js + Supabase — Cadastro de Alunos (cursos 1:N alunos)

API CRUD com duas tabelas + tela em HTML/CSS/JS puro, com lista de alunos
que cresce ao rolar (5 em 5).

## Estrutura

```
meu-node-supabase/
  frontend/
    index.html   estrutura da tela
    style.css    aparência
    app.js       cliques, fetch, lista que cresce ao rolar
  sql/
    tabela_cursos.sql      1º (banco novo)
    tabela_alunos.sql      2º (banco novo)
    migracao_cursos.sql    só se já existia alunos com a coluna "curso" em texto
    policies.sql           3º (libera o papel anon nas duas tabelas)
    dados_demo.sql         opcional: 100 alunos de demonstração
    conferencia.sql        consultas de conferência
  supabase.js    funções do banco
  index.js       demo no terminal (npm run demo)
  server.js      API Express + entrega a tela (npm start)
  .env.example   modelo do .env
```

## Como rodar

1. **Instale o Node.js LTS** (https://nodejs.org) e confira com `node -v`.
2. **Crie um projeto no Supabase** (https://supabase.com).
3. No **SQL Editor** do Supabase, rode um arquivo por vez, nesta ordem:
   - Banco novo: `tabela_cursos.sql` → `tabela_alunos.sql` → `policies.sql`
   - Já tinha `alunos` com `curso` em texto: `migracao_cursos.sql` → `policies.sql`
   - (opcional) `dados_demo.sql` para ter 100 alunos e ver a rolagem funcionando
4. Copie `.env.example` para `.env` e preencha `SUPABASE_URL` e
   `SUPABASE_ANON_KEY` (botão **Connect** → Framework, ou
   Project Settings → API). Nunca use a chave `service_role`.
5. No terminal, dentro da pasta do projeto:
   ```
   npm install
   npm start
   ```
6. Abra **http://localhost:3000**.

Para testar só o banco pelo terminal: `npm run demo`.

## Rotas da API

| Método | Rota | O que faz |
|---|---|---|
| GET | /cursos | lista cursos com `total_alunos` |
| POST | /cursos | cria curso `{ "nome": "ADS" }` |
| DELETE | /cursos/:id | apaga curso (409 se ainda tiver alunos) |
| GET | /cursos/:id/alunos | alunos de um curso |
| GET | /alunos | todos os alunos |
| GET | /alunos/:ra | um aluno |
| POST | /alunos | cria `{ nome, ra, curso_id }` |
| PUT | /alunos/:ra | altera `{ nome, curso_id }` |
| DELETE | /alunos/:ra | apaga o aluno |

`GET /alunos` e `GET /cursos/:id/alunos` aceitam `?inicio=0&limite=5` e então
respondem `{ alunos, total, inicio, limite }`. Sem esses parâmetros devolvem o
array completo.

## Problemas comuns

- `fetch failed / ENOTFOUND`: projeto Supabase pausado (Restore project) ou URL errada.
- `violates row-level security policy` ou listas vazias: rode `policies.sql`.
- Mudou o `.env`: pare (Ctrl+C) e rode `npm start` de novo.
- `EADDRINUSE :::3000`: porta ocupada; feche o outro servidor ou troque `PORT`.

> As policies são abertas (`using (true)`) **só para estudo**. Não use em
> produção com dados reais.
