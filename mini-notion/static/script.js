// ======================================================
// mini-Notion — front-end conectado ao backend Flask real
// (usuarios, login com token, notas por usuário no MySQL)
// ======================================================

const API_URL = ""; // mesma origem: front e back são servidos pelo mesmo Flask

function getToken() {
  return localStorage.getItem("token");
}

function getUsuario() {
  const raw = localStorage.getItem("usuario");
  return raw ? JSON.parse(raw) : null;
}

function salvarSessao(usuario) {
  // usuario vem do backend com { id, email, nome, token }
  localStorage.setItem("token", usuario.token);
  localStorage.setItem(
    "usuario",
    JSON.stringify({ id: usuario.id, email: usuario.email, nome: usuario.nome })
  );
}

function limparSessao() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}

function authHeaders() {
  const token = getToken();
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

function showMessage(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = `form-message ${type}`;
}

// ============== FORMULÁRIO DE LOGIN (login.html) ==============

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const formMessage = document.getElementById("formMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const senha = passwordInput.value;

    if (!email || !senha) {
      showMessage(formMessage, "Preencha todos os campos.", "error");
      return;
    }

    const submitBtn = form.querySelector(".btn_formLogin");
    submitBtn.disabled = true;
    submitBtn.textContent = "Entrando...";

    try {
      const resposta = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        showMessage(formMessage, dados.erro || "Email ou senha inválidos.", "error");
        return;
      }

      salvarSessao(dados);
      showMessage(formMessage, "Login realizado! Redirecionando...", "success");
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 600);
    } catch (erro) {
      showMessage(formMessage, "Não foi possível conectar ao servidor.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Acessar o mini-Notion";
    }
  });
});

// ============== FORMULÁRIO DE CRIAR CONTA (signup.html) ==============

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");
  if (!form) return;

  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const formMessage = document.getElementById("formMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const senha = passwordInput.value;

    if (!nome || !email || !senha) {
      showMessage(formMessage, "Preencha todos os campos.", "error");
      return;
    }

    if (senha.length < 6) {
      showMessage(formMessage, "A senha precisa ter pelo menos 6 caracteres.", "error");
      return;
    }

    const submitBtn = form.querySelector(".btn_formLogin");
    submitBtn.disabled = true;
    submitBtn.textContent = "Criando conta...";

    try {
      // Cria o usuário no backend (rota real: POST /usuarios)
      const respostaCriar = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });

      const dadosCriar = await respostaCriar.json();

      if (!respostaCriar.ok) {
        showMessage(formMessage, dadosCriar.erro || "Erro ao criar conta.", "error");
        return;
      }

      // Loga automaticamente depois de criar a conta
      const respostaLogin = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const dadosLogin = await respostaLogin.json();

      if (!respostaLogin.ok) {
        // Conta criada mas login falhou por algum motivo: manda para tela de login
        showMessage(formMessage, "Conta criada! Faça login para continuar.", "success");
        setTimeout(() => (window.location.href = "/login.html"), 1000);
        return;
      }

      salvarSessao(dadosLogin);
      showMessage(formMessage, "Conta criada com sucesso!", "success");
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 800);
    } catch (erro) {
      showMessage(formMessage, "Não foi possível conectar ao servidor. Tente novamente.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Criar uma conta";
    }
  });
});

// ============== PÁGINA PRINCIPAL / NOTAS (index.html) ==============

const form = document.getElementById("form-nota");

