const SLIPPAGE = 'slippage'

// Utility functions for localStorage and sessionStorage
export const getLocalStorage = (key: string): string => {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(key) as string
  }
  return null as unknown as string
}

const removeLocalStorage = (key: string): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(key)
  }
}

const setLocalStorage = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, value)
  }
}

interface StoreData {
  [key: string]: object
}

class Store {
  private key: string

  constructor(storageKey: string = SLIPPAGE) {
    this.key = storageKey
  }

  private getStorageData(): StoreData {
    const data = getLocalStorage(this.key)
    return data ? JSON.parse(data) : {}
  }

  private setStorageData(data: StoreData): void {
    setLocalStorage(this.key, JSON.stringify(data))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public get(label: string): any | null {
    const data = this.getStorageData()
    return data[label] || null
  }

  public set(label: string, obj: object): void {
    const data = this.getStorageData()
    data[label] = {
      ...data[label],
      ...obj
    }
    this.setStorageData(data)
  }

  public remove(label: string): void {
    const data = this.getStorageData()
    delete data[label]
    this.setStorageData(data)
  }

  public clear(): void {
    removeLocalStorage(this.key)
  }
}

export const slippageStore = new Store()

export default Store
