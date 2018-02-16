FROM node:9-alpine

RUN apk add --no-cache curl

WORKDIR /opt/ofirehose
COPY . /opt/ofirehose

RUN npm install
RUN npm run build

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["/opt/ofirehose/bin/dumb-init", "--"]
CMD ["npm", "start"]
