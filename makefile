environment_name = dev
platform = docker
application_name = imageserver
region = us-west-2
keypair = endurance
cname = imageserver-develop-sproutup-co
configuration = imageserver-develop

#master : environment_name = sproutup
#master : platform = docker
#master : application_name = imageserver
#master : region = us-west-2
#master : keypair = endurance
#master : cname = imageserver-master-sproutup-co
#master : configuration = imageserver-develop
#master : myvar = helloworld


all: deploy

master:
	$(eval cname := imageserver-master-sproutup-co)	
	$(eval environment_name := sproutup)	
	$(eval configuration := imageserver-master)	
	$(eval application_name := imageserver-master)	
	echo $(cname)
	echo $(environment_name)

echo: 
	echo $(cname)
	echo $(environment_name)

deploy: init
	eb deploy

init:
	eb init -r $(region) -p $(platform) -k $(keypair) $(environment_name)

recreate: terminate create

create: init
	eb create $(application_name) -c $(cname) --cfg $(configuration)

terminate: init
	eb terminate $(application_name) --force

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

config:
	eb config $(configuration) --cfg $(configuration)

put:
	eb config put $(configuration)
