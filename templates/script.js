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


// =============  JavaScript do Formulário  ==============/

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

function temp() {
  document.getElementById("doodle-btn").innerHTML = "Salvando...";
  setTimeout(() => {
    document.getElementById("doodle-btn").innerHTML = "Salvar nota";
  }, 2000);
}

// === fomulário de login === /





// === Botão dark e light ===
const darkLightBtn = document.querySelector('.darkLight');

darkLightBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});



// === API DO CLIMA == //
document.addEventListener("DOMContentLoaded", () => {
    const API_KEY = "d1152b4d99c4edc0bc1e545ecb55cecf";

    const openBtn = document.getElementById("openWeatherBtn");
    const closeBtn = document.getElementById("closeWeather");
    const overlay = document.getElementById("weatherOverlay");
    const form = document.getElementById("weatherForm");
    const cityInput = document.getElementById("cityInput");
    const resultBox = document.getElementById("weatherResult");

    openBtn.addEventListener("click", () => {
        overlay.classList.add("active");
        cityInput.focus();
    });

    closeBtn.addEventListener("click", () => {
        overlay.classList.remove("active");
    });

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.classList.remove("active");
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const city = cityInput.value.trim();
        if (!city) return;

        resultBox.innerHTML = `<p class="weather-placeholder">Buscando...</p>`;

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pt_br`
            );

            if (!response.ok) throw new Error("Local não encontrado");

            const data = await response.json();
            renderWeather(data);
        } catch (error) {
            resultBox.innerHTML = `<p class="weather-error">Não foi possível encontrar "${city}". Verifique o nome e tente novamente.</p>`;
        }
    });

    function renderWeather(data) {
        const { name, sys, main, weather, wind } = data;
        const icon = weather[0].icon;
        const description = weather[0].description;

        resultBox.innerHTML = `
            <p class="weather-city">${name}, ${sys.country}</p>
            <img class="weather-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />
            <p class="weather-temp">${Math.round(main.temp)}°C</p>
            <p class="weather-desc">${description}</p>
            <div class="weather-details">
                <span>Sensação: ${Math.round(main.feels_like)}°C</span>
                <span>Umidade: ${main.humidity}%</span>
                <span>Vento: ${wind.speed} m/s</span>
            </div>
        `;
    }
});