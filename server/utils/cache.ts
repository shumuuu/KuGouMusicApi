/**
 * 简单的内存缓存实现
 * 用于替代原有的apicache中间件
 */

interface CacheItem {
  value: any
  timestamp: number
  duration: number
}

class MemoryCache {
  private cache = new Map<string, CacheItem>()

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param duration 缓存时长（毫秒）
   */
  set(key: string, value: any, duration: number = 3600000): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      duration
    })
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存值或null
   */
  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    // 检查是否过期
    if (Date.now() - item.timestamp > item.duration) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }
}

// 创建全局缓存实例
const memoryCache = new MemoryCache()

/**
 * 缓存中间件
 * @param duration 缓存时长
 * @param shouldCache 是否应该缓存的判断函数
 * @returns 中间件函数
 */
export const cache = (duration: string | number, shouldCache?: (req: any, res: any) => boolean) => {
  const durationMs = typeof duration === 'string' 
    ? parseDuration(duration) 
    : duration

  return (req: any, res: any, next: any) => {
    const key = `${req.method}:${req.url}`
    
    // 尝试从缓存获取
    const cached = memoryCache.get(key)
    if (cached) {
      return res.json(cached)
    }

    // 保存原始的res.json方法
    const originalJson = res.json.bind(res)
    
    // 重写res.json方法以支持缓存
    res.json = (data: any) => {
      // 检查是否应该缓存
      if (!shouldCache || shouldCache(req, res)) {
        memoryCache.set(key, data, durationMs)
      }
      return originalJson(data)
    }

    next()
  }
}

/**
 * 解析时长字符串
 * @param duration 时长字符串
 * @returns 毫秒数
 */
function parseDuration(duration: string): number {
  const timeUnits: Record<string, number> = {
    ms: 1,
    second: 1000,
    minute: 60000,
    hour: 3600000,
    day: 3600000 * 24,
    week: 3600000 * 24 * 7,
    month: 3600000 * 24 * 30
  }

  const match = duration.match(/^([\d\.,]+)\s?(\w+)$/)
  if (match && match.length === 3) {
    const len = parseFloat(match[1])
    let unit = match[2].replace(/s$/i, '').toLowerCase()
    if (unit === 'm') unit = 'ms'
    
    return (len || 1) * (timeUnits[unit] || 0)
  }

  return 3600000 // 默认1小时
}

export { memoryCache }

