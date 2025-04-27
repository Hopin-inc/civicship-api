# civicship-api

## Overview

`civicship-api` is a GraphQL API server built with TypeScript. It is designed based on Domain-Driven Design (DDD) principles and uses Prisma ORM for database interaction. It emphasizes clear layer separation and explicit transaction management.

## Features

civicship-api offers the following business-oriented features:

- 👤 User Account Management (signup, profile update, deletion)
- 🏘️ Community Management (create, update, delete communities)
- 👥 Member Invitation and Role Management
- 🎯 Opportunity and Slot Management (design and scheduling of opportunities)
- 📅 Reservation and Participation Tracking
- ✍️ Post-Participation Evaluation (VC issuance)
- 🎫 Ticket Issuance and Usage
- 💸 Point System and Transaction Management
- 🛠️ Utility Management
- 📍 Place (Opportunity Location) Management

For a detailed feature list, see [FEATURES.md](./docs/FEATURES.md).

## Getting Started

### Installation

Install the dependencies.

```bash
pnpm install
```

### Environment Setup

Set the DATABASE_URL in your .env file.

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
```

### Start the Development Server

💡 If you haven't already started the database container, run pnpm container:up

```bash
pnpm container:up
```

Then, start the development server.

```bash
pnpm dev:https
```

To view the database contents in your browser, launch Prisma Studio.

```bash
pnpm db:studio
```

## Preparing the Database

### Insert Initial Data

Seed the database with necessary initial data.

```bash
pnpm db:seed
```

### Perform Migrations

When changing the database schema, follow these steps:

First, update type definitions.

```bash
pnpm db:generate
```

Then, create a migration file.

```bash
pnpm db:migrate
```

Finally, apply the migration to the database.

```bash
pnpm db:deploy
```

## Managing GraphQL Schema

If you update the GraphQL schema, regenerate the type definitions.

```bash
pnpm gql:generate
```

## Running Tests

For a detailed test report, see [docs/test](./docs/test).

### Run Tests

💡 Make sure the database container is running

```bash
pnpm test
```

### Generate a Coverage Report

If you want to check the test coverage, generate a coverage report.

```bash
pnpm test:coverage
```

## Directory Structure

This project is organized following Domain-Driven Design (DDD) principles.

```
.
┣━━ __tests__/       ┃ Unit, integration, and E2E tests
┣━━ application/     ┃ Business logic and use cases for each domain
┣━━ infrastructure/  ┃ Database (Prisma) and external services integration
┣━━ presentation/    ┃ GraphQL server, middleware, and external interfaces
┣━━ types/           ┃ Shared type definitions across the project
┗━━ ...
```

💡 Each domain (`account`, `experience`, `reward`, etc.) is further organized under `application/domain/`.

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).
See [GNU GPL v3.0](https://www.gnu.org/licenses/gpl-3.0.html) for more details.
