all: deploy

deploy:

init:
	eb init -r us-west-2 -p docker -k endurance dev

create:

terminate:

build:
	docker build -t imageserver .

rebuild: stop delete build run

stop:
	docker stop imageserver

restart: stop start

start:
	docker start imageserver

run:
	docker run -d -p 3000:3000 --name imageserver --env-file local-env.list imageserver

delete:
	docker rm imageserver

local:
	export REDISURL="192.168.59.103"
	export REDISPORT=6379
	export S3BUCKET="sproutup-test-bucket"
