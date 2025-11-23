'use server';

import { generateText, embed } from 'ai'; // Importamos 'embed' para vectores
import { google } from '@ai-sdk/google';
import { createClient } from '@supabase/supabase-js'; // Cliente de base de datos
import { z } from 'zod';

// Conexión a Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const profileSchema = z.object({
  goal: z.enum(['amistad', 'networking', 'relacion']),
  hobbies: z.string(),
  values: z.string(),
  personality: z.string(),
});

export async function generatePersonalityReport(formData: FormData) {
  const rawData = {
    goal: formData.get('goal'),
    hobbies: formData.get('hobbies'),
    values: formData.get('values'),
    personality: formData.get('personality'),
  };

  const validatedData = profileSchema.safeParse(rawData);
  
  if (!validatedData.success) return { success: false, error: 'Datos inválidos' };
  
  const data = validatedData.data;

  try {
    // 1. GENERAR REPORTE (TEXTO)
    const { text: report } = await generateText({
      model: google('gemini-2.5-flash'),
      system: 'Eres un psicólogo experto. Sé breve y directo.',
      prompt: `Analiza: Objetivo ${data.goal}, Hobbies ${data.hobbies}, Valores ${data.values}, Personalidad ${data.personality}. Dame un consejo de conexión.`,
    });

    // 2. GENERAR VECTOR (MATEMÁTICAS)
    // Convertimos todo el perfil del usuario en números
    const { embedding } = await embed({
      model: google.textEmbeddingModel('text-embedding-004'),
      value: `${data.goal} ${data.hobbies} ${data.values} ${data.personality}`,
    });

    // 3. GUARDAR EN BASE DE DATOS
    const { error } = await supabase
      .from('users')
      .insert({
        goal: data.goal,
        hobbies: data.hobbies,
        values_text: data.values,
        personality: data.personality,
        ai_report: report,
        embedding: embedding, // ¡Aquí guardamos el "alma" digital!
      });

    if (error) throw new Error(error.message);

    return { success: true, report: report };

  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: 'Error al guardar tu perfil.' };
  }
}