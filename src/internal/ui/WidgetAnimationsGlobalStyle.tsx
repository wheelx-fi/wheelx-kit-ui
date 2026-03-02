'use client'

import { Global, css } from '@emotion/react'

import wheelSprites from '../assets/images/wheel-sprites.png'
import successSprites from '../assets/images/success-sprites.png'
import errorImage from '../assets/images/error.png'
import { getAssetSrc } from '../utils/getAssetSrc'

const wheelSpriteUrl = getAssetSrc(wheelSprites)
const successSpriteUrl = getAssetSrc(successSprites)
const errorImageUrl = getAssetSrc(errorImage)

export const WidgetAnimationsGlobalStyle = () => (
  <Global
    styles={css`
      .animation-wheel {
        width: 280px;
        height: 280px;
        background-image: url(${wheelSpriteUrl});
        background-repeat: no-repeat;
        animation-name: keyframes-wheel;
        animation-duration: 5s;
        animation-delay: 0s;
        animation-iteration-count: infinite;
        animation-fill-mode: forwards;
        animation-timing-function: steps(1);
      }

      .animation-success {
        width: 280px;
        height: 280px;
        background-image: url(${successSpriteUrl});
        background-repeat: no-repeat;
        animation-name: keyframes-success;
        animation-duration: 2s;
        animation-delay: 0s;
        animation-iteration-count: 1;
        animation-fill-mode: forwards;
        animation-timing-function: steps(1);
      }

      .animation-loading {
        animation-duration: 1s;
        animation-iteration-count: 1;
        animation-timing-function: ease-in-out;
        transform-origin: center;
      }

      .failure {
        width: 280px;
        height: 280px;
        background: url(${errorImageUrl}) no-repeat center center/126px 126px;
      }

      @keyframes keyframes-loading {
        0% {
          transform: rotate(0deg);
        }

        100% {
          transform: rotate(-360deg);
        }
      }

      @keyframes keyframes-wheel {
        0% {
          width: 280px;
          height: 280px;
          background-image: url(${wheelSpriteUrl});
        }

        3.13% {
          background-position: -280px 0px;
        }

        6.25% {
          background-position: -560px 0px;
        }

        9.38% {
          background-position: -840px 0px;
        }

        12.5% {
          background-position: -1120px 0px;
        }

        15.63% {
          background-position: -1400px 0px;
        }

        18.75% {
          background-position: -1680px 0px;
        }

        21.88% {
          background-position: -1960px 0px;
        }

        25% {
          background-position: -2240px 0px;
        }

        28.13% {
          background-position: -2520px 0px;
        }

        31.25% {
          background-position: -2800px 0px;
        }

        34.38% {
          background-position: -3080px 0px;
        }

        37.5% {
          background-position: -3360px 0px;
        }

        40.63% {
          background-position: -3640px 0px;
        }

        43.75% {
          background-position: -3920px 0px;
        }

        46.88% {
          background-position: -4200px 0px;
        }

        50% {
          background-position: -4480px 0px;
        }

        53.13% {
          background-position: -4760px 0px;
        }

        56.25% {
          background-position: -5040px 0px;
        }

        59.38% {
          background-position: -5320px 0px;
        }

        62.5% {
          background-position: -5600px 0px;
        }

        65.63% {
          background-position: -5880px 0px;
        }

        68.75% {
          background-position: -6160px 0px;
        }

        71.88% {
          background-position: -6440px 0px;
        }

        75% {
          background-position: -6720px 0px;
        }

        78.13% {
          background-position: -7000px 0px;
        }

        81.25% {
          background-position: -7280px 0px;
        }

        84.38% {
          background-position: -7560px 0px;
        }

        87.5% {
          background-position: -7840px 0px;
        }

        90.63% {
          background-position: -8120px 0px;
        }

        93.75% {
          background-position: -8400px 0px;
        }

        96.88%,
        100% {
          background-position: -8680px 0px;
        }
      }

      @keyframes keyframes-success {
        0% {
          width: 280px;
          height: 280px;
          background-image: url(${successSpriteUrl});
        }

        3.85% {
          background-position: -280px 0px;
        }

        7.69% {
          background-position: -560px 0px;
        }

        11.54% {
          background-position: -840px 0px;
        }

        15.38% {
          background-position: -1120px 0px;
        }

        19.23% {
          background-position: -1400px 0px;
        }

        23.08% {
          background-position: -1680px 0px;
        }

        26.92% {
          background-position: -1960px 0px;
        }

        30.77% {
          background-position: -2240px 0px;
        }

        34.62% {
          background-position: -2520px 0px;
        }

        38.46% {
          background-position: -2800px 0px;
        }

        42.31% {
          background-position: -3080px 0px;
        }

        46.15% {
          background-position: -3360px 0px;
        }

        50% {
          background-position: -3640px 0px;
        }

        53.85% {
          background-position: -3920px 0px;
        }

        57.69% {
          background-position: -4200px 0px;
        }

        61.54% {
          background-position: -4480px 0px;
        }

        65.38% {
          background-position: -4760px 0px;
        }

        69.23% {
          background-position: -5040px 0px;
        }

        73.08% {
          background-position: -5320px 0px;
        }

        76.92% {
          background-position: -5600px 0px;
        }

        80.77% {
          background-position: -5880px 0px;
        }

        84.62% {
          background-position: -6160px 0px;
        }

        88.46% {
          background-position: -6440px 0px;
        }

        92.31% {
          background-position: -6720px 0px;
        }

        100% {
          background-position: -7000px 0px;
        }
      }

      @keyframes svg_loader {
        0% {
          stroke-dasharray: 0, 101;
        }

        100% {
          stroke-dasharray: 65, 101;
        }
      }
    `}
  />
)
