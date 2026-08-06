from flask import Flask

app = Flask(__name__)

@app.route("/")         #Decorator, quando acessarem a página principal, executa a função abaixo
def home():
    return "API do Sistema de Anotações está rodando!"

if __name__ == "__main__":
    app.run(debug=True)         #Reinicia o servidor sozinho a cada mudança no código e mostra erros detalhados no navegador.