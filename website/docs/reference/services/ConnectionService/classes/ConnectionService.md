# Class: ConnectionService

Defined in: [services/ConnectionService.ts:6](https://github.com/gurch101/conductor/blob/ca7693e0948bc3c0646f00ecc8fcf2f8829c2840/src/services/ConnectionService.ts#L6)

Service for managing agent connections.

## Constructors

### Constructor

> **new ConnectionService**(): `ConnectionService`

#### Returns

`ConnectionService`

## Methods

### createConnection()

> `static` **createConnection**(`data`): `void`

Defined in: [services/ConnectionService.ts:16](https://github.com/gurch101/conductor/blob/ca7693e0948bc3c0646f00ecc8fcf2f8829c2840/src/services/ConnectionService.ts#L16)

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
