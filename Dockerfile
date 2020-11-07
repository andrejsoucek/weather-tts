FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN apt-get update
RUN apt-get install -y mpg123

COPY . .

EXPOSE 5000

ENV GOOGLE_APPLICATION_CREDENTIALS=auth.json

RUN cp config/config.example.yml config/config.yml
RUN npm run build

CMD [ "npm", "start" ]
