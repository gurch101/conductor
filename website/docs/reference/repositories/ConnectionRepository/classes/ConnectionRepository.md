# Class: ConnectionRepository

Defined in: [repositories/ConnectionRepository.ts:7](https://github.com/gurch101/conductor/blob/ca7693e0948bc3c0646f00ecc8fcf2f8829c2840/src/repositories/ConnectionRepository.ts#L7)

Repository for managing agent connections in the database.

## Constructors

### Constructor

> **new ConnectionRepository**(): `ConnectionRepository`

#### Returns

`ConnectionRepository`

## Methods

### create()

> `static` **create**(`data`): `void`

Defined in: [repositories/ConnectionRepository.ts:26](https://github.com/gurch101/conductor/blob/ca7693e0948bc3c0646f00ecc8fcf2f8829c2840/src/repositories/ConnectionRepository.ts#L26)

Creates a new connection in the database.

#### Parameters

##### data

The connection data.

###### source_handle

`string` \| `null`

The handle of the source agent's output.

###### source_id

`string`

The ID of the source agent.

###### target_handle

`string` \| `null`

The handle of the target agent's input.

###### target_id

`string`

The ID of the target agent.

###### team_id

`string`

The ID of the team.

#### Returns

`void`

***

### findByTeamId()

> `static` **findByTeamId**(`teamId`): `DBConnection`[]

Defined in: [repositories/ConnectionRepository.ts:13](https://github.com/gurch101/conductor/blob/ca7693e0948bc3c0646f00ecc8fcf2f8829c2840/src/repositories/ConnectionRepository.ts#L13)

Finds connections belonging to a specific team.

#### Parameters

##### teamId

`string`

The ID of the team.

#### Returns

`DBConnection`[]

A list of database connections.
