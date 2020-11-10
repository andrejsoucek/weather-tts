FROM node:14

ENV GOOGLE_APPLICATION_CREDENTIALS=auth.json
EXPOSE 5000

RUN apt-get update && \
	apt-get install -y mpg123 && \
	apt-get clean && \
	rm -fr /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN cp config/config.example.yml config/config.yml && \
	npm run build

CMD [ "npm", "start" ]
