FROM node:14 as build

ENV GOOGLE_APPLICATION_CREDENTIALS=auth.json
EXPOSE 5000

RUN apt-get update && \
	apt-get install -y mpg123 && \
	apt-get clean && \
	rm -fr /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /usr/src/app

COPY ./tsconfig.json /usr/src/app/tsconfig.json
COPY ./.eslintrc.js /usr/src/app/.eslintrc.js

COPY ./package.json /usr/src/app/package.json
COPY ./package-lock.json /usr/src/app/package-lock.json

COPY ./config /usr/src/app/config
COPY ./migrations /usr/src/app/migrations
COPY ./src /usr/src/app/src
COPY ./views /usr/src/app/views
COPY ./test /usr/src/app/test

RUN cp config/config.example.yml config/config.yml


##################### Dev #################
FROM build as develop
WORKDIR /usr/src/app

COPY ./dev-entrypoint.sh /

CMD ["/dev-entrypoint.sh"]

##################### Prod ################
FROM build as production
WORKDIR /usr/src/app

RUN npm ci && npm run build

CMD [ "npm", "start" ]

