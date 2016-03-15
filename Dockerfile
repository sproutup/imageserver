FROM node:4.2.4

ENV DEBIAN_FRONTEND noninteractive

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY *.json /usr/src/app/
COPY *.sh /usr/src/app/
COPY *.js /usr/src/app/
COPY README.md /usr/src/app/
RUN apt-get update && apt-get -y install lsb-release apt-utils
RUN ./preinstall.sh
RUN npm install
#COPY . /usr/src/app

CMD [ "npm", "start" ]

# replace this with your application's default port
EXPOSE 3000
