
const tabela = document.getElementById('tabela-alunos');
const tabelaCursos = document.getElementById('tabela-cursos');
const msg = document.getElementById('msg');
const modal = document.getElementById('modal');
const modalTitulo = document.getElementById('modal-titulo');
const form = document.getElementById('form-aluno');
const inputNome = document.getElementById('nome');
const inputRa = document.getElementById('ra');
const selectCurso = document.getElementById('curso');
const filtroCurso = document.getElementById('filtro-curso');
const formCurso = document.getElementById('form-curso');
const inputNovoCurso = document.getElementById('novo-curso');
const alunosStatus = document.getElementById('alunos-status');
const sentinelaAlunos = document.getElementById('sentinela-alunos');

let modo = 'criar';
let raEditando = '';

const ALUNOS_POR_PAGINA = 5;
let alunosInicio = 0;
let alunosTotal = 0;
let alunosTemMais = false;
let alunosCarregando = false;
let alunosErro = false;
let alunosPedido = 0;

function mostrarMsg(texto, tipo = '') {
  msg.hidden = false;
  msg.textContent = texto;
  msg.className = 'msg' + (tipo ? ` ${tipo}` : '');
}

function criarBotao(texto, classes, aoClicar) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = texto;
  b.className = classes;
  b.onclick = aoClicar;
  return b;
}

async function listarCursos() {
  try {
    const resposta = await fetch('/cursos');
    const cursos = await resposta.json();

    if (!resposta.ok) {
      mostrarMsg(cursos.erro || 'Erro ao listar cursos', 'erro');
      tabelaCursos.innerHTML =
        '<tr><td colspan="3" class="vazio">Não foi possível carregar os cursos.</td></tr>';
      return;
    }

    montarTabelaCursos(cursos);
    preencherSelects(cursos);
  } catch (e) {
    mostrarMsg('Não consegui falar com a API. O servidor está rodando?', 'erro');
    tabelaCursos.innerHTML =
      '<tr><td colspan="3" class="vazio">Não foi possível carregar os cursos.</td></tr>';
  }
}

function montarTabelaCursos(cursos) {
  if (!cursos.length) {
    tabelaCursos.innerHTML =
      '<tr><td colspan="3" class="vazio">Nenhum curso cadastrado ainda.</td></tr>';
    return;
  }

  tabelaCursos.innerHTML = '';

  for (const curso of cursos) {
    const tr = document.createElement('tr');

    const tdNome = document.createElement('td');
    tdNome.textContent = curso.nome;

    const tdTotal = document.createElement('td');
    tdTotal.textContent = curso.total_alunos;

    const btnVer = criarBotao(
      'Ver alunos',
      'btn btn-secundario btn-pequeno',
      () => {
        filtroCurso.value = curso.id;
        listarAlunos(false);
      }
    );

    const btnExcluir = criarBotao(
      'Excluir',
      'btn btn-perigo btn-pequeno',
      () => excluirCurso(curso.id, curso.nome)
    );

    const tdAcoes = document.createElement('td');
    tdAcoes.className = 'acoes';
    tdAcoes.appendChild(btnVer);
    tdAcoes.appendChild(btnExcluir);

    tr.appendChild(tdNome);
    tr.appendChild(tdTotal);
    tr.appendChild(tdAcoes);
    tabelaCursos.appendChild(tr);
  }
}

function preencherSelects(cursos) {
  const filtroAtual = filtroCurso.value;
  const cursoAtual = selectCurso.value;

  filtroCurso.innerHTML = '<option value="">Todos os cursos</option>';
  selectCurso.innerHTML = '<option value="">Selecione um curso</option>';

  for (const curso of cursos) {
    filtroCurso.appendChild(new Option(curso.nome, curso.id));
    selectCurso.appendChild(new Option(curso.nome, curso.id));
  }

  filtroCurso.value = filtroAtual;
  selectCurso.value = cursoAtual;

  if (filtroCurso.selectedIndex === -1) filtroCurso.value = '';
  if (selectCurso.selectedIndex === -1) selectCurso.value = '';
}

