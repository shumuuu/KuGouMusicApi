import pako from 'pako'

/**
 * 随机字符串
 * @param len 长度
 * @returns 随机字符串
 */
export const randomString = (len: number = 16): string => {
  const keyString = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const _key: string[] = []
  const keyStringArr = keyString.split('')
  for (let i = 0; i < len; i += 1) {
    const ceil = Math.ceil((keyStringArr.length - 1) * Math.random())
    const _tmp = keyStringArr[ceil]
    _key.push(_tmp)
  }
  return _key.join('')
}

/**
 * 格式化cookie
 * @param cookie cookie字符串
 * @returns 格式化后的cookie字符串
 */
export const parseCookieString = (cookie: string): string => {
  const t = cookie.replace(/\s*(Domain|domain|path|expires)=[^(;|$)]+;*/g, '')
  return t.replace(/;HttpOnly/g, '')
}

/**
 * cookie 转 json
 * @param cookie cookie字符串
 * @returns cookie对象
 */
export const cookieToJson = (cookie: string): Record<string, string> => {
  if (!cookie) return {}
  const cookieArr = cookie.split(';')
  const obj: Record<string, string> = {}
  cookieArr.forEach((i) => {
    const arr = i.split('=')
    obj[arr[0]] = arr[1]
  })
  return obj
}

/**
 * krc解码
 * @param val 需要解码的数据
 * @returns 解码后的字符串
 */
export const decodeLyrics = (val: string | Uint8Array | Buffer): string => {
  let bytes: Uint8Array | null = null
  if (val instanceof Uint8Array) bytes = val
  if (Buffer.isBuffer(val)) bytes = new Uint8Array(val)
  if (typeof val === 'string') bytes = new Uint8Array(Buffer.from(val, 'base64'))
  if (bytes === null) return ''
  
  const enKey = [64, 71, 97, 119, 94, 50, 116, 71, 81, 54, 49, 45, 206, 210, 110, 105]
  const krcBytes = bytes.slice(4)
  const len = krcBytes.byteLength
  for (let index = 0; index < len; index += 1) {
    krcBytes[index] = krcBytes[index] ^ enKey[index % enKey.length]
  }
  try {
    const inflate = pako.inflate(krcBytes)
    return Buffer.from(inflate).toString('utf8')
  } catch {
    return ''
  }
}

