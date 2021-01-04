FROM node:14.15-alpine3.12

ARG TARGETPLATFORM

RUN set -eux; \
  apk update ; \
  case "$TARGETPLATFORM" in \
    linux/arm/v7) apk add --no-cache --virtual .build-instamate curl bash python3 python2 make g++ ;; \
    linux/arm/v6) apk add --no-cache --virtual .build-instamate curl bash python2 make g++ ;; \
    linux/amd64) apk add --no-cache --virtual .build-instamate curl bash make g++ ;; \
  esac;

WORKDIR /starter
ENV NODE_ENV development

COPY package.json /starter/package.json

RUN npm install --production

COPY . /starter

# remove development dependencies
RUN npm prune --production

RUN set -eux; \
  apk del .build-instamate; \
  rm -rf /var/cache/apk/*

EXPOSE 8080

CMD ["npm","start"]