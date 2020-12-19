FROM node:12-slim

WORKDIR /starter
ENV NODE_ENV development

COPY package.json /starter/package.json

RUN npm install --production

COPY .env /starter/.env
COPY . /starter

CMD ["npm","start"]

EXPOSE 8080
