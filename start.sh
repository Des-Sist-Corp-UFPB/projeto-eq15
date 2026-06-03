#!/bin/sh
set -e

# Inicia Nginx em background (frontend na porta 80)
nginx &

# Node vira o processo principal (API na porta 3333)
exec node /api/dist/server.js
