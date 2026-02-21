# Class: ConnectionService

Defined in: [services/ConnectionService.ts:6](https://github.com/gurch101/conductor/blob/d0eb264fb4ded657d85b032bfb9d2438c6ba551f/src/services/ConnectionService.ts#L6)

Service for managing agent connections.

## Constructors

### Constructor

> **new ConnectionService**(): `ConnectionService`

#### Returns

`ConnectionService`

## Methods

### createConnection()

> `static` **createConnection**(`data`): `void`

Defined in: [services/ConnectionService.ts:16](https://github.com/gurch101/conductor/blob/d0eb264fb4ded657d85b032bfb9d2438c6ba551f/src/services/ConnectionService.ts#L16)

Creates a new connection between agents.

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