async function adicionarCurso(evento) {
  evento.preventDefault();
  const nome = inputNovoCurso.value.trim();

  try {
    const resposta = await fetch('/cursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mostrarMsg(dados.erro || 'Erro ao cadastrar curso', 'erro');
      return;
    }

    inputNovoCurso.value = '';
    mostrarMsg(`Curso "${dados.nome}" cadastrado!`, 'ok');
    listarCursos();
  } catch (e) {
    mostrarMsg('Não consegui falar com a API.', 'erro');
  }
}

async function excluirCurso(id, nome) {
  if (!confirm(`Excluir o curso "${nome}"?`)) return;

  try {
    const resposta = await fetch('/cursos/' + id, {
      method: 'DELETE',
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mostrarMsg(dados.erro || 'Erro ao excluir curso', 'erro');
      return;
    }

    mostrarMsg('Curso excluído.', 'ok');
    atualizarTudo();
  } catch (e) {
    mostrarMsg('Não consegui falar com a API.', 'erro');
  }
}

function abrirModalCriar() {
  if (selectCurso.options.length <= 1) {
    mostrarMsg('Cadastre um curso antes de incluir alunos.', 'erro');
    return;
  }

  modo = 'criar';
  raEditando = '';
  modalTitulo.textContent = 'Novo aluno';
  form.reset();
  selectCurso.value = filtroCurso.value;
  inputRa.disabled = false;
  modal.hidden = false;
  inputNome.focus();
}

function abrirModalEditar(aluno) {
  modo = 'editar';
  raEditando = aluno.ra;
  modalTitulo.textContent = 'Editar aluno';
  inputNome.value = aluno.nome || '';
  inputRa.value = aluno.ra || '';
  selectCurso.value = aluno.curso_id;
  inputRa.disabled = true;
  modal.hidden = false;
  inputNome.focus();
}

function fecharModal() {
  modal.hidden = true;
  form.reset();
  inputRa.disabled = false;
}

function linhaAluno(aluno) {
  const tr = document.createElement('tr');

  const tdNome = document.createElement('td');
  tdNome.textContent = aluno.nome;

  const tdRa = document.createElement('td');
  tdRa.textContent = aluno.ra;

  const tdCurso = document.createElement('td');
  tdCurso.textContent = aluno.curso ? aluno.curso.nome : '—';

  const btnEditar = criarBotao(
    'Editar',
    'btn btn-secundario btn-pequeno',
    () => abrirModalEditar(aluno)
  );

  const btnExcluir = criarBotao(
    'Excluir',
    'btn btn-perigo btn-pequeno',
    () => excluirAluno(aluno.ra, aluno.nome)
  );

  const tdAcoes = document.createElement('td');
  tdAcoes.className = 'acoes';
  tdAcoes.appendChild(btnEditar);
  tdAcoes.appendChild(btnExcluir);

  tr.appendChild(tdNome);
  tr.appendChild(tdRa);
  tr.appendChild(tdCurso);
  tr.appendChild(tdAcoes);

  return tr;
}

function atualizarStatus() {
  if (alunosErro) {
    alunosStatus.textContent =
      'A lista não carregou. Use Atualizar lista para tentar de novo.';
  } else if (alunosCarregando && alunosInicio === 0) {
    alunosStatus.textContent = 'Carregando...';
  } else if (!alunosTotal && !alunosCarregando) {
    alunosStatus.textContent = 'Nenhum aluno para mostrar.';
  } else if (alunosCarregando) {
    alunosStatus.textContent =
      `Mostrando ${alunosInicio} de ${alunosTotal}. Carregando mais...`;
  } else if (alunosTemMais) {
    alunosStatus.textContent =
      `Mostrando ${alunosInicio} de ${alunosTotal}. Role a tela para carregar mais.`;
  } else {
    alunosStatus.textContent =
      `Mostrando ${alunosInicio} de ${alunosTotal}. Fim da lista.`;
  }
}

async function listarAlunos(acrescentar = false) {
  if (acrescentar && (alunosCarregando || !alunosTemMais)) return;

  const pedido = acrescentar ? alunosPedido : ++alunosPedido;
  const inicio = acrescentar ? alunosInicio : 0;

  alunosCarregando = true;
  alunosErro = false;

  if (!acrescentar) {
    alunosInicio = 0;
    alunosTotal = 0;
    alunosTemMais = false;
    tabela.innerHTML =
      '<tr><td colspan="4" class="vazio">Carregando...</td></tr>';
  }

  atualizarStatus();

  try {
    const cursoId = filtroCurso.value;
    const base = cursoId ? `/cursos/${cursoId}/alunos` : '/alunos';

    const resposta = await fetch(
      `${base}?inicio=${inicio}&limite=${ALUNOS_POR_PAGINA}`
    );

    const dados = await resposta.json();

    if (pedido !== alunosPedido) return;

    if (!resposta.ok) {
      throw new Error(dados.erro || 'Erro ao listar alunos');
    }

    const alunos = dados.alunos || [];
    alunosTotal = dados.total || 0;

    if (!acrescentar) tabela.innerHTML = '';

    if (!alunosTotal) {
      tabela.innerHTML =
        '<tr><td colspan="4" class="vazio">Nenhum aluno encontrado.</td></tr>';
      alunosTemMais = false;
      return;
    }

    for (const aluno of alunos) {
      tabela.appendChild(linhaAluno(aluno));
    }

    alunosInicio = inicio + alunos.length;
    alunosTemMais = alunosInicio < alunosTotal && alunos.length > 0;
  } catch (e) {
    if (pedido !== alunosPedido) return;

    alunosErro = true;
    alunosTemMais = false;
    mostrarMsg(e.message || 'Erro ao listar alunos', 'erro');

    if (!acrescentar) {
      tabela.innerHTML =
        '<tr><td colspan="4" class="vazio">Não foi possível carregar a lista.</td></tr>';
    }
  } finally {
    if (pedido === alunosPedido) {
      alunosCarregando = false;
      atualizarStatus();
      pedirMaisSeVisivel();
    }
  }
}

function pedirMaisSeVisivel() {
  if (!alunosTemMais || alunosCarregando || alunosErro) return;

  const topo = sentinelaAlunos.getBoundingClientRect().top;

  if (topo <= window.innerHeight + 160) {
    listarAlunos(true);
  }
}

async function salvarAluno(evento) {
  evento.preventDefault();

  const nome = inputNome.value.trim();
  const ra = inputRa.value.trim();
  const curso_id = Number(selectCurso.value);

  try {
    if (modo === 'criar') {
      const resposta = await fetch('/alunos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, ra, curso_id }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        mostrarMsg(dados.erro || 'Erro ao cadastrar', 'erro');
        return;
      }

      mostrarMsg('Aluno cadastrado com sucesso!', 'ok');
    } else {
      const resposta = await fetch(
        '/alunos/' + encodeURIComponent(raEditando),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, curso_id }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        mostrarMsg(dados.erro || 'Erro ao atualizar', 'erro');
        return;
      }

      if (!dados.length) {
        mostrarMsg('RA não encontrado', 'erro');
        return;
      }

      mostrarMsg('Aluno atualizado com sucesso!', 'ok');
    }

    fecharModal();
    atualizarTudo();
  } catch (e) {
    mostrarMsg('Não consegui falar com a API.', 'erro');
  }
}

async function excluirAluno(ra, nome) {
  if (!confirm(`Excluir o aluno "${nome}" (RA ${ra})?`)) return;

  try {
    const resposta = await fetch(
      '/alunos/' + encodeURIComponent(ra),
      {
        method: 'DELETE',
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      mostrarMsg(dados.erro || 'Erro ao excluir', 'erro');
      return;
    }

    mostrarMsg('Aluno excluído.', 'ok');
    atualizarTudo();
  } catch (e) {
    mostrarMsg('Não consegui falar com a API.', 'erro');
  }
}

async function atualizarTudo() {
  await listarCursos();
  await listarAlunos(false);
}

document.getElementById('btn-novo').addEventListener('click', abrirModalCriar);
document.getElementById('btn-atualizar').addEventListener('click', atualizarTudo);
document.getElementById('btn-cancelar').addEventListener('click', fecharModal);
document.getElementById('modal-fundo').addEventListener('click', fecharModal);
form.addEventListener('submit', salvarAluno);
formCurso.addEventListener('submit', adicionarCurso);
filtroCurso.addEventListener('change', () => listarAlunos(false));
window.addEventListener('scroll', pedirMaisSeVisivel);
window.addEventListener('resize', pedirMaisSeVisivel);

atualizarTudo();