if (form) {
  // Só roda essa parte dentro da index.html

  // Exige login: sem token, manda de volta pra tela de login
  if (!getToken()) {
    window.location.href = "/login.html";
  } else {
    const usuario = getUsuario();
    const userNameEl = document.getElementById("userName");
    if (userNameEl && usuario) {
      userNameEl.textContent = usuario.nome;
    }
  }

  const inputId = document.getElementById("nota-id");
  const inputTitulo = document.getElementById("titulo-form");
  const inputConteudo = document.getElementById("conteudo-form");
  const listaNotas = document.getElementById("lista-notas");

  document.addEventListener("DOMContentLoaded", carregarNotas);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    temp();

    const id = inputId.value;
    const titulo = inputTitulo.value;
    const conteudo = inputConteudo.value;

    if (!titulo.trim()) return;

    if (id) {
      await editarNota(id, titulo, conteudo);
    } else {
      await criarNota(titulo, conteudo);
    }

    limparFormulario();
    carregarNotas();
  });

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await fetch(`${API_URL}/logout`, {
          method: "POST",
          headers: authHeaders(),
        });
      } catch (erro) {
        // mesmo se der erro de rede, ainda limpa a sessão local
      }
      limparSessao();
      window.location.href = "/login.html";
    });
  }
}

// ----- FUNÇÕES DE API (notas) -----

async function carregarNotas() {
  const resposta = await fetch(`${API_URL}/notas`, { headers: authHeaders() });

  if (resposta.status === 401) {
    limparSessao();
    window.location.href = "/login.html";
    return;
  }

  const notas = await resposta.json();
  renderizarNotas(notas);
}

async function criarNota(titulo, conteudo) {
  await fetch(`${API_URL}/notas`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ titulo, conteudo }),
  });
}

async function editarNota(id, titulo, conteudo) {
  await fetch(`${API_URL}/notas/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ titulo, conteudo }),
  });
}

async function excluirNota(id) {
  await fetch(`${API_URL}/notas/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  carregarNotas();
}

// ----- FUNÇÕES DE INTERFACE -----

//Teste ele fica abaixo do : <strong>${nota.titulo}</strong>
//<p>${nota.conteudo ?? ""}</p>

function renderizarNotas(notas) {
  const listaNotas = document.getElementById("lista-notas");
  if (!listaNotas) return;
  listaNotas.innerHTML = "";

  notas.forEach((nota) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${nota.titulo}</strong>
      <button class="edit-btn" type="button" onclick="preencherFormulario(${nota.id}, '${escapeAttr(nota.titulo)}', '${escapeAttr(nota.conteudo ?? "")}')">Examinar</button>
      <button class="delete-btn" type="button" onclick="excluirNota(${nota.id})">Excluir</button>
    `;

    listaNotas.appendChild(li);
  });
}

function escapeAttr(texto) {
  return String(texto).replace(/'/g, "\\'").replace(/\n/g, " ");
}

function preencherFormulario(id, titulo, conteudo) {
  document.getElementById("nota-id").value = id;
  document.getElementById("titulo-form").value = titulo;
  document.getElementById("conteudo-form").value = conteudo;
}

function limparFormulario() {
  document.getElementById("nota-id").value = "";
  document.getElementById("titulo-form").value = "";
  document.getElementById("conteudo-form").value = "";
}

function temp() {
  const btn = document.querySelector(".doodle-btn");
  if (!btn) return;
  btn.innerHTML = "Salvando...";
  setTimeout(() => {
    btn.innerHTML = "Salvar nota";
  }, 1000);
}

// === Botão dark e light ===
document.addEventListener("DOMContentLoaded", () => {
  const darkLightBtn = document.querySelector(".darkLight");
  if (darkLightBtn) {
    darkLightBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
    });
  }
});

// === API DO CLIMA (independente do login) === //
document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "d1152b4d99c4edc0bc1e545ecb55cecf";

  const openBtn = document.getElementById("openWeatherBtn");
  const closeBtn = document.getElementById("closeWeather");
  const overlay = document.getElementById("weatherOverlay");
  const weatherForm = document.getElementById("weatherForm");
  const cityInput = document.getElementById("cityInput");
  const resultBox = document.getElementById("weatherResult");

  if (!openBtn || !overlay || !weatherForm) return;

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

  weatherForm.addEventListener("submit", async (e) => {
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
