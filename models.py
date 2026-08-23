# Isso daqui serve como uma planta de uma casa antes de partimos para construção de uma casa é necessário um planta para saber onde têm que ficar tudo, é similar com esse sistema. Aqui reforçaremos aquilo que está no banco de dados
import uuid # Padrão uuid para os id sejam dificis de quebrar

#💀 Se eu não enloquecer, dá pra implementar o Alembic para evitar que troquem as informações
from sqlalchemy import Column, String, Integer, Text, ForeignKey, BINARY #TODOS os tipos no banco de dados estão aqui
from sqlalchemy.orm import relationship # Importação de chave secundária
from werkzeug.security import generate_password_hash, check_password_hash # Funções pra criar e verificar hash de senha
from database import Base


class Usuario(Base): #Classe do usuario
    __tablename__ = 'usuario'

    id = Column(BINARY(16), primary_key=True, default=lambda: uuid.uuid4().bytes)
    email = Column(String(150), nullable=False, unique=True)
    nome = Column(String(255), nullable=False)
    senha = Column(String(255), nullable=False)
    #Basicamente as mesmas informações do banco de dados
    # Conceitos basicos: primary_key a chave da tabela usuario
    #nullable = Não permite que fique em branco
    #unique = Não vou aceitar um email igual! 

    tarefas = relationship("Tarefa", back_populates="dono", cascade="all, delete")
    # Aqui é uma chave secundária que vai manter uma conexão com a tarefa
    # cascade: Se apagar o usuário faz sentido ter as tarefas dele? Pois é não faz sentido, por isso o cascade no momento que excluir o usuario vai excluir todas as tarefas. 

    def set_senha(self, senha_pura):
        # Recebe a senha em texto puro e salva só o hash (nunca a senha original)
        self.senha = generate_password_hash(senha_pura)

    def checar_senha(self, senha_pura):
        # Compara a senha digitada com o hash salvo, retorna True ou False
        return check_password_hash(self.senha, senha_pura)

    def to_dict(self):
        return {
            "id": self.id.hex(),  # bytes -> string hexadecimal (JSON não aceita bytes puro)
            "email": self.email,
            "nome": self.nome,
        }
 #Aqui é o que vai retornar no código JSON, não faz sentido aparecer para o cliente a senha dele por isso ele não retorna

class Tarefa(Base):
    __tablename__ = 'tarefas'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    usuario_id = Column(BINARY(16), ForeignKey("usuario.id"), nullable=False)
    titulo = Column(String(255), nullable=False)
    descricao = Column(Text)
    dono = relationship('Usuario', back_populates='tarefas')

    def to_dict(self):
        return {
            "id": self.id,
            "usuario_id": self.usuario_id.hex(),
            "titulo": self.titulo,
            "descricao": self.descricao,
        }