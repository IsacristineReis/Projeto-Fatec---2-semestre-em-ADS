const API_URL = "http://localhost:5000/notas";

const form = document.getElementById("form-nota");
const inputId = document.getElementById("nota-id");
const inputTitulo = document.getElementById("titulo");
const inputConteudo = document.getElementById("conteudo");
const listaNotas = document.getElementById("lista-notas");

// Carrega as notas assim que a página abre
document.addEventListener("DOMContentLoaded", carregarNotas);

// Envio do formulário (serve tanto para criar quanto para editar)
form.addEventListener("submit", async (event) => {
  event.preventDefault(); // evita que a página recarregue

  const id = inputId.value;
  const titulo = inputTitulo.value;
  const conteudo = inputConteudo.value;

  if (id) {
    // se tem id, é edição
    await editarNota(id, titulo, conteudo);
  } else {
    // se não tem id, é criação
    await criarNota(titulo, conteudo);
  }

  limparFormulario();
  carregarNotas();
});

// ----- FUNÇÕES DE API -----

async function carregarNotas() {
  const resposta = await fetch(API_URL);
  const notas = await resposta.json();
  renderizarNotas(notas);
}

async function criarNota(titulo, conteudo) {
  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titulo, conteudo })
  });
}

async function editarNota(id, titulo, conteudo) {
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titulo, conteudo })
  });
}

async function excluirNota(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });
  carregarNotas();
}

// ----- FUNÇÕES DE INTERFACE -----

function renderizarNotas(notas) {
  listaNotas.innerHTML = ""; // limpa a lista antes de recriar

  notas.forEach((nota) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${nota.titulo}</strong>
      <p>${nota.conteudo}</p>
      <button onclick="preencherFormulario(${nota.id}, '${nota.titulo}', '${nota.conteudo}')">Editar</button>
      <button onclick="excluirNota(${nota.id})">Excluir</button>
    `;

    listaNotas.appendChild(li);
  });
}

function preencherFormulario(id, titulo, conteudo) {
  inputId.value = id;
  inputTitulo.value = titulo;
  inputConteudo.value = conteudo;
}

function limparFormulario() {
  inputId.value = "";
  inputTitulo.value = "";
  inputConteudo.value = "";
}