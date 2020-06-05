
API Reference - Mutation
========================

Table of contents

**insert** (upsert) syntax
--------------------------

```
mutation [<mutation-name>] {
  <mutation-field-name> (
    [<input-object>!]
    [conflict-clause]
  )
  [mutation-response!]
}
```

  Key                   Required   Schema                                  Description
  --------------------- ---------- --------------------------------------- ------------------------------------------------------------------
  mutation-name         false      Value                                   Name of mutation for observability
  mutation-field-name   true       Value                                   Name of the auto-generated mutation field, e.g. *insert\_author*
  input-object          true       [InputObjects](#InputObjects)           Name of the auto-generated mutation field
  mutation-response     true       [MutationResponse](#MutationResponse)   Object to be returned after mutation succeeds
  on-conflict           false      [ConflictClause](#ConflictClause)       Converts *insert* to *upsert* by handling conflict

**E.g. INSERT**:

```graphql
mutation insert_article {
  insert_article(
    objects: [
      {
        title: "Software is gluttonous",
        content: "Something happened in HP",
        author_id: 3
      }
    ]
  ) {
    returning {
      id
      title
    }
  }
}
```

**E.g. UPSERT**:

```graphql
mutation upsert_author {
  insert_author (
    objects: [
      {
        name: "John",
        id:12
      }
    ],
    on_conflict: {
      constraint: author_name_key,
      update_columns: [name, id]
    }
  ) {
    affected_rows
  }
}
```

**insert\_one** syntax
----------------------

```
mutation [<mutation-name>] {
  <mutation-field-name> (
    [<input-object>!]
    [conflict-clause]
  )
  [mutation-response!]
}
```

  Key                   Required   Schema                                         Description
  --------------------- ---------- ---------------------------------------------- -----------------------------------------------------------------------
  mutation-name         false      Value                                          Name of mutation for observability
  mutation-field-name   true       Value                                          Name of the auto-generated mutation field, e.g. *insert\_author\_one*
  input-object          true       [InputObject](#InputObject)                    Name of the auto-generated mutation field
  mutation-response     true       `SimpleObject`{.interpreted-text role="ref"}   Object to be returned after mutation succeeds
  on-conflict           false      [ConflictClause](#ConflictClause)              Converts *insert* to *upsert* by handling conflict

**E.g. INSERT ONE**:

```graphql
mutation insert_article_one {
  insert_article_one(
    object: {
      title: "Software is gluttonous",
      content: "Something happened in HP",
      author_id: 3
    }
  ) {
    id
    title
  }
}
```

**update\_by\_pk** syntax
-------------------------

```
mutation [<mutation-name>] {
  <mutation-field-name> (
    [pk-columns-argument!],
    [set-argument!]
  )
  <object-fields>
}
```

  Key                       Required   Schema                                      Description
  ------------------------- ---------- ------------------------------------------- ---------------------------------------------------------------------------------
  mutation-name             false      Value                                       Name of mutation for observability
  mutation-field-name       true       Value                                       Name of the auto-generated update mutation field, e.g. *update\_author\_by\_pk*
  pk-columns-argument       true       [pkColumnsArgExp](#pkColumnsArgExp)         Primary key(s) for row(s) to be updated
  set-argument              false      [setArgExp](#setArgExp)                     Data to be updated in the table
  inc-argument              false      [incArgExp](#incArgExp)                     Integer value to be incremented to Int columns in the table
  append-argument           false      [appendArgExp](#appendArgExp)               JSON value to be appended to JSONB columns in the table
  prepend-argument          false      [prependArgExp](#prependArgExp)             JSON value to be prepended to JSONB columns in the table
  delete-key-argument       false      [deleteKeyArgExp](#deleteKeyArgExp)         Key to be deleted in the value of JSONB columns in the table
  delete-elem-argument      false      [deleteElemArgExp](#deleteElemArgExp)       Array element to be deleted in the value of JSONB columns in the table
  delete-at-path-argument   false      [deleteAtPathArgExp](#deleteAtPathArgExp)   Element at path to be deleted in the value of JSONB columns in the table

**E.g. UPDATE BY PK**:

```graphql
mutation update_articles {
  update_article_by_pk (
    pk_columns: {
      id: 1
    }
    _set: { is_published: true }
  ) {
    id
    title
  }
}
```

**update** syntax
-----------------

```
mutation [<mutation-name>] {
  <mutation-field-name> (
    [where-argument!],
    [set-argument!]
  )
  [mutation-response!]
}
```

  Key                       Required   Schema                                      Description
  ------------------------- ---------- ------------------------------------------- --------------------------------------------------------------------------
  mutation-name             false      Value                                       Name of mutation for observability
  mutation-field-name       true       Value                                       Name of the auto-generated update mutation field, e.g. *update\_author*
  where-argument            true       [whereArgExp](#whereArgExp)                 Selection criteria for rows to be updated
  set-argument              false      [setArgExp](#setArgExp)                     Data to be updated in the table
  inc-argument              false      [incArgExp](#incArgExp)                     Integer value to be incremented to Int columns in the table
  append-argument           false      [appendArgExp](#appendArgExp)               JSON value to be appended to JSONB columns in the table
  prepend-argument          false      [prependArgExp](#prependArgExp)             JSON value to be prepended to JSONB columns in the table
  delete-key-argument       false      [deleteKeyArgExp](#deleteKeyArgExp)         Key to be deleted in the value of JSONB columns in the table
  delete-elem-argument      false      [deleteElemArgExp](#deleteElemArgExp)       Array element to be deleted in the value of JSONB columns in the table
  delete-at-path-argument   false      [deleteAtPathArgExp](#deleteAtPathArgExp)   Element at path to be deleted in the value of JSONB columns in the table
  mutation-response         true       [MutationResponse](#MutationResponse)       Object to be returned after mutation succeeds

**E.g. UPDATE**:

```graphql
mutation update_author{
  update_author(
    where: {id: {_eq: 3}},
    _set: {name: "Jane"}
  ) {
    affected_rows
  }
}
```

**delete\_by\_pk** syntax
-------------------------

```
mutation [<mutation-name>] {
  <mutation-field-name> (
    column1: value1
    column2: value2
  )
  <object-fields>
}
```

  Key                   Required   Schema   Description
  --------------------- ---------- -------- ---------------------------------------------------------------------------------
  mutation-name         false      Value    Name of mutation for observability
  mutation-field-name   true       Value    Name of the auto-generated delete mutation field, e.g. *delete\_author\_by\_pk*

**E.g. DELETE BY PK**:

```graphql
mutation delete_articles {
  delete_article_by_pk (
    id: 1
  ) {
    id
    title
  }
}
```

**delete** syntax
-----------------

```
mutation [<mutation-name>] {
  <mutation-field-name> (
    [where-argument!]
  )
  [mutation-response!]
}
```

  Key                   Required   Schema                                  Description
  --------------------- ---------- --------------------------------------- -------------------------------------------------------------------------
  mutation-name         false      Value                                   Name of mutation for observability
  mutation-field-name   true       Value                                   Name of the auto-generated delete mutation field, e.g. *delete\_author*
  where-argument        true       [whereArgExp](#whereArgExp)             Selection criteria for rows to delete
  mutation-response     true       [MutationResponse](#MutationResponse)   Object to be returned after mutation succeeds

**E.g. DELETE**:

```graphql
mutation delete_articles {
  delete_article(
    where: {author: {id: {_eq: 7}}}
  ) {
    affected_rows
    returning {
      id
    }
  }
}
```

Note

For more examples and details of usage, please see
`this <mutations>`{.interpreted-text role="ref"}.

Syntax definitions
------------------

### Mutation response

```
{
  affected_rows
  returning {
    response-field1
    response-field2
    ..
  }
}
```

E.g.:

```graphql
{
  affected_rows
  returning {
    id
    author_id
  }
}
```

### **objects** argument

```
objects: [
  {
    field1: value,
    field2: value,
    <object-rel-name>: {
      data: <Input-Object>!,
      on_conflict: <Conflict-Clause>
    },
    <array-rel-name>: {
      data: [<Input-Object>!]!,
      on_conflict: <Conflict-Clause>
    }
    ..
  },
  ..
]
# no nested objects
```

E.g.:

```graphql
objects: [
  {
    title: "Software is eating the world",
    content: "This week, Hewlett-Packard...",
    author: {
      data: {
        id: 1,
        name: "Sydney"
      }
    }
  }
]
```

### **object** argument

```
object: {
  field1: value,
  field2: value,
  <object-rel-name>: {
    data: <Input-Object>!,
    on_conflict: <Conflict-Clause>
  },
  <array-rel-name>: {
    data: [<Input-Object>!]!,
    on_conflict: <Conflict-Clause>
  }
  ..
}
```

E.g.:

```graphql
object: {
  title: "Software is eating the world",
  content: "This week, Hewlett-Packard...",
  author: {
    data: {
      id: 1,
      name: "Sydney"
    }
  }
}
```

### **on\_conflict** argument

The conflict clause is used to convert an *insert* query to an *upsert*
query. *Upsert* respects the table\'s *update* permissions before
editing an existing row in case of a conflict. Hence the conflict clause
is permitted only if a table has *update* permissions defined.

```
on_conflict: {
  constraint: table_constraint!
  update_columns: [table_update_column!]!
  where: table_bool_exp
}
```

E.g.:

```graphql
on_conflict: {
  constraint: author_name_key
  update_columns: [name]
  where: {id: {_lt: 1}}
}
```

### **pk\_columns** argument

The `pk_columns` argument is used to identify an object by its primary
key columns in *update* mutations.

```
pk_columns: {
  column-1: value-1
  column-2: value-2
}
```

E.g.:

```graphql
pk_columns: {
  id: 1
  name: "Harry"
}
```

### **where** argument

where: [BoolExp](#boolexp)

#### BoolExp

[AndExp](#andexp) \| [OrExp](#orexp) \| [NotExp](#notexp) \|
[TrueExp](#trueexp) \| [ColumnExp](#columnexp)

##### AndExp


{

:   \_and: \[[BoolExp](#boolexp)\]

}

##### OrExp


{

:   \_or: \[[BoolExp](#boolexp)\]

}

##### NotExp


{

:   \_not: [BoolExp](#boolexp)

}

##### TrueExp

{}

##### ColumnExp


{

:   field-name: {[Operator](#operator): Value }

}

##### Operator

**Generic operators (all column types except json, jsonb):**

-   `_eq`
-   `_ne`
-   `_in`
-   `_nin`
-   `_gt`
-   `_lt`
-   `_gte`
-   `_lte`

**Operators for comparing columns (all column types except json,
jsonb)**:

-   `_ceq`
-   `_cneq`
-   `_cgt`
-   `_clt`
-   `_cgte`
-   `_cnlte`

**Text related operators:**

-   `_like`
-   `_nlike`
-   `_ilike`
-   `_nilike`
-   `_similar`
-   `_nsimilar`

**Checking for NULL values:**

-   `_is_null` (takes true/false as values)

### **\_set** argument

```
_set: {
  field-name-1 : value,
  field-name-2 : value,
  ..
}
```

### **\_inc** argument

```
_inc: {
  field-name-1 : int-value,
  field-name-2 : int-value,
  ..
}
```

### **\_append** argument

```
_append: {
  field-name-1 : $json-variable-1,
  field-name-2 : $json-variable-1,
  ..
}
```

E.g.

```json
{
  "json-variable-1": "value",
  "json-variable-2": "value"
}
```

### **\_prepend** argument

```
_prepend: {
  field-name-1 : $json-variable-1,
  field-name-2 : $json-variable-1,
  ..
}
```

E.g.

```json
{
  "json-variable-1": "value",
  "json-variable-2": "value"
}
```

### **\_delete\_key** argument

```
_delete_key: {
  field-name-1 : "key",
  field-name-2 : "key",
  ..
}
```

### **\_delete\_elem** argument

```
_delete_elem: {
  field-name-1 : int-index,
  field-name-2 : int-index,
  ..
}
```

### **\_delete\_at\_path** argument

```
_delete_at_path: {
  field-name-1 : ["path-array"],
  field-name-2 : ["path-array"],
  ..
}
```
