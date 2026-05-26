// src/server.ts
import { buildApp } from './app'
import { env } from './env'

const app = buildApp()

app.listen({ port: env.PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`🚀 MI-server running on http://0.0.0.0:${env.PORT}`)
})
