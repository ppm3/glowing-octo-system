# Octo API 

This repository is a monorepo containing both the api and client applications for External API ETL. It's structured to facilitate the development, testing, and deployment of both parts of the project in a cohesive manner.

## Table of Contents

- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Client](#client)
- [Api](#api)
- [Quick Start](#quick-start)
- [License](#license)

## Project Structure

The monorepo is organized into the following main directories:

- `packages/`
  - `api/`: The backend application.
  - `client/`: The frontend application.

## Getting Started

Before you begin, ensure you have the following installed:

- Node.js (preferably the latest stable version)
- Yarn (as the package manager)
- Git (for cloning the repository)

## Client

1. Navigate to the client directory: `cd packages/client`

2. Follow the instructions in [README.MD](packages/client/README.md)

## Api

1. Navigate to the api directory: `cd packages/api`

2. Follow the instructions in [README.MD](packages/api/README.md)

## Quick Start

After adding the values of the environment variables, you can run these commands from the root of the mono-repo:

```bash
yarn run start:api

yarn run start:client
```

## License

Specify the license under which your project is released. For example:

This project is licensed under the [MIT License](LICENSE).

Power by :battery: [PPM3](https://github.com/ppm3)
