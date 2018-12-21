FROM node:carbon-alpine


ARG FRONT_OFFICE_BASEURL="http://localhost"
ENV FRONT_OFFICE_BASEURL=${FRONT_OFFICE_BASEURL}
ENV NODE_ENV production

RUN apk add --no-cache su-exec

RUN mkdir /cartoscpo

COPY package.json webpack.config.js /cartoscpo/

RUN cd /cartoscpo \
    && npm --quiet install \
    && npm --force cache clean 

COPY config  /cartoscpo/config
COPY server  /cartoscpo/server
COPY back-office  /cartoscpo/back-office
COPY bin  /cartoscpo/bin

WORKDIR /cartoscpo/

RUN npm install --only=dev webpack babel-core babel-loader babel-preset-env babel-plugin-transform-class-properties style-loader raw-loader html-minify-loader css-loader \
    && /cartoscpo/node_modules/webpack/bin/webpack.js \
    && npm uninstall webpack babel-core babel-loader babel-preset-env style-loader raw-loader html-minify-loader css-loader \ 
    && npm --force cache clean 
 
COPY ./docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["su-exec", "node:node", "/usr/local/bin/node", "server/index.js"] 
