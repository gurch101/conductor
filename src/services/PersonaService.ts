import { PersonaRepository } from '@/repositories/PersonaRepository';
import type { Persona } from '@/types';

/**
 * Service for managing personas.
 */
export class PersonaService {
  /**
   * Retrieves all personas and parses their JSON schemas.
   * @returns A list of parsed personas.
   */
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
