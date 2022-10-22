const { sqlmacro } = require("sqlmacro");

test('basic0', ()=>{
  const hello = 'hello';
  const world = 'world';

  const result = sqlmacro`
    params: arg0
    <% if ( arg0.foo ) { %>
      ${ hello }
    <% } else { %>
      ${ world } 
    <% } %>
  `({ foo: 1 });

  console.error( result  );
  expect( result.trim() ).toBe( 'hello' );
});

test('basic1', ()=>{
  const flg  = true;
  const hello = 'hello';
  const world = 'world';

  const result = sqlmacro`
    params: arg0
    <% if ( arg0 ) { %>
      ${ hello }
    <% } else { %>
      ${ world } 
    <% } %>
  `(flg);

  console.error( result  );
  expect( result.trim() ).toBe( 'hello' );
});

test('don\'t do this', ()=>{
  const flg  = "(()=>{console.error('👿  some malicious code👿 ');return true})()";
  const hello = 'hello';
  const world = 'world';

  const result = sqlmacro`
    params: arg0
    <% if ( ${ flg } ) { %>
      ${ hello }
    <% } else { %>
      ${ world } 
    <% } %>
  `();

  console.error( result  );
  expect( result.trim() ).toBe( 'hello' );
});
