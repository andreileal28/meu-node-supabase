-- Consultas de conferência (só leem, não alteram nada)

-- 1) os cursos cadastrados
select * from cursos;

-- 2) cada aluno com o nome do seu curso
select a.nome, a.ra, c.nome as curso
from alunos a
join cursos c on c.id = a.curso_id;

-- 3) quantos alunos cada curso tem
select c.nome, count(a.id) as total
from cursos c
left join alunos a on a.curso_id = c.id
group by c.nome;
