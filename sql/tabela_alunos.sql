-- IF NOT EXISTS: se a tabela já existir, o comando não quebra
create table if not exists alunos (
  -- id: chave primária — "generated always as identity" = o banco gera 1, 2, 3...
  id bigint generated always as identity primary key,
  -- "not null" = campo obrigatório, não pode ficar vazio
  nome text not null,
  -- "unique" = não pode existir dois alunos com o mesmo RA
  ra text not null unique,
  -- CHAVE ESTRANGEIRA (foreign key): guarda o id de um curso
  -- "references cursos(id)" = o valor precisa existir em cursos.id
  -- "on delete restrict" = não deixa apagar um curso que ainda tem alunos
  curso_id bigint not null references cursos(id) on delete restrict,
  -- "default now()" = preenchido automaticamente no momento do INSERT
  criado_em timestamptz default now()
);
