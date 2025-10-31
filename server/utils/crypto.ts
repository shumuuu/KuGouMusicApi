import crypto from 'node:crypto'
import { randomString } from './util'

const publicRasKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDIAG7QOELSYoIJvTFJhMpe1s/gbjDJX51HBNnEl5HXqTW6lQ7LC8jr9fWZTwusknp+sVGzwd40MwP6U5yDE27M/X1+UR4tvOGOqp94TJtQ1EPnWGWXngpeIW5GxoQGao1rmYWAu6oi1z9XkChrsUdC6DJE5E221wf/4WLFxwAtRQIDAQAB
-----END PUBLIC KEY-----`

const publicLiteRasKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDECi0Np2UR87scwrvTr72L6oO01rBbbBPriSDFPxr3Z5syug0O24QyQO8bg27+0+4kBzTBTBOZ/WWU0WryL1JSXRTXLgFVxtzIY41Pe7lPOgsfTCn5kZcvKhYKJesKnnJDNr5/abvTGf+rHG3YRwsCHcQ08/q6ifSioBszvb3QiwIDAQAB
-----END PUBLIC KEY-----`

export interface AesEncrypt {
  str: string
  key: string
}

/**
 * MD5 加密
 * @param data 需要加密的数据
 * @returns 加密后的字符串
 */
export function cryptoMd5(data: any): string {
  const buffer = typeof data === 'object' ? JSON.stringify(data) : data
  return crypto.createHash('md5').update(buffer).digest('hex')
}

/**
 * Sha1 加密
 * @param data 需要加密的数据
 * @returns 加密后的字符串
 */
export function cryptoSha1(data: any): string {
  const buffer = typeof data === 'object' ? JSON.stringify(data) : data
  return crypto.createHash('sha1').update(buffer).digest('hex')
}

/**
 * AES 加密
 * @param data 需要加密的数据
 * @param opt 加密选项
 * @returns 加密结果
 */
export function cryptoAesEncrypt(data: any, opt?: { key?: string; iv?: string }): AesEncrypt | string {
  if (typeof data === 'object') data = JSON.stringify(data)
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data)
  let key: string, iv: string, tempKey = ''
  
  if (opt?.key && opt?.iv) {
    key = opt.key
    iv = opt.iv
  } else {
    tempKey = opt?.key || randomString(16).toLowerCase()
    key = cryptoMd5(tempKey).substring(0, 32)
    iv = key.substring(key.length - 16, key.length)
  }

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  const dest = Buffer.concat([cipher.update(buffer), cipher.final()])
  if (opt?.key && opt?.key) return dest.toString('hex')
  return { str: dest.toString('hex'), key: tempKey }
}

/**
 * AES 解密
 * @param data 需要解密的数据
 * @param key 密钥
 * @param iv 初始向量
 * @returns 解密结果
 */
export function cryptoAesDecrypt(data: string, key: string, iv?: string): string | Record<string, string> {
  if (!iv) key = cryptoMd5(key).substring(0, 32)
  iv = iv || key.substring(key.length - 16, key.length)
  const cipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  const dest = Buffer.concat([cipher.update(data, 'hex'), cipher.final()])
  try {
    return JSON.parse(dest.toString())
  } catch (e) {
    return dest.toString()
  }
}

/**
 * RSA加密
 * @param data 需要加密的数据
 * @param publicKey 公钥
 * @returns 加密后的十六进制字符串
 */
export function cryptoRSAEncrypt(data: any, publicKey?: string): string {
  const isLite = process.env.platform === 'lite'
  if (typeof data === 'object') data = JSON.stringify(data)
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data)
  const _buffer = Buffer.concat([buffer, Buffer.alloc(128 - buffer.length)])
  publicKey = publicKey || (isLite ? publicLiteRasKey : publicRasKey)
  return crypto.publicEncrypt({ key: publicKey, padding: crypto.constants.RSA_NO_PADDING }, _buffer).toString('hex')
}

/**
 * RSA加密（PKCS1填充）
 * @param data 需要加密的数据
 * @returns 加密后的十六进制字符串
 */
export function rsaEncrypt2(data: any): string {
  const isLite = process.env.platform === 'lite'
  const useData = typeof data === 'object' ? Buffer.from(JSON.stringify(data)) : Buffer.from(data)
  const buffer = Buffer.concat([useData])
  return crypto.publicEncrypt({ 
    key: isLite ? publicLiteRasKey : publicRasKey, 
    padding: crypto.constants.RSA_PKCS1_PADDING 
  }, buffer).toString('hex')
}

/**
 * 播放列表AES加密
 * @param data 需要加密的数据
 * @returns 加密结果
 */
export function playlistAesEncrypt(data: any): AesEncrypt {
  const useData = typeof data === 'object' ? JSON.stringify(data) : data
  const key = randomString(6).toLocaleLowerCase()
  const encryptKey = cryptoMd5(key).substring(0, 16)
  const iv = cryptoMd5(key).substring(16, 32)

  const cipher = crypto.createCipheriv('aes-128-cbc', encryptKey, iv)
  const dest = Buffer.concat([cipher.update(useData), cipher.final()])
  return { key, str: dest.toString('base64') }
}

/**
 * 播放列表AES解密
 * @param data 需要解密的数据
 * @returns 解密结果
 */
export function playlistAesDecrypt(data: AesEncrypt): any {
  const encryptKey = cryptoMd5(data.key).substring(0, 16)
  const iv = cryptoMd5(data.key).substring(16, 32)

  const cipher = crypto.createDecipheriv('aes-128-cbc', encryptKey, iv)
  const dest = Buffer.concat([cipher.update(data.str, 'base64'), cipher.final()])

  const t = dest.toString()
  try {
    return JSON.parse(t)
  } catch (e) {
    return t
  }
}

export { publicLiteRasKey, publicRasKey }

