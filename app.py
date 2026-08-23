from flask import Flask, request, jsonify #importações para trabalharmos com flask
from flask_cors import CORS
from database import engine, Base, SessionLocal #Tudo que vaio ser importado do banco de dados
from models import Usuario, Tarefa # importando a tarefa
import uuid # importando o id

app = Flask(__name__)
CORS(app)  
Base.metadata.create_all(bind=engine) # para criar tudo qque etsá na classe Base


def get_session():
    return SessionLocal()



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


if __name__ == '__main__':
    app.run(debug=True)