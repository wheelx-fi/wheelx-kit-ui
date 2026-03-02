declare module '*.svg' {
  import * as React from 'react'
  const component: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  export default component
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}
