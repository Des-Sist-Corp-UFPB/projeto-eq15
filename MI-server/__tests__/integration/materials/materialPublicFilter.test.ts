// __tests__/integration/materials/materialPublicFilter.test.ts
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { getTestApp, closeTestApp } from '../../helpers/request'
import { createUserAndLogin, createMaterial, cleanMaterialsDb } from '../../helpers/materials'

beforeEach(cleanMaterialsDb)

afterAll(async () => {
  await cleanMaterialsDb()
  await closeTestApp()
})

/** Cria o cenário-base: 3 materiais APPROVED + 1 PENDING; retorna o token de um leitor. */
async function seedScenario() {
  const owner = await createUserAndLogin('owner@test.com', 'INSTITUTIONALIZED')
  await createMaterial({ uploadedById: owner.userId, title: 'A', status: 'APPROVED', habilidadesBncc: ['EF15LP01', 'EF15LP02'] })
  await createMaterial({ uploadedById: owner.userId, title: 'B', status: 'APPROVED', habilidadesBncc: ['EF67LP03'] })
  await createMaterial({ uploadedById: owner.userId, title: 'C', status: 'APPROVED', habilidadesBncc: [] })
  // material PENDING não deve aparecer em nenhuma busca pública, mesmo com a habilidade
  await createMaterial({ uploadedById: owner.userId, title: 'P', status: 'PENDING_REVIEW', habilidadesBncc: ['EF15LP01'] })
  const viewer = await createUserAndLogin('viewer@test.com', 'COMMON')
  return viewer.accessToken
}

async function fetchPublic(url: string, token: string) {
  const app = await getTestApp()
  const res = await app.inject({ method: 'GET', url, headers: { authorization: `Bearer ${token}` } })
  return res
}

describe('GET /mis/public — Filtro por habilidade', () => {
  it('sem filtro deve retornar todos os materiais APPROVED (e nenhum PENDING)', async () => {
    const token = await seedScenario()
    const res = await fetchPublic('/mis/public', token)

    expect(res.statusCode).toBe(200)
    expect(res.json().total).toBe(3)
  })

  it('habilidades=EF15LP01 deve retornar apenas materiais que possuem essa habilidade', async () => {
    const token = await seedScenario()
    const res = await fetchPublic('/mis/public?habilidades=EF15LP01', token)

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.total).toBe(1)
    expect(body.materials[0].title).toBe('A')
  })

  it('múltiplas habilidades devem retornar a UNIÃO (qualquer uma — hasSome)', async () => {
    const token = await seedScenario()
    const res = await fetchPublic('/mis/public?habilidades=EF15LP01&habilidades=EF67LP03', token)

    expect(res.statusCode).toBe(200)
    const titles = res.json().materials.map((m: { title: string }) => m.title).sort()
    expect(res.json().total).toBe(2)
    expect(titles).toEqual(['A', 'B'])
  })

  it('semHabilidade=true deve retornar apenas materiais sem nenhuma habilidade', async () => {
    const token = await seedScenario()
    const res = await fetchPublic('/mis/public?semHabilidade=true', token)

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.total).toBe(1)
    expect(body.materials[0].title).toBe('C')
  })

  it('habilidades + semHabilidade devem unir "tem a habilidade" OU "sem habilidade"', async () => {
    const token = await seedScenario()
    const res = await fetchPublic('/mis/public?habilidades=EF67LP03&semHabilidade=true', token)

    expect(res.statusCode).toBe(200)
    const titles = res.json().materials.map((m: { title: string }) => m.title).sort()
    expect(res.json().total).toBe(2)
    expect(titles).toEqual(['B', 'C'])
  })

  it('filtro que não casa com nenhum material deve retornar total 0', async () => {
    const token = await seedScenario()
    const res = await fetchPublic('/mis/public?habilidades=EF00ZZ00', token)

    expect(res.statusCode).toBe(200)
    expect(res.json().total).toBe(0)
  })
})
