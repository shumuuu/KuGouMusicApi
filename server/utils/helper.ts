import { cryptoMd5 } from './crypto'

// 配置信息
const config = {
  appid: '1005',
  liteAppid: '3116',
  clientver: '12569',
  liteClientver: '11040'
}

export interface HelperParams {
  [key: string]: any
}

/**
 * web版本 signature 加密
 * @param params 参数对象
 * @returns 加密后的signature
 */
export const signatureWebParams = (params: HelperParams): string => {
  const str = 'NVPh5oo715z5DIWAeQlhMDsWXXQV4hwt'
  const paramsString = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .sort()
    .join('')
  return cryptoMd5(`${str}${paramsString}${str}`)
}

/**
 * Android版本 signature 加密
 * @param params 参数对象
 * @param data 数据
 * @returns 加密后的signature
 */
export const signatureAndroidParams = (params: HelperParams, data?: string): string => {
  const isLite = process.env.platform === 'lite'
  const str = isLite ? 'LnT6xpN3khm36zse0QzvmgTZ3waWdRSA' : 'OIlwieks28dk2k092lksi2UIkp'
  const paramsString = Object.keys(params)
    .sort()
    .map((key) => `${key}=${typeof params[key] === 'object' ? JSON.stringify(params[key]) : params[key]}`)
    .join('')
  return cryptoMd5(`${str}${paramsString}${data || ''}${str}`)
}

/**
 * Register版本 signature 加密
 * @param params 参数对象
 * @returns 加密后的signature
 */
export const signatureRegisterParams = (params: HelperParams): string => {
  const paramsString = Object.keys(params)
    .map((key) => params[key])
    .sort()
    .join('')
  return cryptoMd5(`1014${paramsString}1014`)
}

/**
 * sign 加密
 * @param params 参数对象
 * @param data 数据
 * @returns 加密后的sign
 */
export const signParams = (params: HelperParams, data?: string): string => {
  const str = 'R6snCXJgbCaj9WFRJKefTMIFp0ey6Gza'
  const paramsString = Object.keys(params)
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join('')
  return cryptoMd5(`${paramsString}${data || ''}${str}`)
}

/**
 * signKey 加密
 * @param hash 哈希值
 * @param mid 设备ID
 * @param userid 用户ID
 * @param appid 应用ID
 * @returns 加密后的sign
 */
export const signKey = (hash: string, mid: string, userid?: string | number, appid?: string | number): string => {
  const isLite = process.env.platform === 'lite'
  const str = isLite ? '185672dd44712f60bb1736df5a377e82' : '57ae12eb6890223e355ccfcb74edf70d'
  return cryptoMd5(`${hash}${str}${appid || config.appid}${mid}${userid || 0}`)
}

/**
 * signKey 加密云盘key
 * @param hash 哈希值
 * @param pid 播放ID
 * @returns 加密后的sign
 */
export const signCloudKey = (hash: string, pid: string): string => {
  const str = 'ebd1ac3134c880bda6a2194537843caa0162e2e7'
  return cryptoMd5(`musicclound${hash}${pid}${str}`)
}

/**
 * signParams 加密
 * @param data 数据
 * @param appid 应用ID
 * @param clientver 客户端版本
 * @returns 加密后的signParams
 */
export const signParamsKey = (data: string | number, appid?: string | number, clientver?: string | number): string => {
  const isLite = process.env.platform === 'lite'
  const str = isLite ? 'LnT6xpN3khm36zse0QzvmgTZ3waWdRSA' : 'OIlwieks28dk2k092lksi2UIkp'

  appid = appid || (isLite ? config.liteAppid : config.appid)
  clientver = clientver || (isLite ? config.liteClientver : config.clientver)

  return cryptoMd5(`${appid}${str}${clientver}${data}`)
}

