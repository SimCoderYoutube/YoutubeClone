# base image
FROM node:12.2.0

# set working directory
WORKDIR /app

# install and cache app dependencies
COPY package*.json ./

RUN npm install --quiet

COPY ./src ./src
COPY ./config ./config
COPY app.js ./

RUN npm install -g nodemon

RUN npm -g config set user root

EXPOSE 6200

# start app
CMD ["npm", "start"]
