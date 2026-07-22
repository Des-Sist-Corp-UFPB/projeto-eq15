// src/lib/tracing.ts
// Helper de instrumentação manual (OpenTelemetry).
//
// A auto-instrumentação enxerga bibliotecas (HTTP, pg, Redis), mas não conhece a
// regra de negócio. Estes wrappers criam spans nomeados pelas nossas operações
// (upload de MI, busca semântica, vetorização) com atributos de negócio.
//
// A API do OTel é no-op quando o SDK não está carregado: sem `npm run dev:otel`
// os wrappers apenas executam a função, sem custo e sem erro. Por isso é seguro
// usá-los em qualquer ambiente, inclusive nos testes.
import { SpanStatusCode, trace, type Attributes, type Span } from '@opentelemetry/api'

const tracer = trace.getTracer('mi-server')

/**
 * Executa `fn` dentro de um span. Em caso de exceção, registra o erro no span
 * (aparece em vermelho na cascata do Grafana) e repropaga.
 */
export async function withSpan<T>(
  name: string,
  attributes: Attributes,
  fn: (span: Span) => Promise<T>,
): Promise<T> {
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      return await fn(span)
    } catch (error) {
      recordError(span, error)
      throw error
    } finally {
      span.end()
    }
  })
}

/** Versão síncrona de `withSpan`, para trechos de CPU (validação, chunking). */
export function withSpanSync<T>(
  name: string,
  attributes: Attributes,
  fn: (span: Span) => T,
): T {
  return tracer.startActiveSpan(name, { attributes }, (span) => {
    try {
      return fn(span)
    } catch (error) {
      recordError(span, error)
      throw error
    } finally {
      span.end()
    }
  })
}

/** Marca o span como erro e anexa a exceção. */
function recordError(span: Span, error: unknown): void {
  const err = error instanceof Error ? error : new Error(String(error))
  span.recordException(err)
  span.setStatus({ code: SpanStatusCode.ERROR, message: err.message })
}
