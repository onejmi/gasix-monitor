FROM node:16.4.2

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . .

ENV PORT=3000

EXPOSE 3000

CMD [ "npm", "start" ]
