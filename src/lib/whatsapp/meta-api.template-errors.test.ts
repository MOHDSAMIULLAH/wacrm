import { afterEach, describe, expect, it, vi } from 'vitest'
import { editMessageTemplate, MetaApiError } from './meta-api'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('template endpoint errors keep Meta\'s user-facing reason', () => {
  it('falls back to error_user_title / error_user_msg when error_data.details is absent', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        json(
          {
            error: {
              message: 'Invalid parameter',
              code: 100,
              error_subcode: 2388040,
              error_user_title: 'Parameter format mismatch',
              error_user_msg: 'This template uses named parameters.',
              fbtrace_id: 'trace',
            },
          },
          400,
        ),
      ),
    )
    const err = await editMessageTemplate({
      metaTemplateId: 'tpl',
      accessToken: 'tok',
      components: [],
    }).catch((e) => e)
    expect(err).toBeInstanceOf(MetaApiError)
    expect(err.message).toBe('Invalid parameter')
    expect(err.details).toBe('Parameter format mismatch: This template uses named parameters.')
  })

  it('prefers error_data.details when Meta sends both', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        json(
          {
            error: {
              message: 'Invalid parameter',
              code: 100,
              error_user_msg: 'user text',
              error_data: { details: 'whatsapp details' },
            },
          },
          400,
        ),
      ),
    )
    const err = await editMessageTemplate({
      metaTemplateId: 'tpl',
      accessToken: 'tok',
      components: [],
    }).catch((e) => e)
    expect(err.details).toBe('whatsapp details')
  })
})
