

function sqlmacro( strings, ...values ) {
  const s =  strings.map((s,i)=>(s + ((i in values ) ? values[i] : '' ) )  ).join('');
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
  console.error( script );
  return (new Function( 'arg0', script ))
}

const flg  = "(()=>{console.error('👿  some malicious code👿 ');return true})()";
const hello = 'hello';
const world = 'world';

const result = sqlmacro`
  <% if ( arg0.foo ) { %>
    ${ hello }
  <% } else { %>
    ${ world } 
  <% } %>
`({ foo: 1 });

console.error( result );




export{ sqlmacro };
