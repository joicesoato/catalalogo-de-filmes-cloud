# Cadastro de Clientes — ISW055

Projeto simples inspirado na tela de cadastro da atividade de Introdução à Computação em Nuvem.

## Tecnologias

- Node.js + Express
- MySQL
- HTML, CSS e JavaScript
- Docker
- GitHub Codespaces

## Segurança

As credenciais do MySQL NÃO ficam no código e NÃO devem ser enviadas para o GitHub.

Crie um arquivo `.env` a partir de `.env.example` e preencha:

```env
DB_HOST=...
DB_PORT=3306
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
PORT=3000
```

O `.gitignore` já impede o envio do `.env`.

## Rodar no Codespaces

```bash
npm install
npm start
```

Depois abra a porta 3000 na aba PORTS e clique em "Open in Browser".

## Rodar com Docker

```bash
docker compose up --build
```

Para parar e remover o container:

```bash
docker compose down
```

## Importante sobre persistência

O código do projeto fica no GitHub/Codespace. O container Docker não possui volume local para os dados da aplicação.

Porém, o MySQL informado pela disciplina é um banco remoto e seus registros continuam nele mesmo depois que o container ou o Codespace é desligado.

Se a intenção for apagar também os registros do banco, isso precisa ser feito no MySQL — não é automático e não deve ser configurado como comportamento padrão.

## Publicação no Portainer

A imagem pode ser criada com:

```bash
docker build -t SEU_USUARIO/cadastro-clientes:latest .
docker push SEU_USUARIO/cadastro-clientes:latest
```

No Portainer, use a porta de host reservada pela disciplina e mapeie para a porta `3000` do container.

Exemplo genérico:

```text
PORTA_DA_DISCIPLINA:3000
```

Não copie uma porta de exemplo de outra pessoa. Use somente a porta reservada para sua conta.