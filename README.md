# logging-bc

**EXPERIMENTAL** vNext Logging Bounded Context Mono Repository

{{DESCRIPTION}}

## Modules

### logging-svc

{{DESCRIPTION}}

[README](./modules/logging-svc/README.md)

#### Run

```bash
yarn start:logging-svc
```

## Usage

### Install Node version

More information on how to install NVM: https://github.com/nvm-sh/nvm

```bash
nvm install
nvm use
```

### Install Dependencies

```bash
npm install
```

## Build

```bash
npm run build
```

## Unit Tests

```bash
npm run test:unit
```

## Run the services 

### Startup supporting services

Use https://github.com/mojaloop/platform-shared-tools/tree/main/packages/deployment/docker-compose-infra


To startup Kafka, MongoDB, Elasticsearch and Kibana, follow the steps below(executed in docker-compose-infra/):   

1. Create a sub-directory called `exec` inside the `docker-compose-infra` (this) directory, and navigate to that directory.


```shell
mkdir exec 
cd exec
```

2. Create the following directories as sub-directories of the `docker-compose/exec` directory:
* `certs`
* `esdata01`
* `kibanadata`
* `logs`

```shell
mkdir {certs,esdata01,kibanadata,logs}
```

3. Copy the `.env.sample` to the exec dir:
```shell
cp ../.env.sample ./.env
```

4. Review the contents of the `.env` file

5. Ensure `vm.max_map_count` is set to at least `262144`: Example to apply property on live system:
```shell
sysctl -w vm.max_map_count=262144 # might require sudo
```

### Start Infrastructure Containers

Start the docker containers using docker-compose up (in the exec dir)
```shell
docker-compose -f ../docker-compose-infra.yml --env-file ./.env up -d
```


To view the logs of the infrastructure containers, run:
```shell
docker-compose -f ../docker-compose-infra.yml --env-file ./.env logs -f
```

To stop the infrastructure containers, run:
```shell
docker-compose -f ../docker-compose-infra.yml --env-file ./.env stop
```

# Viewing the dashboards

Once started, the services will available via localhost.
Use the credentials set in the .env file.

### ElasticSearch and Kibana
- ElasticSearch API - https://localhost:9200/
- Kibana - http://localhost:5601

### Kafka and RedPanda Console
- Kafka Broker - localhost:9092
- Zookeeper - localhost:2181
- RedPanda Kafka Console - http://localhost:8080

### Mongo and Mongo Express Console
- MongoDB - mongodb://localhost:27017
- Mongo Express Console - http://localhost:8081

&nbsp;

---

## After running the docker-compose-infra we can start logging-bc:
```shell
npm run start:logging-svc
```

## Integration Tests
```bash
npm run test:integration
```

## Troubleshoot 

### Unable to load dlfcn_load
```bash
error:25066067:DSO support routines:dlfcn_load:could not load the shared library
```
Fix: https://github.com/mojaloop/security-bc.git  `export OPENSSL_CONF=/dev/null`

