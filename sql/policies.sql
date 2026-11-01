-- 1) liga o RLS nas DUAS tabelas (tranca as duas portas)
alter table cursos enable row level security;
alter table alunos enable row level security;

-- 2) políticas "abertas" SÓ PARA FINS DE ESTUDO
-- 3) DROP IF EXISTS: pode rodar o script de novo sem erro

-- ===================== CURSOS =====================
drop policy if exists "cursos_select_anon" on cursos;
create policy "cursos_select_anon" on cursos for select to anon using (true);

drop policy if exists "cursos_insert_anon" on cursos;
create policy "cursos_insert_anon" on cursos for insert to anon with check (true);

drop policy if exists "cursos_update_anon" on cursos;
create policy "cursos_update_anon" on cursos for update to anon
  using (true) with check (true);

drop policy if exists "cursos_delete_anon" on cursos;
create policy "cursos_delete_anon" on cursos for delete to anon using (true);

-- ===================== ALUNOS =====================
-- SELECT: anon pode LER qualquer aluno
drop policy if exists "alunos_select_anon" on alunos;
create policy "alunos_select_anon" on alunos
  for select to anon
  using (true);

-- INSERT: anon pode CRIAR aluno
drop policy if exists "alunos_insert_anon" on alunos;
create policy "alunos_insert_anon" on alunos
  for insert to anon
  with check (true);

-- UPDATE: anon pode ALTERAR qualquer aluno
drop policy if exists "alunos_update_anon" on alunos;
create policy "alunos_update_anon" on alunos
  for update to anon
  using (true) with check (true);

-- DELETE: anon pode APAGAR qualquer aluno
drop policy if exists "alunos_delete_anon" on alunos;
create policy "alunos_delete_anon" on alunos
  for delete to anon
  using (true);
