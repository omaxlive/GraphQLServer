# GraphQL Project examples

## Auth User

```js
mutation authUser($input: AuthUserInput!) {
  authUser(input: $input) {
    token
  }
}
```

### Query variables

```json
{
  "input": {
    "email": "email@email.test",
    "password": "1234"
  }
}
```

## User creation

```js
mutation newUser($input: UserInput!) {
  newUser(input: $input) {
    name
    lastName
    email
    created
  }
}
```

### Query variables

```json
{
  "input": {
    "name": "John",
    "lastName": "Doe",
    "email": "email@email.test",
    "password": "1234"
  }
}
```

## Get user

```js
query getUser($token: String!) {
  getUser(token: $token) {
    id
  }
}

```

### Query variables

```json
{
  "token": "eyJhbGciOiJIUz..."
}
```
