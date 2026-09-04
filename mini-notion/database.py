#Aqui vamos estabelecer uma conexão com o banco de dados e a env
from sqlalchemy import create_engine # Ponte de comunicação entre o banco de dados e código 
from sqlalchemy.orm import sessionmaker, declarative_base # Basicamente entramos em POO todos os arquivos criados vão herdar a classe base
from urllib.parse import quote_plus # Pra caso alguma senha tiver algum caracter especial nãio dar b.o

import os 
from dotenv import load_dotenv # Aqui estamos usando uma função para importar todas as tabelas da env

load_dotenv() 
db_host = os.getenv("DB_HOST") #Isso mantém os dados do banco seguro e dificil de quebrar
db_port = os.getenv("DB_PORT")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_name = os.getenv("DB_NAME")

db_password_escaped = quote_plus(db_password) if db_password else ""
# Caso a pessoa digitar um carcter especial a senha substituira pra algo que o computador consiga ler 
engine = create_engine(
    f"mysql+pymysql://{db_user}:{db_password_escaped}@{db_host}:{db_port}/{db_name}",
    echo=True,
    pool_pre_ping=True, 
) #Aqui é a criação da conexão do banco de dados. Importante: Cada banco de dados tem uma pequena difereneça então caso a pessoa queira fazer em MongoDb é necessário substituir a url
 # https://docs.sqlalchemy.org/en/20/core/engines.html#database-urls Site oficial com todas as url
SessionLocal = sessionmaker(bind=engine) # Gerencia as transições de informações com segurança 
Base = declarative_base() # Cria uma classe "Pai" para conectar as classes do python com o banco de dados 


def get_db():
    db = SessionLocal()
    try: #Todo esse bloco de de código evita que no momento de um cadastro de informação, que ela seja finalizada no final, para evitar fins de vazamento de informação.
        yield db 
    finally:
        db.close()