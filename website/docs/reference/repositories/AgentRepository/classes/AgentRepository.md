# Class: AgentRepository

Defined in: [repositories/AgentRepository.ts:7](https://github.com/gurch101/conductor/blob/ca7693e0948bc3c0646f00ecc8fcf2f8829c2840/src/repositories/AgentRepository.ts#L7)

Repository for managing agents in the database.

## Constructors

### Constructor

> **new AgentRepository**(): `AgentRepository`

#### Returns

`AgentRepository`

## Methods

### create()

> `static` **create**(`agent`): `void`

Defined in: [repositories/AgentRepository.ts:33](https://github.com/gurch101/conductor/blob/ca7693e0948bc3c0646f00ecc8fcf2f8829c2840/src/repositories/AgentRepository.ts#L33)

Creates a new agent in the database.

#### Parameters

##### agent

`Agent`

The agent object to create.

#### Returns

`void`

***

### findByTeamId()

> `static` **findByTeamId**(`teamId`): `DBAgent`[]

Defined in: [repositories/AgentRepository.ts:13](https://github.com/gurch101/conductor/blob/ca7693e0948bc3c0646f00ecc8fcf2f8829c2840/src/repositories/AgentRepository.ts#L13)

Finds agents belonging to a specific team.

#### Parameters

##### teamId

`string`

The ID of the team.

#### Returns

`DBAgent`[]

A list of database agents.

***

### findLogsByAgentId()

> `static` **findLogsByAgentId**(`agentId`): `string`[]

Defined in: [repositories/AgentRepository.ts:22](https://github.com/gurch101/conductor/blob/ca7693e0948bc3c0646f00ecc8fcf2f8829c2840/src/repositories/AgentRepository.ts#L22)

Finds all logs for a specific agent.

#### Parameters

##### agentId

`string`

The ID of the agent.

#### Returns

`string`[]

A list of log contents.
