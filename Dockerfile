FROM node:10-alpine

ARG FRONT_OFFICE_BASEURL="http://localhost"
ENV FRONT_OFFICE_BASEURL=${FRONT_OFFICE_BASEURL}
ENV NODE_ENV production

RUN apk add --no-cache su-exec

RUN mkdir /cartoscpo

COPY package.json package-lock.json webpack.config.js /cartoscpo/
COPY config  /cartoscpo/config
COPY server  /cartoscpo/server
COPY back-office  /cartoscpo/back-office
COPY bin  /cartoscpo/bin

WORKDIR /cartoscpo/

RUN npm install --no-production \
    && npm run bo:build \
    && npm prune --production \
    && npm --force cache clean

COPY ./docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["su-exec", "node:node", "/usr/local/bin/node", "server/index.js"]
