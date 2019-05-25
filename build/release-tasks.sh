#!/usr/bin/env bash
set -x

yarn install --production=false

yarn run db:migrate
yarn run db:load

yarn install --production=true