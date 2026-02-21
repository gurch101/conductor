# Class: TeamRepository

Defined in: [repositories/TeamRepository.ts:7](https://github.com/gurch101/conductor/blob/d0eb264fb4ded657d85b032bfb9d2438c6ba551f/src/repositories/TeamRepository.ts#L7)

Repository for managing teams in the database.

## Constructors

### Constructor

> **new TeamRepository**(): `TeamRepository`

#### Returns

`TeamRepository`

## Methods

### create()

> `static` **create**(`id`, `name`, `objective`): `void`

Defined in: [repositories/TeamRepository.ts:31](https://github.com/gurch101/conductor/blob/d0eb264fb4ded657d85b032bfb9d2438c6ba551f/src/repositories/TeamRepository.ts#L31)

Creates a new team in the database.

#### Parameters

##### id

`string`

The ID of the team.

##### name

`string`

The name of the team.

##### objective

`string`

The team's objective.

#### Returns

`void`

***

### findAll()

> `static` **findAll**(): `DBTeam`[]

Defined in: [repositories/TeamRepository.ts:12](https://github.com/gurch101/conductor/blob/d0eb264fb4ded657d85b032bfb9d2438c6ba551f/src/repositories/TeamRepository.ts#L12)

Retrieves all teams from the database, ordered by creation date.

#### Returns

`DBTeam`[]

A list of database teams.

***

### findById()

> `static` **findById**(`id`): `DBTeam` \| `null`

Defined in: [repositories/TeamRepository.ts:21](https://github.com/gurch101/conductor/blob/d0eb264fb4ded657d85b032bfb9d2438c6ba551f/src/repositories/TeamRepository.ts#L21)

Finds a specific team by its ID.

#### Parameters

##### id

`string`

The ID of the team.

#### Returns

`DBTeam` \| `null`

The database team or null if not found.
