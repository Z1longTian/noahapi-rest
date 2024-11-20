FROM alpine:latest
RUN apk add --no-cache nodejs npm

WORKDIR /noahapi

ENV NODE_ENV production
ENV PORT 8000
ENV ADMINS 0x881bb1aeDFe576945EE3801954E9e0DE13d9606C
ENV API_KEY 37b20687-e0c7-4208-bc34-16284cd26ecf
ENV MONGODB_URI mongodb+srv://noah:Noah@noahmongodb.gdgpp.mongodb.net/
ENV NODE_PROVIDER https://necessary-fluent-general.bsc-testnet.quiknode.pro/a661861737050eacc06c78004a1d06bb7a0e4768

COPY package*.json ./

RUN npm install

COPY . . 

EXPOSE 8000

CMD node index.js
