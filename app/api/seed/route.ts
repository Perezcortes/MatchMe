import { embed } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Función auxiliar para simular puntajes Big Five basados en descripción
function simulateBigFive(personality: string) {
  const isSocial = personality.toLowerCase().includes('sociable') || personality.toLowerCase().includes('fácil');
  const isReserved = personality.toLowerCase().includes('reservado') || personality.toLowerCase().includes('difícil');
  
  return {
    extraversion: isSocial ? 4.5 : (isReserved ? 2.0 : 3.0),
    amabilidad: 4.0, // Por defecto altos en amabilidad
    escrupulosidad: 3.5,
    estabilidad: 3.0,
    apertura: 4.0
  };
}

const realUsers = [
  { name: "Marco Antonio Cruz", age: 24, gender: "Masculino", goal: "amistad", career: "Empresariales", personality: "Reservado, busco trato serio.", hobbies: ["Juegos interactivos", "Tecnología"] },
  { name: "Areli Montaño", age: 20, gender: "Femenino", goal: "networking", career: "Empresariales", personality: "Algo difícil de conectar al principio.", hobbies: ["Hábitos saludables", "Lectura"] },
  { name: "Adaya Vera", age: 25, gender: "Femenino", goal: "amistad", career: "Empresariales", personality: "Muy sociable y fácil de tratar.", hobbies: ["Voluntariado", "Viajes"] },
  { name: "Josue Lopez", age: 21, gender: "Masculino", goal: "amistad", career: "Diseño", personality: "Reservado.", hobbies: ["Arte", "Música"] },
  { name: "Hugo César Morán", age: 20, gender: "Masculino", goal: "amistad", career: "Empresariales", personality: "Me cuesta un poco abrirme.", hobbies: ["Cine", "Videojuegos"] },
  { name: "Veronica Morales", age: 26, gender: "Femenino", goal: "networking", career: "Maestría IA", personality: "Analítica y reservada.", hobbies: ["Tecnología", "Lectura", "Ajedrez"] },
  { name: "Edwin Cruz", age: 27, gender: "Masculino", goal: "amistad", career: "Maestría Robótica", personality: "Selectivo.", hobbies: ["Robótica", "Futuro", "Sci-Fi"] }
];

export async function GET() {
  try {
    const results = [];

    for (const user of realUsers) {
      // 1. Generar Vector (IA)
      const description = `Estudiante de ${user.career}. ${user.personality} Intereses: ${user.hobbies.join(", ")}`;
      const { embedding } = await embed({
        model: google.textEmbeddingModel('text-embedding-004'),
        value: description,
      });

      // 2. Simular Datos de los 4 Pilares
      const bigFive = simulateBigFive(user.personality);

      // 3. Guardar en Supabase con la nueva estructura
      const { error } = await supabase.from('users').insert({
        name: user.name,
        age: user.age,
        gender: user.gender,
        goal: user.goal, // Pilar 3 (parcial)
        
        // Pilar 1: Personalidad
        personality: user.personality, 
        big_five_scores: bigFive,

        // Pilar 2: Hobbies
        hobbies: description, // Texto para IA
        hobbies_list: user.hobbies, // Array para UI

        // Pilar 3: Valores (Simulados para el seed)
        value_main: "Honestidad",
        
        // Pilar 4: Estilo de Vida (Simulados)
        lifestyle_social: user.personality.includes("sociable") ? "Me gusta salir" : "Planes tranquilos",
        
        verified: true,
        embedding: embedding
      });

      if (!error) results.push(user.name);
    }

    return NextResponse.json({ success: true, count: results.length, users: results });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error' }, { status: 500 });
  }
}