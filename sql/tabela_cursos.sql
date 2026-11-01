-- tabela "pai" do relacionamento 1:N (um curso tem vários alunos)
-- precisa ser criada ANTES de alunos, porque alunos aponta para ela
create table if not exists cursos (
  -- chave primária: é este id que a tabela alunos vai guardar
  id bigint generated always as identity primary key,
  -- "unique" = não existem dois cursos com o mesmo nome
  nome text not null unique,
  criado_em timestamptz default now()
);
