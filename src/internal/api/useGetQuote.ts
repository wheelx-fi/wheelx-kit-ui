import { useMutation } from '@tanstack/react-query'
import { BASE_API_URL } from './consts'
import axios, { AxiosError } from 'axios'
import { normalizeAssetUrl } from './normalizeAssetUrl'

export interface QuoteRequest {
  from_chain: number
  to_chain: number
  from_token: string
  to_token: string
  from_address: string
  to_address: string
  amount: string
  slippage?: number
  to_platform_id: number
  // quote_only: boolean
}
export interface routesItem {
  name: string
  logo: string
}
interface QuoteResponse {
  request_id?: string
  amount_out: string
  approve?: null
  router_type?: string
  points: number | string
  estimated_time: number
  fee: string
  min_receive: string
  price_impact: {
    bridge_fee: string
    dst_gas_fee: string
    swap_fee: string
    before_discount_fee: string
    discount_percentage?: string
  }
  recipient: string
  router: string
  slippage: number
  quote_message: string | null
  tx: {
    chainId: number
    data: `0x${string}`
    to: `0x${string}`
    value: string
    gas?: bigint | null
    maxFeePerGas?: bigint | undefined
    maxPriorityFeePerGas?: bigint | undefined
  }
  routes?: routesItem[]
}

interface ErrorResponse {
  detail: string
}

interface ErrorResponse2 {
  detail: {
    msg: string
  }[]
}

export const useGetQuote = (signal?: AbortSignal) =>
  useMutation({
    mutationFn: async (requestBody: QuoteRequest) => {
      try {
        const res = await axios.post<QuoteResponse>(
          `${BASE_API_URL}/v1/quote`,
          {
            ...requestBody,
            quote_only: true
          },
          {
            headers: { 'Content-Type': 'application/json' },
            signal
          }
        )

        return {
          ...res.data,
          routes: res.data.routes?.map((route) => ({
            ...route,
            logo: normalizeAssetUrl(route.logo)
          }))
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.code === 'ERR_CANCELED') {
            return null
          }

          if (error.response?.status === 400) {
            const errorData = error.response?.data as ErrorResponse
            throw new Error(errorData.detail)
          }
          if (error.response?.status === 422) {
            const errorData = error.response?.data as ErrorResponse2
            throw new Error(errorData.detail[0].msg)
          }
        }
        throw error
      }
    }
  })
