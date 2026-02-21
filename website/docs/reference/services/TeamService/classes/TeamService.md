# Class: TeamService

Defined in: [services/TeamService.ts:9](https://github.com/gurch101/conductor/blob/f0ea3b784a57146105966bb8ee5b05eb1690a55f/src/services/TeamService.ts#L9)

Service for managing teams and their associated agents and connections.

## Constructors

### Constructor

> **new TeamService**(): `TeamService`

#### Returns

`TeamService`

## Methods

### createTeam()

> `static` **createTeam**(`name`, `objective`): `Team`

Defined in: [services/TeamService.ts:36](https://github.com/gurch101/conductor/blob/f0ea3b784a57146105966bb8ee5b05eb1690a55f/src/services/TeamService.ts#L36)

Creates a new team with the specified name and objective.

#### Parameters

##### name

`string`

The name of the team.

##### objective

`string`

The objective of the team.

#### Returns

`Team`

The newly created team.

***

### getAllTeams()

> `static` **getAllTeams**(): `Team`[]

Defined in: [services/TeamService.ts:14](https://github.com/gurch101/conductor/blob/f0ea3b784a57146105966bb8ee5b05eb1690a55f/src/services/TeamService.ts#L14)

Retrieves all teams with their agents and connections fully hydrated.

#### Returns

`Team`[]

A list of hydrated teams.

***

### getTeamById()

> `static` **getTeamById**(`id`): `Team` \| `null`

Defined in: [services/TeamService.ts:24](https://github.com/gurch101/conductor/blob/f0ea3b784a57146105966bb8ee5b05eb1690a55f/src/services/TeamService.ts#L24)

Finds a team by ID and returns it fully hydrated.

#### Parameters

##### id

`string`

The ID of the team.

#### Returns

`Team` \| `null`

The hydrated team or null if not found.
