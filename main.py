from flask import Flask, request, jsonify           #request deixa ler o que o frontend envia quando o usuário faaz um post ou put
                                                    #jsonify transfora dicionario/lista em json de verdade na resposta HTTP
app = Flask(__name__)

notas = []              #Está fazendo o papel do banco de dados por enquanto
proximo_id = 1          #Contador manual enquanto estamos sem o banco de dados

@app.route("/")         #Decorator, quando acessarem a página principal, executa a função abaixo
def home():
    return "API do Sistema de Anotações está rodando!"

@app.route("/notas", methods=["GET"])       #O decorator indica que quando alguém acessar /notas com o método get, vai executar a funçãodef listar_notas()
def listar_notas():
    return jsonify(notas)                   #pega a lista de notas e devolve como resposta HTTP em formato JSON

@app.route("/notas", methods=["POST"])
def criar_notas():
    global proximo_id                       #variavel de fora da função
    dados = request.get_json()              #lê o corpo da requisição feita pelo frontend, trnansforma o dicionario recebido em um dicionário

    nova_nota = {
        "id": proximo_id,
        "titulo": dados.get("titulo"),      #.get() devolve None se a chave não exisitr e não quebra o programa
        "conteudo": dados.get("conteudo")   
    }

    notas.append(nova_nota)                 #Estou guardando a nova no "banco de dados" e adicionando +1 no id para não repetir
    proximo_id += 1

    return jsonify(nova_nota), 201

@app.route("/notas/<int:nota_id>", methods=["GET"])     #<int:nota_id> é uma variavel de rota, qualquer coisa que vier na URL é capturada e passada para função, o int faz com que o flask só aceite se for numeros, caso não seja, o flask devolve um erro
def obter_nota(nota_id):
    for nota in notas:
        if nota["id"] == nota_id:
            return jsonify(nota)
    return jsonify({"erro": "Nota não encontrada"}), 404

if __name__ == "__main__":
    app.run(debug=True)         #Reinicia o servidor sozinho a cada mudança no código e mostra erros detalhados no navegador.