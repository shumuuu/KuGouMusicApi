import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { cryptoMd5 } from './crypto'
import { signKey, signatureAndroidParams, signatureRegisterParams, signatureWebParams } from './helper'
import { parseCookieString } from './util'

// 配置信息
const config = {
  appid: '3111',
  clientver: '11083',
  liteAppid: '3111',
  liteClientver: '11083'
}

export interface UseAxiosResponse {
  status: number
  body: any
  cookie: string[]
  headers?: Record<string, string>
}

export interface RequestOptions {
  method: 'get' | 'GET' | 'post' | 'POST'
  url: string
  baseURL?: string
  params?: Record<string, any>
  data?: Record<string, any>
  headers?: Record<string, string | number>
  encryptType?: 'android' | 'web' | 'register'
  cookie?: { [key: string]: string | number }
  encryptKey?: boolean
  clearDefaultParams?: boolean
  notSignature?: boolean
  ip?: string
  realIP?: string
  responseType?: string
}

/**
 * 请求创建
 * @param options 请求选项
 * @returns Promise<UseAxiosResponse>
 */
export const createRequest = (options: RequestOptions): Promise<UseAxiosResponse> => {
  return new Promise(async (resolve, reject) => {
    const isLite = process.env.platform === 'lite'
    const dfid = options?.cookie?.dfid || '-'
    const mid = cryptoMd5(dfid)
    const uuid = cryptoMd5(`${dfid}${mid}`)
    const token = options?.cookie?.token || ''
    const userid = options?.cookie?.userid || 0
    const clienttime = Math.floor(Date.now() / 1000)
    const ip = options?.realIP || options?.ip || ''
    const headers: Record<string, any> = { dfid, clienttime, mid }

    if (ip) {
      headers['X-Real-IP'] = ip
      headers['X-Forwarded-For'] = ip
    }

    const defaultParams = {
      dfid,
      mid,
      uuid,
      appid: isLite ? config.liteAppid : config.appid,
      clientver: isLite ? config.liteClientver : config.clientver,
      userid,
      clienttime,
    }

    if (token) defaultParams['token'] = token
    const params = options?.clearDefaultParams ? options?.params || {} : Object.assign({}, defaultParams, options?.params || {})

    headers['clienttime'] = params.clienttime

    if (options?.encryptKey) {
      params['key'] = signKey(params['hash'], params['mid'], params['userid'], params['appid'])
    }

    const data = typeof options?.data === 'object' ? JSON.stringify(options.data) : options?.data || ''

    if (!params['signature'] && !options.notSignature) {
      switch (options?.encryptType) {
        case 'register':
          params['signature'] = signatureRegisterParams(params)
          break
        case 'web':
          params['signature'] = signatureWebParams(params)
          break
        case 'android':
        default:
          params['signature'] = signatureAndroidParams(params, data)
          break
      }
    }

    const requestOptions: AxiosRequestConfig = {
      params,
      data: options?.data,
      method: options.method,
      baseURL: options?.baseURL || 'https://gateway.kugou.com',
      url: options.url,
      headers: Object.assign({ 'User-Agent': 'Android15-1070-11083-46-0-DiscoveryDRADProtocol-wifi' }, options?.headers || {}, { dfid, clienttime: params.clienttime, mid }),
      withCredentials: true,
      responseType: options.responseType as any,
    }

    if (options.data) requestOptions.data = options.data
    if (params) requestOptions.params = params

    if (options.baseURL?.includes('openapicdn')) {
      const url = requestOptions.url
      const _params = Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join('&')
      requestOptions.url = `${url}?${_params}`
      requestOptions.params = {}
    }

    const answer: UseAxiosResponse = { status: 500, body: {}, cookie: [], headers: {} }
    
    try {
      const response: AxiosResponse = await axios(requestOptions)

      const body = response.data

      answer.cookie = (response.headers['set-cookie'] || []).map((x: string) => parseCookieString(x))

      if (response.headers['ssa-code']) {
        answer.headers!['ssa-code'] = response.headers['ssa-code'] as string
      }

      try {
        answer.body = JSON.parse(body.toString())
      } catch (error) {
        answer.body = body
      }

      if (response.data.status === 0 || (response.data?.error_code && response.data.error_code !== 0)) {
        answer.status = 502
        reject(answer)
      } else {
        answer.status = 200
        resolve(answer)
      }
    } catch (e: any) {
      answer.status = 502
      answer.body = { status: 0, msg: e }
      reject(answer)
    }
  })
}

