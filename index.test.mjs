import{ sqlmacro } from "sqlmacro";

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
  `({ foo: true });

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


test('No.3 basic with no param line', ()=>{
  const flg  = true;
  const hello = 'hello';
  const world = 'world';

  const result = sqlmacro`
    <% if ( false ) { %>
      ${ hello }
    <% } else { %>
      ${ world } 
    <% } %>
  `(flg);

  console.error( result  );
  expect( result.trim() ).toBe( 'world' );
});

test('No.4 basic with hash param line', ()=>{
  const flg  = 5;
  const hello = 'hello';
  const world = 'world';

  const result = sqlmacro`
    #params: flg
    <% if ( flg === 5 ) { %>
      ${ hello }
    <% } else { %>
      ${ world } 
    <% } %>
  `(flg);

  console.error( result  );
  expect( result.trim() ).toBe( 'hello' );
});

test('No.5 basic with double hash param line', ()=>{
  const flg  = 3;
  const flg2  = 5;
  const hello = 'hello';
  const world = 'world';

  const result = sqlmacro`
    #params: flg
    #params: flg2
    <% if ( flg2 === 5 ) { %>
      ${ hello }
    <% } else { %>
      ${ world } 
    <% } %>
  `(flg,flg2);

  console.error( result  );
  expect( result.trim() ).toBe( 'hello' );
});


test('No.6 unknown directive', ()=>{
  const hello = 'hello';
  const world = 'world';
  expect( 
    ()=>sqlmacro`
    # UNKNOWN : foo
    <% if ( false ) { %>
      ${ hello }
    <% } else { %>
      ${ world } 
    <% } %>
  `()
  ).toThrow( 'encountered an unknown directive "UNKNOWN" ... ignored' );
});

test('No.7 unknown directive', ()=>{
  const hello = 'hello';
  const world = 'world';
  expect(
    ()=>sqlmacro`
    # foo
    <% if ( false ) { %>
      ${ hello }
    <% } else { %>
      ${ world } 
    <% } %>
  `()
  ).toThrow( 'no directive was specified' );
});



