
 sqlmacro
==============================
This is a stupidly simple template engine for SQL.

```
  import { sqlmacro } from 'sqlmacro';
  // or
  const { sqlmacro } = require('sqlmacro');

  const result = sqlmacro`
  params: {flg=false},
  SELECT
  <% if ( flg ) { %>
    cat_name
  <% } else { %>
    dog_name
  <% } %>
  FROM
    animals
  `({ flg: false });
  console.error( result );
```

generates:

```
    SELECT

      dog_name

    FROM
      animals
```

The code below
```
  const result = sqlmacro`
    params: {column_name='cat_name'},
    SELECT
      <%=column_name%>
    FROM
      animals
  `({ column_name: 'dog_name' });

  console.error( result );
```
generates
```
    SELECT
      dog_name
    FROM
      animals
```


#### DON'T USE THIS MODULE IF YOU DON'T UNDERSTAND WHAT YOU ARE DOING ####

This module is inherently vulnerable for SQL injection. If it is properly
applied, it will reduce your code. But if you are careless for SQL injection,
the result is catastrophic.

You most likely to do something like :
```
  const data = request.json;
  const columns = Object.keys( data );

  const result = sqlmacro`
    params: {columns},
    UPDATE  a_table
           (<%= columns.join(',')       %>)
    VALUES (<%= columns.map(c=>':' + c) %>)
    WHERE
       ...
  `({ data, columns });

  console.error( result );
```

which appearently gives malicious attackers a widely open door. 

You are warned.

If you want to set values which come from outside, you must sanitize your
values manually. This module does not do it for you.

I recommend you to apply this module only for conditional generation as you
have seen in above; it still gives you an amount of benefit in my oppinion,
like the C preprocessor.
 

 History
--------------------------------------------------------------------------------
- v0.1.0   Released. (Sat, 22 Oct 2022 14:24:45 +0900) 
- v0.1.1   Removed unnecessary logging ouputs (Sat, 22 Oct 2022 14:53:06 +0900)


