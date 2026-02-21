import { describe, it, expect, beforeAll } from 'bun:test';
import { TeamService } from '@/services/TeamService';
import { initDb } from '@/db';
import type { Team } from '@/types';

describe('TeamService', () => {
  beforeAll(() => {
    initDb();
  });

  it('updateTeam should modify an existing team', () => {
    // 1. Create a team
    const initialName = 'Initial Team Name';
    const initialObjective = 'Initial Objective';
    const team = TeamService.createTeam(initialName, initialObjective);
    expect(team.name).toBe(initialName);
    expect(team.objective).toBe(initialObjective);

    // 2. Update it
    const newName = 'Updated Team Name';
    const newObjective = 'Updated Objective';
    TeamService.updateTeam(team.id, newName, newObjective);

    // 3. Retrieve and verify
    const updatedTeam = TeamService.getTeamById(team.id);
    expect(updatedTeam).toBeDefined();
    expect(updatedTeam?.name).toBe(newName);
    expect(updatedTeam?.objective).toBe(newObjective);
  });

  it('createTeam should fail if name is empty', () => {
    expect(() => TeamService.createTeam('', 'Objective')).toThrow('Team name is required.');
    expect(() => TeamService.createTeam('   ', 'Objective')).toThrow('Team name is required.');
  });

  it('createTeam should fail if name is not unique', () => {
    const name = 'Duplicate Name';
    TeamService.createTeam(name, 'First');
    expect(() => TeamService.createTeam(name, 'Second')).toThrow(`Team name "${name}" is already taken.`);
  });

  it('updateTeam should fail if name is empty', () => {
    const team = TeamService.createTeam('Valid Name', 'Objective');
    expect(() => TeamService.updateTeam(team.id, '', 'New Obj')).toThrow('Team name is required.');
  });

  it('updateTeam should fail if name is taken by another team', () => {
    const team1 = TeamService.createTeam('Team 1', 'Obj 1');
    const team2 = TeamService.createTeam('Team 2', 'Obj 2');
    expect(() => TeamService.updateTeam(team2.id, 'Team 1', 'Updated Obj')).toThrow('Team name "Team 1" is already taken.');
  });

  it('updateTeam should succeed if name is same for the same team', () => {
    const team = TeamService.createTeam('Same Name', 'Obj');
    // This should NOT throw
    TeamService.updateTeam(team.id, 'Same Name', 'New Obj');
    const updated = TeamService.getTeamById(team.id);
    expect(updated?.objective).toBe('New Obj');
  });

  it('deleteTeam should remove the team from the database', () => {
    const team = TeamService.createTeam('To Be Deleted', 'Objective');
    const id = team.id;
    expect(TeamService.getTeamById(id)).toBeDefined();

    TeamService.deleteTeam(id);
    expect(TeamService.getTeamById(id)).toBeNull();
  });

  it('createTeam should generate a team with empty agents and connections', () => {
    const team = TeamService.createTeam('Service Test Team', 'Objective');
    expect(team.id).toBeDefined();
    expect(Array.isArray(team.agents)).toBe(true);
    expect(team.agents.length).toBe(0);
    expect(Array.isArray(team.connections)).toBe(true);
    expect(team.connections.length).toBe(0);
  });
});
