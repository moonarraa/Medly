import 'dotenv/config'
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import app from '../server.js'

let server
let baseUrl
let adminToken

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app)
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      baseUrl = `http://127.0.0.1:${port}`
      resolve()
    })
  })

  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@medly.nhs.uk', password: 'Medly@2026' }),
  })
  assert.equal(res.status, 200, 'Admin login should succeed')
  const body = await res.json()
  adminToken = body.token || body.accessToken
  assert.ok(adminToken, 'Should receive a JWT token')
})

after(async () => {
  await new Promise((resolve) => server.close(resolve))
  const { default: prisma } = await import('../db.js')
  await prisma.$disconnect()
})

function countPdfPages(buffer) {
  const re = /\/Type\s*\/Page[^s]/g
  return [...buffer.toString('binary').matchAll(re)].length
}

test('GET /api/admin/reports/overview — returns a PDF with exactly 2 pages', async () => {
  const res = await fetch(`${baseUrl}/api/admin/reports/overview`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  })

  assert.equal(res.status, 200, 'Should respond 200')
  assert.equal(res.headers.get('content-type'), 'application/pdf', 'Content-Type must be application/pdf')

  const buf = Buffer.from(await res.arrayBuffer())
  assert.ok(buf.length > 1000, 'PDF should not be empty')

  const pages = countPdfPages(buf)
  assert.equal(pages, 2, `Overview report must be exactly 2 pages (got ${pages})`)
})

test('GET /api/admin/prescriptions/export — returns a PDF', async () => {
  const res = await fetch(`${baseUrl}/api/admin/prescriptions/export`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  })

  assert.equal(res.status, 200, 'Should respond 200')
  assert.equal(res.headers.get('content-type'), 'application/pdf', 'Content-Type must be application/pdf')

  const buf = Buffer.from(await res.arrayBuffer())
  assert.ok(buf.length > 1000, 'PDF should not be empty')

  const pages = countPdfPages(buf)
  assert.ok(pages >= 1, `Prescriptions report should have at least 1 page (got ${pages})`)
})

test('GET /api/admin/reports/overview — requires authentication', async () => {
  const res = await fetch(`${baseUrl}/api/admin/reports/overview`)
  assert.ok(res.status === 401 || res.status === 403, 'Should reject unauthenticated requests')
})
