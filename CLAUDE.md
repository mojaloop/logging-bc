# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

The Logging Bounded Context (logging-bc) is a TypeScript monorepo providing centralized logging infrastructure for the Mojaloop vNext platform. It consumes log entries from Kafka topics and stores them in Elasticsearch for querying and analysis.

## Key Packages

- **public-types-lib**: Core interfaces and types (`ILogger`, `LogLevel`, `LogEntry`)
- **client-lib**: Client implementations (`DefaultLogger`, `KafkaLogger`) for other services to send logs
- **logging-svc**: Main service that consumes logs from Kafka and stores in Elasticsearch

## Common Development Commands

### Node.js Version Management
```bash
nvm use  # ALWAYS run this when entering any directory - uses Node 20.10
```

### Building and Running
```bash
npm install                      # Install all dependencies
npm run build                    # Build all packages  
npm run watch                    # Watch mode for development
npm run start:logging-svc        # Start the logging service
```

### Testing
```bash
npm run test:unit                # Run unit tests in all packages
npm run test:integration         # Run integration tests
npm run test                     # Run all tests
npm run posttest                 # Generate merged coverage reports

# Run a single test file
npm test -- test/integration/path/to/test.test.ts
```

### Code Quality
```bash
npm run lint                     # Run ESLint on all packages
npm run lint:fix                 # Auto-fix linting issues
npm run audit:check              # Check npm vulnerabilities
npm run audit:fix                # Fix npm vulnerabilities
npm run dep:check                # Check outdated dependencies with ncu
npm run dep:update               # Update dependencies
npm run pre_commit_check         # Run build, lint, and unit tests
```

### Package-Specific Commands
```bash
# Publishing npm packages
npm run publish:public-types     # Publish public-types-lib to npm
npm run publish:client-lib       # Publish client-lib to npm

# Docker
npm run docker:build             # Build Docker image for logging-svc
```

## Architecture Patterns

### Monorepo Structure
- Uses npm workspaces with packages under `packages/` directory
- Root `tsconfig.json` extended by each package
- Shared TypeScript configuration: ES2022 target, CommonJS modules, strict mode
- Each package has independent versioning and publishing

### Testing Strategy
- **Jest** for all testing with `ts-jest` preset
- Unit tests in each package: `test/unit/**/*.test.ts`
- Integration tests at root level
- Coverage thresholds: 75% for branches, functions, and lines
- Coverage reports merged using nyc from all packages

### Build Configuration
- TypeScript compiles to `dist/` in each package
- Source maps enabled for debugging
- Declaration files generated for type definitions
- Strict TypeScript settings with `strict: true`

### Service Dependencies
- **Kafka**: Message broker for consuming logs
- **Elasticsearch**: Storage backend for log data
- Infrastructure via docker-compose from platform-shared-tools repo

## Environment Configuration

The logging-svc uses these environment variables:

```bash
# Logging
LOG_LEVEL                        # LogLevel enum (DEBUG, INFO, WARN, ERROR)

# Kafka Configuration
KAFKA_URL                        # Default: localhost:9092
KAFKA_LOGS_TOPIC                 # Default: logs
KAFKA_AUTH_ENABLED               # Default: false
KAFKA_AUTH_PROTOCOL              # Default: sasl_plaintext
KAFKA_AUTH_MECHANISM             # Default: plain
KAFKA_AUTH_USERNAME              # Kafka username
KAFKA_AUTH_PASSWORD              # Kafka password

# Elasticsearch Configuration  
ELASTICSEARCH_URL                # Default: https://localhost:9200
ELASTICSEARCH_LOGS_INDEX         # Default: ml-logging
ELASTICSEARCH_USERNAME           # Default: elastic
ELASTICSEARCH_PASSWORD           # Default: elasticSearchPas42

# Consumer Settings
CONSUMER_BATCH_SIZE              # Default: 100
CONSUMER_BATCH_TIMEOUT_MS        # Default: 1000
SERVICE_START_TIMEOUT_MS         # Default: 60000
```

## Development Workflow

### Initial Setup
1. Clone repository and `cd` into it
2. Run `nvm use` to set correct Node.js version
3. Run `npm install` to install all dependencies
4. Run infrastructure dependencies via docker-compose

### Making Changes
1. Run `npm run build` to build all packages
2. Use `npm run watch` for development
3. Write tests in `test/unit/` within each package
4. Run `npm run pre_commit_check` before committing
5. Ensure all tests pass and coverage thresholds are met

### Common Issues
- **OpenSSL errors**: Set `export OPENSSL_CONF=/dev/null`
- **Node version**: Always run `nvm use` when changing directories
- **Dependencies**: Ensure Kafka and Elasticsearch are running

### CI/CD Pipeline
- CircleCI automates builds, tests, and publishing
- Packages published to npm when version changes
- Docker images built and pushed to DockerHub
- Automated git tagging and commit messages