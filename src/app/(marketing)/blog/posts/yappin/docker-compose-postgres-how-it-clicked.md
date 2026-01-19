---
title: "Docker Compose, PostgreSQL, and Drizzle: How I Finally Understood It"
publishedAt: "2026-01-19"
updatedAt: "2026-01-19"
summary: "I have used Docker on and off for years without fully understanding it. Writing this down is how I finally built a clear mental model for Docker Compose, PostgreSQL, volumes, ports, environment variables, Dockerfiles, migrations, and driver choices."
tags: ["Docker", "PostgreSQL", "Drizzle", "Engineering", "Guide"]
author: "Remco Stoeten"
slug: "docker-compose-postgres-how-it-clicked"
draft: true
---

I use Docker here and there, but I never really understood it. Most of the time things worked after trial and error. The moment something broke, ports were in use, passwords would not change, or databases refused to reset, I was lost again.

For me personally, the best way to make something stick is to type it out. This document exists purely for that reason.

## What Docker Compose Actually Is

Docker Compose describes infrastructure. Nothing more.

A compose file answers:
- which containers should run
- how they are configured at startup
- how they can talk to each other
- where persistent data is stored

It does not:
- manage schema
- run migrations
- reset databases
- understand application logic

Once I accepted this boundary, Docker stopped feeling unpredictable.

## The Smallest Possible Postgres Setup

This is a valid and working Postgres setup:

```yaml:docker-compose.yml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
```

This already runs a database. No ports, no volumes, no extras.

The defaults come from the Postgres image itself. Docker also creates storage implicitly, even though it is not visible in the file.

## Ports, and Why I Always Got Errors

Ports were the source of most confusion for me.

The syntax is:

HOST_PORT:CONTAINER_PORT

For Postgres:
- the container port is always `5432`
- the host port can be any free port

Example:

55432:5432

This means:
- inside Docker, Postgres listens on 5432
- on my machine, I connect to localhost:55432

Most of my errors came from trying to use `5432` on the host while something else was already using it.

The rule that finally stuck for me:

The left side belongs to my OS.  
The right side belongs to Docker.

## How Connection Strings Are Built

Every Postgres connection string follows this structure:

postgresql://USER:PASSWORD@HOST:PORT/DATABASE

Where those values come from depends on context.

From my machine:
- HOST is `localhost`
- PORT is the left side of the port mapping

From another container:
- HOST is the service name
- PORT is always `5432`

Examples:

postgresql://app:app@localhost:55432/app  
postgresql://app:app@postgres:5432/app  

Using `localhost` between containers never works. That mistake alone explained a lot of past frustration.

## Volumes Decide What Is Real

Volumes were the biggest conceptual shift for me.

If a volume exists:
- the database exists
- data survives restarts
- environment variables are ignored

Named volume example:

```yaml:docker-compose.yml
volumes:
  - pg-data:/var/lib/postgresql/data
```

Once this volume exists, Postgres will never reinitialize itself.

This explains why changing `POSTGRES_PASSWORD` or `POSTGRES_DB` later appears to do nothing.

The only full reset is:

docker compose down -v

Deleting the volume deletes reality.

## POSTGRES_* Variables Explained

`POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` are not conventions. They are part of the official Postgres Docker image API.

They are read:
- once
- during first startup
- only when the data directory is empty

After that:
- changing them has no effect
- users are not updated
- passwords are not rotated

These variables are only for container initialization. Applications should never rely on them directly.

## Hiding Passwords Without Overengineering

Hiding a password means not committing it to git.

For local development, a `.env` file is sufficient.

.env (gitignored):

POSTGRES_DB=app  
POSTGRES_USER=app  
POSTGRES_PASSWORD=app  
DATABASE_URL=postgresql://app:app@localhost:55432/app  

Compose file:

```yaml:docker-compose.yml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

Docker Compose automatically loads `.env`. No extra tooling required.

## Initialization Versus Migrations

These are two different mechanisms.

Init scripts:
- live in `/docker-entrypoint-initdb.d`
- run only once
- require an empty volume

They are suitable for initial schema and extensions.

Migrations:
- are executed by the application
- run explicitly
- track what has already been applied

Docker Compose does not run migrations for you.

## If I Only Generated SQL Files

Generating SQL files is not the same as having migrations.

Options:
- treat SQL files as init scripts and accept they run once
- apply SQL manually with psql
- wrap SQL execution in scripts

Without migration tracking, state is unmanaged. That is acceptable for prototypes, risky for long-lived projects.

## Multiple Databases Without Confusion

The clearest setup for dev and test is multiple containers.

```yaml:docker-compose.yml
services:
  postgres_dev:
    image: postgres:16
    environment:
      POSTGRES_DB: app_dev
    ports:
      - "55432:5432"
    volumes:
      - pg-dev:/var/lib/postgresql/data

  postgres_test:
    image: postgres:16
    environment:
      POSTGRES_DB: app_test
    ports:
      - "55433:5432"
    volumes:
      - pg-test:/var/lib/postgresql/data
```

Each database is fully isolated. No shared state, no accidental cross-use.

## A Small Dockerfile Mental Model

A Dockerfile defines how an image is built.

It answers:
- which base image to start from
- which files to copy
- which commands to run during build
- what command runs at container start

Minimal example for a Node migration image:

```dockerfile:Dockerfile
FROM node:20
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "db:migrate"]
```

Build time and run time are separate concepts:
- Dockerfile executes at image build time
- docker-compose.yml controls containers at runtime

Separating those mentally removed a lot of confusion.

## Why You Cannot Use Neon's Serverless Driver Here

When running Postgres locally in Docker, you must use a standard PostgreSQL driver such as `pg`.

Neon's Postgres package is designed for:
- serverless environments
- HTTP or WebSocket-based connections
- managed Neon infrastructure

A local Docker Postgres container:
- speaks the native Postgres protocol
- listens on TCP
- expects a traditional client

Because of that:
- `@neondatabase/serverless` will not work
- `pg` is the correct and required driver

Drizzle supports this cleanly by swapping drivers based on environment:
- `pg` for local Docker or traditional servers
- Neon driver only when actually running on Neon

Trying to mix these abstractions is what usually causes connection confusion.

## The Sentence That Made It Click

Docker Compose manages infrastructure.  
Postgres environment variables initialize once.  
Volumes decide reality.

Writing this down is what finally made Docker feel deterministic instead of magical.
