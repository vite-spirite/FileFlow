FROM node:20.4.0-slim
RUN apt-get update -y && apt-get install -y openssl build-essential libpq-dev

RUN mkdir -p /app
WORKDIR /app

COPY package*.json /app
RUN npm install

COPY . /app
RUN npm i -g @nestjs/cli
RUN npm run build

CMD ["npm", "run", "start:prod"]