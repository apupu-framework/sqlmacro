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

  const fmt =(s,...args)=>'__write( `' + s.substring(...args) +'` );' ;

  const regexp = /\<%([^%]*)%\>/g;
  let lastIndex = 0;
  for (;;) {
    // console.error(lastIndex);
    let matched = regexp.exec( s );
    if ( matched ) { 
      const currIndex = matched.index; 
      const matchedString = matched[1];
      const matchedAllString = matched[0];
      result.push( fmt(s,lastIndex,currIndex) );
      result.push( matchedString );
      lastIndex = currIndex + matchedAllString.length;
    } else {
      result.push( fmt(s,lastIndex) );
      break;
    }
  }
  result.push( 'return __result.join(\'\\n\');' );
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




module.exports.sqlmacro = sqlmacro;
