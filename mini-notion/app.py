from flask import Flask, request, jsonify, render_template, redirect, url_for #importações para trabalharmos com flask
from flask_cors import CORS
from database import engine, Base, SessionLocal #Tudo que vaio ser importado do banco de dados
from models import Usuario, Tarefa, Nota # importando a tarefa e a nota
from functools import wraps # para criar o decorator de login_required
import uuid # importando o id
import secrets # para gerar o token de login

app = Flask(__name__)  # templates/ e static/ já são as pastas padrão do Flask
CORS(app)  
Base.metadata.create_all(bind=engine) # para criar tudo qque etsá na classe Base



@app.route('/')
def home():
    # Antes retornava só um texto. Agora manda direto para a tela de login.
    return redirect(url_for('login_page'))


@app.route('/login.html')
def login_page():
    return render_template('login.html')


@app.route('/signup.html')
def signup_page():
    return render_template('signup.html')


@app.route('/index.html')
def index_page():
    return render_template('index.html')


def get_session():
    return SessionLocal()


def login_required(rota):
   
    @wraps(rota)
    def wrapper(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        token = auth.split('Bearer ')[-1] if auth.startswith('Bearer ') else None

        if not token:
            return jsonify({"erro": "Login necessário"}), 401

        session = get_session()
        usuario = session.query(Usuario).filter_by(token=token).first()
        session.close()

        if not usuario:
            return jsonify({"erro": "Sessão inválida, faça login novamente"}), 401

        # Deixa o id do usuário logado disponível pra rota usar
        request.usuario_id_logado = usuario.id
        return rota(*args, **kwargs)

    return wrapper



#Metodo de criação do usúario 
@app.route('/usuarios', methods=['POST'])
def criar_usuario():
    dados = request.get_json()
    session = get_session()

    if session.query(Usuario).filter_by(email=dados.get('email')).first():
        session.close()
        return jsonify({"erro": "Email já cadastrado"}), 409 # Caso já cadastrado um email igual vai devolver 409 - 409 Conflict (Conflito)

    novo_usuario = Usuario(
        email=dados['email'], #estamos tranformando isso em objeto
        nome=dados['nome']
    )
    novo_usuario.set_senha(dados['senha']) # Trtamento comum para hash de cnta

    session.add(novo_usuario)
    session.commit()
    resultado = novo_usuario.to_dict()
    session.close()

    return jsonify(resultado), 201
 #retornará pra api 201 - Referente a criação
# Lista o usuarios
@app.route('/usuarios/<usuario_id>', methods=['GET'])
def buscar_usuario(usuario_id):
    #Aqui ele vai filtrar com base no id do usuário
    session = get_session()
    usuario = session.query(Usuario).filter_by(id=uuid.UUID(usuario_id).bytes).first()
    session.close()

    if not usuario:
        return jsonify({"erro": "Usuário não encontrado"}), 404

    return jsonify(usuario.to_dict())


#Criaçaõ da tarefa
@app.route('/usuarios/<usuario_id>/tarefas', methods=['POST'])
def criar_tarefa(usuario_id):
    dados = request.get_json()
    session = get_session()

    usuario = session.query(Usuario).filter_by(id=uuid.UUID(usuario_id).bytes).first()
    #Filtro de poder acessar as tarefas só com id do usario
    if not usuario:
        session.close()
        return jsonify({"erro": "Usuário não encontrado"}), 404
        #caso nenhum usúario for encontrado
    nova_tarefa = Tarefa(
        usuario_id=usuario.id,
        titulo=dados['titulo'],
        descricao=dados.get('descricao')
    )

    session.add(nova_tarefa)
    session.commit()
    resultado = nova_tarefa.to_dict()
    session.close()

    return jsonify(resultado), 201


@app.route('/usuarios/<usuario_id>/tarefas', methods=['GET'])
def listar_tarefas(usuario_id):
    session = get_session()
    tarefas = session.query(Tarefa).filter_by(usuario_id=uuid.UUID(usuario_id).bytes).all()
    resultado = [t.to_dict() for t in tarefas]
    session.close()

    return jsonify(resultado)

@app.route('/usuarios/<usuario_id>/tarefas/<int:tarefa_id>', methods=['PUT'])
def editar_tarefa(usuario_id, tarefa_id):
    dados = request.get_json()
    session = get_session()

    tarefa = session.query(Tarefa).filter_by(id=tarefa_id, usuario_id=uuid.UUID(usuario_id).bytes).first()
    if not tarefa:
        session.close()
        return jsonify({"erro": "Tarefa não encontrada"}), 404

    tarefa.titulo = dados.get('titulo', tarefa.titulo)
    tarefa.descricao = dados.get('descricao', tarefa.descricao)

    session.commit()
    resultado = tarefa.to_dict()
    session.close()

    return jsonify(resultado)


@app.route('/usuarios/<usuario_id>/tarefas/<int:tarefa_id>', methods=['DELETE'])
def deletar_tarefa(usuario_id, tarefa_id):
    session = get_session()

    tarefa = session.query(Tarefa).filter_by(id=tarefa_id, usuario_id=uuid.UUID(usuario_id).bytes).first()
    if not tarefa:
        session.close()
        return jsonify({"erro": "Tarefa não encontrada"}), 404

    session.delete(tarefa)
    session.commit()
    session.close()

    return jsonify({"mensagem": "Tarefa deletada com sucesso"})


#Rota de LOGIN - confere email + senha (ainda não existia)
@app.route('/login', methods=['POST'])
def login():
    dados = request.get_json()
    session = get_session()

    usuario = session.query(Usuario).filter_by(email=dados.get('email')).first()

    if not usuario or not usuario.checar_senha(dados.get('senha', '')):
        session.close()
        return jsonify({"erro": "Email ou senha inválidos"}), 401

    # Gera um token novo a cada login (login antigo fica inválido)
    usuario.token = secrets.token_hex(32)
    session.commit()

    resultado = usuario.to_dict()
    resultado['token'] = usuario.token
    session.close()
    return jsonify(resultado), 200


# Rota de LOGOUT - invalida o token no servidor (o front também deve descartar o token dele)
@app.route('/logout', methods=['POST'])
@login_required
def logout():
    session = get_session()
    usuario = session.query(Usuario).filter_by(id=request.usuario_id_logado).first()
    if usuario:
        usuario.token = None
        session.commit()
    session.close()
    return jsonify({"mensagem": "Logout realizado com sucesso"})


#Rotas de NOTAS - é o que o script.js (front) chama
# Todas exigem @login_required agora, e cada usuário só vê/mexe nas próprias notas
@app.route('/notas', methods=['GET'])
@login_required
def listar_notas():
    session = get_session()
    notas = session.query(Nota).filter_by(usuario_id=request.usuario_id_logado).all()
    resultado = [n.to_dict() for n in notas]
    session.close()
    return jsonify(resultado)


@app.route('/notas', methods=['POST'])
@login_required
def criar_nota():
    dados = request.get_json()
    session = get_session()

    nova_nota = Nota(
        usuario_id=request.usuario_id_logado,
        titulo=dados['titulo'],
        conteudo=dados.get('conteudo')
    )

    session.add(nova_nota)
    session.commit()
    resultado = nova_nota.to_dict()
    session.close()

    return jsonify(resultado), 201


@app.route('/notas/<int:nota_id>', methods=['PUT'])
@login_required
def editar_nota(nota_id):
    dados = request.get_json()
    session = get_session()

    nota = session.query(Nota).filter_by(id=nota_id, usuario_id=request.usuario_id_logado).first()
    if not nota:
        session.close()
        return jsonify({"erro": "Nota não encontrada"}), 404

    nota.titulo = dados.get('titulo', nota.titulo)
    nota.conteudo = dados.get('conteudo', nota.conteudo)

    session.commit()
    resultado = nota.to_dict()
    session.close()

    return jsonify(resultado)


@app.route('/notas/<int:nota_id>', methods=['DELETE'])
@login_required
def deletar_nota(nota_id):
    session = get_session()

    nota = session.query(Nota).filter_by(id=nota_id, usuario_id=request.usuario_id_logado).first()
    if not nota:
        session.close()
        return jsonify({"erro": "Nota não encontrada"}), 404

    session.delete(nota)
    session.commit()
    session.close()

    return jsonify({"mensagem": "Nota deletada com sucesso"})


if __name__ == '__main__':
    app.run(debug=True)