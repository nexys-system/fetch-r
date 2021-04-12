FROM node:13.8.0-alpine

ARG GIT_SHA 
ENV GIT_SHA_ENV=$GIT_SHA

COPY package.json package.json

RUN yarn install
RUN mkdir assets

# note the compilation is done outside 
COPY dist dist
RUN echo "git sha $GIT_SHA_ENV"

ENV NODE_ENV=production

# run with arg to be able to display the SHA in the app
CMD yarn start $GIT_SHA_ENV
