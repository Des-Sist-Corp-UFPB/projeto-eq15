// src/components/Logo.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Logo } from './Logo'

describe('Logo', () => {
  it('renderiza o wordmark "Computeca" em duas partes', () => {
    render(<Logo />)
    expect(screen.getByText('Comput')).toBeInTheDocument()
    expect(screen.getByText('eca')).toBeInTheDocument()
  })

  it('exibe o subtítulo por padrão', () => {
    render(<Logo />)
    expect(screen.getByText(/Acervo de MIs/i)).toBeInTheDocument()
  })

  it('esconde o subtítulo no modo compacto', () => {
    render(<Logo compact />)
    expect(screen.queryByText(/Acervo de MIs/i)).not.toBeInTheDocument()
  })
})
