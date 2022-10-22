function flipBrace(c){
  switch (c) {
    case '}': return '{';
    case '{': return '}';
    case '[': return ']';
    case ']': return '[';
    default:
      throw new SyntaxError('cannot flip the specified brace ' + c );
  }
}


function splitByComma(s) {
  console.error({s});
  let  lastIndex = 0;
  const stack = [];
  const result = [];
  for( let i=0; i<s.length; i++ ) {
    if ( (s[i] === ',') && (stack.length ===0 ) ) {
      result.push( s.substring( lastIndex, i ) );
      lastIndex=i+1;
    } else if ( s[i] === '[' ||  s[i] === '{'  ) {
      stack.push( s[i] );
    } else if ( s[i] === ']' ||  s[i] === '}'  ) {
      if ( stack.length === 0 ) {
        throw new SyntaxError( 'found an unmatched brace' );
      } else if ( flipBrace( stack[stack.length-1]) !== s[i] ) {
        throw new SyntaxError( 'expected ' + stack[stack.length-1] + ' but found ' + s[i] );
      } else {
        stack.pop();
      }
    }
  }
  result.push( s.substring( lastIndex, s.length ) );
  console.error( result );
  return result;
}

function parseParams(input) {
  // params : arg0, ...arg1, arg2
  const inputArr1 = input.split(':');
  const [key,value] = 2<=inputArr1.length ? inputArr1 : [null,...inputArr1];
  console.log({input,key,value});
  const args = splitByComma(value).map(e=>e.trim())
  return args;
}

function sqlmacro( strings, ...values ) {
  const input          =  strings.map((s,i)=>(s + ((i in values ) ? values[i] : '' ) )  ).join('').trim();
  const inputArr       = input.split('\n');
  const inputFirstLine = inputArr.shift();
  const s = inputArr.join('\n');

  const result = [
    'const __result = [];',
    'const __write = (v)=>__result.push(v);'
  ];

  const fmtText =(s,...args)=>'__write( `' + s.substring(...args) +'` );' ;
  const fmtCode =(s,...args)=>s.trim()[0] === '=' ? '__write(' + s.trim().substring(1) + ');': s; 

  const regexp = /\<%([^%]*)%\>/g;
  let lastIndex = 0;
  for (;;) {
    // console.error(lastIndex);
    let matched = regexp.exec( s );
    if ( matched ) { 
      const currIndex = matched.index; 
      const matchedString = matched[1];
      const matchedAllString = matched[0];
      result.push( fmtText(s,lastIndex,currIndex) );
      result.push( fmtCode(matchedString) );
      lastIndex = currIndex + matchedAllString.length;
    } else {
      result.push( fmtText(s,lastIndex) );
      break;
    }
  }
  // result.push( 'return __result.join(\'\\n\');' );
  result.push( 'return __result.join(\'\');' );
  const script = result.join('\n');
  const params =  parseParams(inputFirstLine);
  console.error({ script, params} );
  return (new Function( ...params, script ))
}

function test() {
  const flg  = "(()=>{console.error('👿  some malicious code👿 ');return true})()";
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

  console.error( result );
}
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

  console.error( result );
}
// test2();



function test3() {
  const result = sqlmacro`
    params: {column_name='cat_name'},
    SELECT
      <%=column_name%>
    FROM
      animals
  `({ column_name: 'dog_name' });

  console.error( result );
}
// test3();

function test4(request) {
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

  console.error( result );
}
// test4({json:{ foo:1,bar:2,bam:3  } });
const json = 
  {
    "a) VALUES(1);DROP animals;COMMIT;" : "foo",
    "BAR":"bar",
  };
// test4({json });




