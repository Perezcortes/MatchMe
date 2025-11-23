import { iconMap, IconType } from '@/lib/icons'

interface IconProps {
  name: IconType
  size?: number
  className?: string
}

export default function Icon({ name, size = 24, className = '' }: IconProps) {
  const IconComponent = iconMap[name]?.icon
  const colorClass = iconMap[name]?.color || 'text-gray-600'
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }
  
  return <IconComponent size={size} className={`${colorClass} ${className}`} />
}