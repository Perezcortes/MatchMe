// lib/icons.ts

// 1. Importamos React y los tipos necesarios de react-icons
import React from 'react';
import { IconBaseProps } from 'react-icons';

// 2. Tus importaciones existentes de iconos
import { 
  FaHeart, FaUserFriends, FaHandshake, FaMusic, FaPalette, 
  FaPlane, FaFilm, FaBook, FaGamepad, FaMountain, 
  FaUtensils, FaLaptop, FaRocket, FaPaw, FaRunning,
  FaUsers, FaBriefcase, FaHome, FaGlobe, FaLightbulb,
  FaChartLine, FaBalanceScale, FaSeedling, FaCompass,
  FaInfoCircle, FaArrowLeft, FaArrowRight
} from 'react-icons/fa'

// 3. Definimos la interfaz para cada entrada del mapa
// Esto le dice a TS: "Cada entrada tiene un icono (que es un componente React que acepta props básicas de icono) y un color (string)"
interface IconMapEntry {
  icon: React.ComponentType<IconBaseProps>;
  color: string;
}

// 4. Definimos el mapa con el tipo explícito Record<string, IconMapEntry>
export const iconMap: Record<string, IconMapEntry> = {
  // Objetivos
  amistad: { icon: FaUserFriends, color: 'text-blue-600' },
  networking: { icon: FaHandshake, color: 'text-green-600' },
  relacion: { icon: FaHeart, color: 'text-pink-600' },
  
  // Intereses
  actividad_fisica: { icon: FaRunning, color: 'text-red-500' },
  musica: { icon: FaMusic, color: 'text-purple-500' },
  arte: { icon: FaPalette, color: 'text-yellow-500' },
  viajes: { icon: FaPlane, color: 'text-blue-500' },
  cine_series: { icon: FaFilm, color: 'text-indigo-500' },
  lectura: { icon: FaBook, color: 'text-amber-700' },
  videojuegos: { icon: FaGamepad, color: 'text-green-500' },
  naturaleza: { icon: FaMountain, color: 'text-green-600' },
  gastronomia: { icon: FaUtensils, color: 'text-orange-500' },
  tecnologia: { icon: FaLaptop, color: 'text-blue-400' },
  emprendimiento: { icon: FaRocket, color: 'text-purple-600' },
  mascotas: { icon: FaPaw, color: 'text-amber-600' },
  
  // Valores
  honestidad: { icon: FaBalanceScale, color: 'text-gray-600' },
  lealtad: { icon: FaUsers, color: 'text-blue-600' },
  responsabilidad: { icon: FaBriefcase, color: 'text-green-600' },
  ambicion: { icon: FaChartLine, color: 'text-purple-600' },
  calma: { icon: FaHome, color: 'text-teal-500' },
  amor_propio: { icon: FaHeart, color: 'text-pink-500' },
  aventura: { icon: FaCompass, color: 'text-orange-500' },
  creatividad: { icon: FaLightbulb, color: 'text-yellow-500' },
  
  // Visiones futuras
  independiente: { icon: FaGlobe, color: 'text-blue-500' },
  carrera: { icon: FaBriefcase, color: 'text-gray-600' },
  familia: { icon: FaUsers, color: 'text-green-500' },
  tradicional: { icon: FaHome, color: 'text-amber-700' },
  viajando: { icon: FaPlane, color: 'text-purple-500' },
  minimalista: { icon: FaSeedling, color: 'text-green-400' },

  // Iconos generales
  info: { icon: FaInfoCircle, color: 'text-blue-500' },
  arrow_left: { icon: FaArrowLeft, color: 'text-current' },
  arrow_right: { icon: FaArrowRight, color: 'text-current' },

  // 5. Iconos personalizados actualizados con tipos explícitos
  logout: {
    // Usamos (props: IconBaseProps) para que coincida con el tipo esperado
    icon: (props: IconBaseProps) => (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        // Usamos props.size y props.className
        width={props.size} 
        height={props.size} 
        className={props.className}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 2.062-2.062m0 0-2.062-2.062m2.062 2.062H7.5" />
      </svg>
    ),
    color: "text-gray-600",
  },
  usuario: {
    // Usamos (props: IconBaseProps) para que coincida con el tipo esperado
    icon: (props: IconBaseProps) => (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        // Usamos props.size y props.className
        width={props.size} 
        height={props.size} 
        className={props.className}
      >
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.602-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
      </svg>
    ),
    color: "text-gray-600",
  },
}

export type IconType = keyof typeof iconMap