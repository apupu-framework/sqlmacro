import{ sqlmacro } from "sqlmacro";
import  { test, describe, it, before, after } from 'node:test' ;
import assert from 'node:assert/strict';

function test1() {
  const flg  = "(()=>{console.log('👿  some malicious code👿 ');return true})()";
  const hello = 'hello';
  const world = 'world';

  const result = sqlmacro`
    params: {foo},{arg1}
    <% if ( foo ) { %>
      ${ hello }
    <% } else { %>
      ${ world }
    <% } %>
  `({ foo: false },[]);

  console.log( result );
}
test('primitive-test 1',()=>test1() );
// test();


function test2() {
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
  `({ flg: false },[]);

  console.log( result );
}
// test2();
test('primitive-test test2', ()=>test2() );



function test3() {
  const result = sqlmacro`
    params: {column_name='cat_name'},
    SELECT
      <%=column_name%>
    FROM
      animals
  `({ column_name: 'dog_name' });

  console.log( result );
}
test('primitive-test test3', ()=>test3() );
// test3();

function execTest(request) {
  const data = request.json;
  const columns = Object.keys( data );

  const result = sqlmacro`
    params: {columns},
    UPDATE  animals
           (<%= columns.join(',')       %>)
    VALUES (<%= columns.map(c=>':' + c) %>)
    WHERE
       ...
  `({ data, columns });

  console.log( result );
}

function test4() {
  execTest({json:{ foo:1,bar:2,bam:3 }})
}
// test4({json:{ foo:1,bar:2,bam:3  } });
test('primitive-test test4', ()=>test4() );

function test5() {
  const json = {
    "a) VALUES(1);DROP animals;COMMIT;" : "foo",
    "BAR":"bar",
  };
  execTest({ json });
}

// test4({json });
test('primitive-test test5', ()=>test5());


// -------------------------------------------------------


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

  console.log( result  );
  assert.equal( result.trim() , 'hello' );
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

  console.log( result  );
  assert.equal( result.trim() , 'hello' );
});

test('don\'t do this', ()=>{
  const flg  = "(()=>{console.log('👿  some malicious code👿 ');return true})()";
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

  console.log( result  );
  assert.equal( result.trim() , 'hello' );
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

  console.log( result  );
  assert.equal( result.trim() , 'world' );
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

  console.log( result  );
  assert.equal( result.trim() , 'hello' );
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

  console.log( result  );
  assert.equal( result.trim() , 'hello' );
});


test('No.6 unknown directive', ()=>{
  const hello = 'hello';
  const world = 'world';
  assert.throws(
    ()=>sqlmacro`
      # UNKNOWN : foo
      <% if ( false ) { %>
        ${ hello }
      <% } else { %>
        ${ world }
      <% } %>
    `(),
    {
      message : 'encountered an unknown directive "UNKNOWN" ... ignored'
    });
});

test('No.7 unknown directive', ()=>{
  const hello = 'hello';
  const world = 'world';
  assert.throws(
    ()=>sqlmacro`
      # foo
      <% if ( false ) { %>
        ${ hello }
      <% } else { %>
        ${ world }
      <% } %>
    `(),
    {
      message:'no directive was specified'
    });
});



test('No.8 code with ` ', ()=>{
  assert.equal(
    sqlmacro`
    # params: foo
    <% if ( foo==='foo' ) { %>
      \`hello\`
    <% } else { %>
      world
    <% } %>
  `('foo').trim()
  , '`hello`' );
});



test('No.8 code with \\ ', ()=>{
  assert.equal(
    sqlmacro`
    # params: foo
    <% if ( foo==='foo' ) { %>
      \\hello\\
    <% } else { %>
      world
    <% } %>
  `('foo').trim()
  , '\\hello\\' );
});




