
 sqlmacro
==============================
This is a stupidly simple template engine for SQL.

```
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


#### Don't Use This Module If You Don't Understand What You Are Doing ####

This module is inherently vulnerable for SQL injection. If it is properly
applied, it will reduce your code drastically. But if you are careless 
for SQL injection, the result is catastrophic.

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
which generates following :
```
    UPDATE  a_table
           (foo,bar,bam)
    VALUES (:foo,:bar,:bam)
    WHERE
       ...
```

It seems convinient but this instantly opens the door to the malicious code to
execute any code.





