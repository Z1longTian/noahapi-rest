FROM alpine:latest
RUN apk add --no-cache nodejs npm

WORKDIR /noahapi

ENV NODE_ENV production
ENV PORT 8000
ENV ADMINS 0x881bb1aeDFe576945EE3801954E9e0DE13d9606C
ENV API_KEY 37b20687-e0c7-4208-bc34-16284cd26ecf
ENV MONGODB_URI mongodb+srv://woodman:yy6Y8mzBK18OAYZG@noahseverless.vwxjk.mongodb.net/noah?retryWrites=true&w=majority
ENV NODE_PROVIDER https://twilight-billowing-hill.bsc-testnet.discover.quiknode.pro/8857e03b6f31911b688b5123b1471492b83152ff/

COPY package*.json ./

RUN npm install

COPY . . 

EXPOSE 8000

CMD node index.js