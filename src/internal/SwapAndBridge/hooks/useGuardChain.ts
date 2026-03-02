import { switchChain } from '@wagmi/core'
import { useCallback, useRef, useState } from 'react'
import { Config, useChainId, useConfig } from 'wagmi'

import { logger } from '../../utils'

// export const useGuardChain = () => {
//   const { address } = useAccount();
//   const chainId = useChainId();
//   const { switchChain } = useSwitchChain();
//   const { fromTokenInfo } = useSwapAndBridgeContextStore();
//   useEffect(() => {
//     if (address) {
//       if (chainId !== fromTokenInfo.chainId) {
//         switchChain({ chainId: fromTokenInfo.chainId });
//       }
//     }
//   }, [chainId, fromTokenInfo.chainId, switchChain, address]);
// };

export const useGuardChain = (
  callback: () => void,
  requiredChainId: number
) => {
  const [isSwitching, setIsSwitching] = useState(false)

  const cb = useRef(callback)
  cb.current = callback

  const chainId = useChainId()

  const config = useConfig()

  return {
    isSwitching,
    sendTx: useCallback(async () => {
      if (chainId !== requiredChainId) {
        console.log('###chainId is !== requiredChainId, need switch chain###')
        try {
          setIsSwitching(true)
          await connectRequiredChain(config, requiredChainId)
          console.log('###switch chain success###')
          setIsSwitching(false)
        } catch (error) {
          setIsSwitching(false)
          console.log('###switch chain fail###')
          logger.error('switch chain error', error)
        }
      }
      cb.current()
    }, [chainId, config, requiredChainId])
  }
}

async function connectRequiredChain(config: Config, chainId: number) {
  await switchChain(config, { chainId })
}
