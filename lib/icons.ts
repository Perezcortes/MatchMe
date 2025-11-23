import { 
  FaHeart, FaUserFriends, FaHandshake, FaMusic, FaPalette, 
  FaPlane, FaFilm, FaBook, FaGamepad, FaMountain, 
  FaUtensils, FaLaptop, FaRocket, FaPaw, FaRunning,
  FaUsers, FaBriefcase, FaHome, FaGlobe, FaLightbulb,
  FaChartLine, FaBalanceScale, FaSeedling, FaCompass,
  FaInfoCircle, FaArrowLeft, FaArrowRight
} from 'react-icons/fa'

export const iconMap = {
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
  arrow_right: { icon: FaArrowRight, color: 'text-current' }
}

export type IconType = keyof typeof iconMap