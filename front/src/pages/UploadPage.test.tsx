// src/pages/UploadPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

import { api } from '../lib/api'
import { UploadPage } from './UploadPage'
import { renderWithProviders, setSession, makeUser } from '../test/utils'

const mockApi = vi.mocked(api)

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  // useMyOrganizations é chamado no render — devolve lista vazia por padrão
  mockApi.get.mockResolvedValue({ data: [] })
})

describe('UploadPage', () => {
  it('avisa quando o usuário não tem permissão de upload', () => {
    setSession(makeUser({ role: 'COMMON', email: 'comum@gmail.com', canUpload: false }))
    renderWithProviders(<UploadPage />, { route: '/upload' })
    expect(screen.getByText(/Permissão de upload não habilitada/i)).toBeInTheDocument()
  })

  it('adiciona e remove habilidades BNCC', async () => {
    setSession(makeUser({ role: 'PROFESSOR' }))
    const user = userEvent.setup()
    renderWithProviders(<UploadPage />, { route: '/upload' })

    await user.type(screen.getByLabelText(/Habilidades BNCC/i), 'EF15LP01')
    await user.click(screen.getByRole('button', { name: 'Adicionar' }))
    expect(screen.getByText('EF15LP01')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Remover EF15LP01/i }))
    expect(screen.queryByText('EF15LP01')).not.toBeInTheDocument()
  })

  it('envia o material com o arquivo selecionado', async () => {
    setSession(makeUser({ role: 'PROFESSOR' }))
    mockApi.post.mockResolvedValue({
      data: { id: 'm1', title: 'meu-doc', originalFileName: 'doc.pdf', storageKey: 'k', mimeType: 'application/pdf', sizeBytes: 10, status: 'PENDING_REVIEW', habilidadesBncc: [], uploadedById: 'u1', createdAt: '', updatedAt: '' },
    })
    const user = userEvent.setup()
    const { container } = renderWithProviders(<UploadPage />, { route: '/upload' })

    const file = new File(['conteúdo'], 'doc.pdf', { type: 'application/pdf' })
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    await user.click(screen.getByRole('button', { name: /Enviar Material/i }))

    await waitFor(() => expect(mockApi.post).toHaveBeenCalled())
    expect(mockApi.post.mock.calls[0][0]).toBe('/mis')
    expect(await screen.findByText(/Material enviado com sucesso/i)).toBeInTheDocument()
  })

  it('mostra o seletor de projeto quando há organizações ativas', async () => {
    setSession(makeUser({ role: 'PROFESSOR' }))
    mockApi.get.mockResolvedValue({
      data: [{ id: 'o1', name: 'Projeto Ativo', description: null, status: 'ACTIVE', myRole: 'ADMIN', memberCount: 1, createdAt: '' }],
    })
    renderWithProviders(<UploadPage />, { route: '/upload' })
    expect(await screen.findByText(/Destinar a um projeto/i)).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Projeto Ativo' })).toBeInTheDocument()
  })

  it('exibe erro amigável quando o upload falha', async () => {
    setSession(makeUser({ role: 'PROFESSOR' }))
    mockApi.post.mockRejectedValue(new Error('boom'))
    const user = userEvent.setup()
    const { container } = renderWithProviders(<UploadPage />, { route: '/upload' })

    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' })
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)
    await user.click(screen.getByRole('button', { name: /Enviar Material/i }))

    expect(await screen.findByText(/Ocorreu um erro inesperado/i)).toBeInTheDocument()
  })
})
