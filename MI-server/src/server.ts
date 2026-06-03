// src/server.ts
import { buildApp } from './app'
import { ensureBucket } from './lib/minio'
import { env } from './env'

const app = buildApp()

// Garante que o bucket MinIO existe antes de aceitar requisições
ensureBucket()
  .then(() => {
    app.listen({ port: env.PORT, host: '0.0.0.0' }, (err) => {
      if (err) {
        app.log.error(err)
        process.exit(1)
      }
      console.log(`🚀 MI-server running on http://0.0.0.0:${env.PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ Falha ao conectar ao MinIO na inicialização:', err)
    process.exit(1)
  })
