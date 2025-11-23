import { GoogleGenerativeAI } from '@google/generative-ai'

// Usa la variable pública
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY!)

export async function generateSelfKnowledgeReport(userProfile: any) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' })

    const prompt = `
      Eres un psicólogo experto en relaciones humanas y compatibilidad. 
      Genera un reporte de autoconocimiento BREVE y ÚTIL en español (máximo 200 palabras) basado en este perfil:

      OBJETIVO: ${userProfile.objective}
      
      PERSONALIDAD (Big Five):
      - Extraversión: ${userProfile.personality?.extraversion}/5
      - Amabilidad: ${userProfile.personality?.amabilidad}/5  
      - Escrupulosidad: ${userProfile.personality?.escrupulosidad}/5
      - Estabilidad emocional: ${userProfile.personality?.estabilidad_emocional}/5
      - Apertura: ${userProfile.personality?.apertura}/5

      INTERESES PRINCIPALES: ${userProfile.interests?.join(', ')}

      VALORES: ${JSON.stringify(userProfile.values)}

      ESTILO DE VIDA: ${JSON.stringify(userProfile.lifestyle)}

      Instrucciones:
      1. Identifica los 2 rasgos de personalidad más dominantes
      2. Relaciona los intereses con el estilo de personalidad
      3. Da una interpretación breve pero significativa
      4. Sugiere el tipo de personas con las que probablemente conectaría mejor
      5. Usa un tono positivo y constructivo
      6. Formato: párrafos cortos, fácil de leer

      Ejemplo de estructura:
      "Tu personalidad muestra... Tus intereses en X y Y revelan... Conectas mejor con personas que..."
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating AI report:', error)
    return generateFallbackReport(userProfile)
  }
}

// El resto del código se mantiene igual...
function generateFallbackReport(userProfile: any): string {
  const topTraits = getTopTraits(userProfile.personality)
  
  return `
    **Tu Reporte de Autoconocimiento**

    **Personalidad:** Eres una persona con ${topTraits[0]} y ${topTraits[1]}. 
    Esta combinación sugiere que valoras ${getTraitDescription(topTraits[0])} 
    y ${getTraitDescription(topTraits[1])}.

    **Intereses:** Tus intereses en ${userProfile.interests?.slice(0, 2).join(' y ')} 
    indican que disfrutas actividades que ${getInterestDescription(userProfile.interests)}.

    **Compatibilidad:** Conectas mejor con personas que comparten tus valores fundamentales 
    y tienen un estilo de vida similar al tuyo. Busca personas que aprecien tu 
    ${getObjectiveDescription(userProfile.objective)}.

    **Recomendación:** Enfócate en conexiones que permitan ${getGrowthSuggestion(userProfile)}.
  `
}

function getTopTraits(personality: any): string[] {
  if (!personality) return ['equilibrio', 'adaptabilidad']
  
  const traits = Object.entries(personality)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 2)
    .map(([trait]) => trait)
  
  return traits.length === 2 ? traits : ['equilibrio', 'adaptabilidad']
}

function getTraitDescription(trait: string): string {
  const descriptions: {[key: string]: string} = {
    extraversion: 'la interacción social y la energía grupal',
    amabilidad: 'la cooperación y las relaciones armoniosas', 
    escrupulosidad: 'la organización y la responsabilidad',
    estabilidad_emocional: 'la calma y la resiliencia emocional',
    apertura: 'la creatividad y las nuevas experiencias',
    equilibrio: 'el balance en diferentes situaciones',
    adaptabilidad: 'la flexibilidad y el ajuste al cambio'
  }
  return descriptions[trait] || 'el crecimiento personal'
}

function getInterestDescription(interests: string[]): string {
  if (!interests || interests.length === 0) return 'son variados y enriquecedores'
  return 'te permiten expresarte y conectar con otros'
}

function getObjectiveDescription(objective: string): string {
  const descriptions: {[key: string]: string} = {
    amistad: 'enfoque en amistades genuinas',
    networking: 'interés en crecimiento profesional', 
    relacion: 'búsqueda de conexiones profundas'
  }
  return descriptions[objective] || 'enfoque en conexiones significativas'
}

function getGrowthSuggestion(userProfile: any): string {
  return 'el desarrollo mutuo y las experiencias compartidas'
}