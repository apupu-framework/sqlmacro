
 sqlmacro
==============================
This is a stupidly simple template engine for SQL.

The code below 

```javascript
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

generates

```SQL
    SELECT

      dog_name

    FROM
      animals
```

The code below
```javascript
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

```SQL
    SELECT
      dog_name
    FROM
      animals
```


#### Directives ####
When the first line of the input starts with a hash mark, the macro engine
takes it as a directive line.

```javascript
   #params: foo
   SELECT * FROM users 
   <% if (foo) {%>WHERE id=100<% } %>
```

A directive line consists colon `:`. The part before `:` is taken as a verb of
the directive and the other part is taken as its parameters.

Now **sqlmacro** supports only directive `params` which are treated as JavaScript`s  parameters
of [the function expression][]

[the function expression]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions

```javascript
   #params: a,b=1,c=3
   SELECT * FROM users 
   <% if (c===3) {%>WHERE id=100<% } %>
```

is compiled to something loosely like :

```javascript
  ((a,b=1,c=3)=>{
    s='';
    s+='SELECT * FROM users';
    if ( c===3) { s+='WHERE id=100 }
  })
```

The **sqlmacro** uses `Function` class which accepts parameter definitions as
arguments; **sqlmacro** had to parse the expression ( that is `a,b=1,c=3` part ).
The current parser is far from perfect so use it with care.

If the first line starts with a string `params:` with any leading spaces, it is
also taken as a directive line,too. This is intended to keep backward
compatibility; don't use this if you are working with a newly created project,
though.

```javascript
   params: a,b=1,c=3
   SELECT * FROM users 
   <% if (c===3) {%>WHERE id=100<% } %>
```


#### DON'T USE THIS MODULE IF YOU DON'T UNDERSTAND WHAT YOU ARE DOING ####

This module is inherently vulnerable for SQL injection. If it is properly
applied, it will reduce your code. But if you are careless for SQL injection,
the result is catastrophic.

You most likely to do something like :
```javascript
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


#### About JSP ####

[JSP (Java Server Page)][JSP] is a old-school technology which is a kind of
template engines. It was developped around 2000 and it is still being used
today. JSP has gradually lost popularity for years; most people tent to start
new projects with modern template engines these days. But it has still some
strong points which are missing in modern technologies in 2022.

**sqlmacro** takes some of syntax from [JSP][].

[JSP]:  https://www.infoworld.com/article/3336161/what-is-jsp-introduction-to-javaserver-pages.html

Around 2010, I wrote a module which named "JSSP" which syntax was loosely
resembling JSP's syntax but its host language is not Java but JavaScript. After
that, by my nature, I abandoned the project "JSSP" under a deep nested
directory in my harddisk without publishing it to any repositories whicy are
available to people; I am just interested in just writing code, not interested
in publishing them.

This time I have to write some SQL things due to my personal economical problem;
this became a good reason to revibe the project in a reality of 2022. 

This module is named after `SQL` like database things but you can generate
whatever you want. Please, just be careful about code injection and don't
forget sanitize your parameter values before put them into the macro engine.

I actually use **sqlmacro** to share code between mjs/cjs so that the files
written in *.js are converted to both *.mjs and *.cjs in which process is
totally not related to SQL itself.


### Conclusion ###

That's all. Thank you very much for reading such a long meaningless thing.


 History
--------------------------------------------------------------------------------
- v0.1.0   Released.                            (Sat, 22 Oct 2022 14:24:45 +0900) 
- v0.1.1   Removed unnecessary logging ouputs   (Sat, 22 Oct 2022 14:53:06 +0900)
- v0.1.2   Supported dynamic directive lines    (Wed, 02 Nov 2022 20:38:29 +0900)
- v0.1.3   Now it can handle \` and \\ properly (Wed, 02 Nov 2022 21:35:04 +0900)
- v0.1.4   Updated README.md                    (Thu, 03 Nov 2022 16:41:35 +0900)


