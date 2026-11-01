-- OPCIONAL: cria 3 cursos e 100 alunos de demonstração (Aluno 001..100,
-- RA R10001..R10100) para você ver a rolagem de 5 em 5 funcionando.
-- Rode DEPOIS de tabela_cursos.sql, tabela_alunos.sql e policies.sql.
-- Pode rodar mais de uma vez: não duplica.

insert into cursos (nome) values ('ads'), ('direito'), ('medicina veterinaria')
on conflict (nome) do nothing;

insert into alunos (nome, ra, curso_id)
select
  'Aluno ' || lpad(g::text, 3, '0'),
  'R' || (10000 + g)::text,
  (select id from cursos
    where nome = (array['ads', 'direito', 'medicina veterinaria'])[(g % 3) + 1])
from generate_series(1, 100) as g
on conflict (ra) do nothing;
