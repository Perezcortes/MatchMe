// app/components/Icon.tsx

'use client';

import { iconMap, IconType } from '@/lib/icons'
import { FaQuestionCircle } from 'react-icons/fa'

interface IconProps {
  name: string; // Usamos string para permitir flexibilidad
  size?: number;
  className?: string;
}

export default function Icon({ name, size = 24, className = '' }: IconProps) {
  // Intentamos obtener la entrada del mapa
  // Casteamos 'name' para intentar buscarlo, pero estamos preparados si falla
  const entry = iconMap[name as IconType]

  // Si no existe el icono, mostramos un fallback seguro
  if (!entry) {
    // Solo mostramos advertencia en desarrollo para no ensuciar producción
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Icon "${name}" not found in library. Using fallback.`)
    }
    return <FaQuestionCircle size={size} className={`text-gray-300 ${className}`} />
  }

  const IconComponent = entry.icon
  
  // Si pasan className con color (ej: text-red-500), lo respetamos.
  // Si no, usamos el color por defecto definido en el mapa.
  const hasCustomColor = className.includes('text-');
  const colorClass = hasCustomColor ? '' : entry.color;

  return <IconComponent size={size} className={`${colorClass} ${className}`} />
}