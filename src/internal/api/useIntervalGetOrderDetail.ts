import { useQuery } from '@tanstack/react-query'
import { BASE_API_URL } from './consts'
import { TokenInfo } from './useChainsAndTokens'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { normalizeAssetUrl } from './normalizeAssetUrl'

export type OrderStatus = 'Open' | 'Filled' | 'Refund' | 'Failed'

export interface OrderDetail {
  data: string
  fill_block: number | null
  fill_timestamp: string | null
  fill_tx_hash: `0x${string}` | null
  from_amount: string
  from_chain: number
  from_token: string
  open_block: number
  open_timestamp: string
  open_tx_hash: string
  order_id: string
  status: OrderStatus
  to_address: string
  to_chain: number
  to_token: string
  to_amount: string
  from_token_info: TokenInfo | null
  to_token_info: TokenInfo | null
  points: number
  reward_type: string
  reward_value: object
  to_platform_id: number
}

export async function getOrderDetail(orderId: string) {
  const res = await axios.get<OrderDetail>(
    `${BASE_API_URL}/v1/order/${orderId}`
  )

  const normalizeTokenInfo = (token?: TokenInfo | null): TokenInfo | null => {
    if (!token) return null
    return {
      ...token,
      logo: normalizeAssetUrl(token.logo),
      chain_icon: normalizeAssetUrl(token.chain_icon)
    }
  }

  return {
    ...res.data,
    from_token_info: normalizeTokenInfo(res.data.from_token_info),
    to_token_info: normalizeTokenInfo(res.data.to_token_info)
  }
}

export const useIntervalGetOrderDetail = ({
  orderId,
  enabled = true
}: {
  orderId: string | null
  enabled?: boolean
}) => {
  const result = useQuery({
    queryKey: ['orderDetail', orderId],
    queryFn: () => getOrderDetail(orderId ?? ''),
    refetchInterval: 1_000,
    refetchOnMount: false,
    enabled: !!orderId && enabled
    // refetchOnWindowFocus: false
  })
  return result
}

export const useIntervalGetOrderDetailPlus = ({
  orderId,
  enabled = true,
  maxRefetchAttempts = 50
}: {
  orderId: string | null
  enabled?: boolean
  maxRefetchAttempts?: number
}) => {
  const [attemptCount, setAttemptCount] = useState(0)
  const [shouldStop, setShouldStop] = useState(false)

  const result = useQuery({
    queryKey: ['orderDetail', orderId],
    queryFn: () => getOrderDetail(orderId ?? ''),
    refetchInterval: () => {
      if (attemptCount >= maxRefetchAttempts || shouldStop) {
        return false
      }
      return 1000
    },
    refetchOnMount: false,
    enabled:
      !!orderId && enabled && !shouldStop && attemptCount < maxRefetchAttempts
  })

  useEffect(() => {
    if (result.isFetching) {
      setAttemptCount((prev) => prev + 1)
    }
  }, [result.isFetching])

  useEffect(() => {
    if (
      attemptCount >= maxRefetchAttempts &&
      result?.data?.status !== 'Filled'
    ) {
      setShouldStop(true)
      console.log(
        `The polling has reached its maximum number (${maxRefetchAttempts} times), but no result of the required field has been obtained`
      )
    }
    if (result?.data?.status === 'Filled') {
      setShouldStop(true)
    }
  }, [attemptCount, maxRefetchAttempts, result.data, orderId])

  return {
    ...result,
    attemptCount,
    shouldStop
  }
}
