#!/bin/sh
if [ -z "$(ls /usr/src/app/node_modules)" ]; then # npm bug workaround; initialize node_modules
	npm i >/dev/null 2>&1
fi
npm ci && npm run dev
