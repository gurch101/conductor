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
      id: p.id,
      name: p.name,
      avatar: p.avatar || '',
      systemPrompt: p.systemPrompt,
      input_schema: JSON.parse(p.inputSchema || '[]'),
      output_schema: JSON.parse(p.outputSchema || '[]'),
    }));
  }
}
