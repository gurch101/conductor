import { PersonaRepository } from '@/repositories/PersonaRepository';
import { AgentRepository } from '@/repositories/AgentRepository';
import type { Persona } from '@/types';

/**
 * Service for managing personas.
 */
export class PersonaService {
  /**
   * Retrieves all personas.
   * @returns A list of personas.
   */
  static getAllPersonas(): Persona[] {
    const personas = PersonaRepository.findAll();
    return personas.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar || '',
      description: p.description || '',
      skill: p.skill,
    }));
  }

  /**
   * Deletes a persona by ID.
   * @param id The ID of the persona to delete.
   * @throws Error if the persona is currently in use by an agent.
   */
  static deletePersona(id: string): void {
    const agentsUsingPersona = AgentRepository.findByPersonaId(id);
    if (agentsUsingPersona.length > 0) {
      throw new Error('Cannot delete a persona that is currently in use by one or more agents.');
    }
    PersonaRepository.delete(id);
  }
}
