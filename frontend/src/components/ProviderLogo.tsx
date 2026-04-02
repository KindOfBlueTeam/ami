import { useState } from 'react'
import { getProviderLogoUrl } from '../utils/providerLogos'

interface Props {
  name: string
  logoColor?: string
  size?: 'xs' | 'sm' | 'md'
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-xs rounded-md',
  sm: 'w-8 h-8 text-sm rounded-lg',
  md: 'w-10 h-10 text-sm rounded-xl',
}

export default function ProviderLogo({ name, logoColor, size = 'md' }: Props) {
  const logoUrl = getProviderLogoUrl(name)
  const [imgFailed, setImgFailed] = useState(false)
  const cls = SIZE_CLASSES[size]

  if (logoUrl && !imgFailed) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`${cls} object-contain shrink-0`}
        onError={() => setImgFailed(true)}
      />
    )
  }

  return (
    <div
      className={`${cls} flex items-center justify-center text-white font-semibold shrink-0`}
      style={{ backgroundColor: logoColor ?? '#6B7280' }}
    >
      {name.charAt(0)}
    </div>
  )
}
