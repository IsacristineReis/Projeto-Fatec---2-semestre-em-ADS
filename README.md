# Projeto-Fatec---2-semestre-em-ADS
# Sistema de Anotações

Sistema web simples para criar, visualizar, editar e excluir anotações (CRUD), com interface visual própria e um widget de clima consumindo uma API externa gratuita.

**Objetivo do projeto:** aprender, na prática, os fundamentos de backend, banco de dados, frontend e consumo de API, trabalhando em equipe com Git.

## Funcionalidades (escopo)

- [ ] Lista de anotações (título + conteúdo)
- [ ] Criar nova anotação
- [ ] Editar anotação existente
- [ ] Excluir anotação
- [ ] Visualizar anotações (lista e/ou detalhe)
- [ ] Widget de clima na tela, usando API externa


## Stack técnica

| Camada | Tecnologia |
| --- | --- |
| Backend | Python + Flask |
| Banco de dados | SQLite |
| Frontend | HTML + CSS + JavaScript |
| API externa | OpenWeatherMap (clima) |
| Versionamento | Git + GitHub |

## Como rodar o projeto localmente

### Pré-requisitos

- Python 3.10+ instalado

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/IsacristineReis/Projeto-Fatec---2-semestre-em-ADS.git
cd Projeto-Fatec---2-semestre-em-ADS

# 2. Crie e ative o ambiente virtual
python -m venv venv

# Windows (Git Bash)
source venv/Scripts/activate
# Windows (PowerShell)
venv\Scripts\Activate.ps1
# Mac/Linux
source venv/bin/activate

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Rode o servidor
python main.py
```

## Fluxo de trabalho com Git

- Não commitar diretamente na branch `main`
- Criar uma branch por funcionalidade/pessoa, seguindo o padrão `area/descricao` (ex: `backend/rotas-crud`, `frontend/tela-lista`)
- Abrir Pull Request para revisão antes de mesclar com a `main`

## Status do projeto

🎉 Finalizado.
