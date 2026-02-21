import { PersonaRepository } from '@/repositories/PersonaRepository';
import { Persona } from '@/types';

export class PersonaService {
  static getAllPersonas(): Persona[] {
    const personas = PersonaRepository.findAll();
    return personas.map((p) => ({
      ...p,
      systemPrompt: p.system_prompt,
      input_schema: JSON.parse(p.input_schema || '[]'),
      output_schema: JSON.parse(p.output_schema || '[]'),
    }));
  }
}
