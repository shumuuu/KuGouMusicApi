import { createRequest } from '../utils/request'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const body = method === 'POST' ? await readBody(event) : {}
  const params = { ...body, ...query }

  try {
    const response = await createRequest({
      url: '/login/token',
      method: 'POST',
      params: method === 'GET' ? params : undefined,
      data: method === 'POST' ? params : undefined,
      encryptType: 'android',
      cookie: params?.cookie || {},
    })

    return response.body
  } catch (error: any) {
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.body?.msg || 'Internal Server Error',
      data: error.body
    })
  }
})