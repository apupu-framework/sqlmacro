function plainsql(strings,...values) {
  // console.log( strings, values );
  return (
    strings
    .map( (e,i)=> e + (values[i]||'').toString() )
    .join('')
    .split('\n')
    .map( (e)=> e.trim() )
    .join( '\n' )
    .trim()
  );
};

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
  // console.error({s});
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
  // console.error( result );
  return result;
}

function parseParams(paramLines) {
  let args=[];

  for ( const input of paramLines ) {
    // params : arg0, ...arg1, arg2no param line
    const inputArr1 = input.split(':').map(e=>e.trim());
    const [key,value] = 2<=inputArr1.length ? inputArr1 : [ null, ...inputArr1 ];
    // console.log({input,key,value});
    if ( key === null ) {
      throw new SyntaxError( 'no directive was specified' );
    } else if ( key === 'params' ) {
      args = [ ...args, ...(splitByComma(value).map(e=>e.trim()))];
    } else {
      throw new SyntaxError( `encountered an unknown directive "${ key }" ... ignored` );
    }
  }
  return args;
}

const joinStringsAndValues = ( strings, values )=>strings.map((s,i)=>(s + ((i in values ) ? values[i] : '' ) )  ).join('').trim();

const extractParamLine = ( input )=>{
  const inputArr  = input.split('\n');
  const paramLines = [];

  while ( 0<inputArr.length ) {
    const line = inputArr[0].trim();
    if ( /^#/.exec(line) ) {
      inputArr.shift();
      paramLines.push( line.substring(1).trim() );
    } else if (/^params:/.exec(inputArr[0]) ) {
      inputArr.shift();
      paramLines.push( line.trim() );
    } else {
      break;
    }
  }
  const s = inputArr.join('\n');
  return [ s, paramLines ];
};


const DELETE_LEFT_COMMA  = '__sqlmacro__LEFT__sqlmacro__';
const DELETE_RIGHT_COMMA = '__sqlmacro__RIGHT__sqlmacro__';
const LOOKUP_LEFT_COMMA  = `(,)(\\s*)(\\b${DELETE_LEFT_COMMA}\\b)`;
const LOOKUP_RIGHT_COMMA = `(\\b${DELETE_RIGHT_COMMA}\\b)(\\s*)(,)`;
const LOOKUP_LEFT_TAG  = `(\\b${DELETE_LEFT_COMMA}\\b)`;
const LOOKUP_RIGHT_TAG = `(\\b${DELETE_RIGHT_COMMA}\\b)`;
function remove_comma( s ) {
  return (
    s.replace( new RegExp( LOOKUP_RIGHT_COMMA, 'gm'),(s,s0,s1,s2)=>{
      return `${s1} `;
    }).replace( new RegExp( LOOKUP_LEFT_COMMA, 'gm'),(s,s0,s1,s2)=>{
      return ` ${s1}`;
    }).replace( new RegExp( LOOKUP_RIGHT_TAG,  'gm'),(s,s0,s1,s2)=>{
      return ``;
    }).replace( new RegExp( LOOKUP_LEFT_TAG,   'gm'),(s,s0,s1,s2)=>{
      return ``;
    })
  )
}
function sqlmacro_output_filter( s ) {
  return remove_comma( s );
}

const SHARED_LIB = [
  "const DELETE_LEFT_COMMA  = '__sqlmacro__LEFT__sqlmacro__';                 ",
  "const DELETE_RIGHT_COMMA = '__sqlmacro__RIGHT__sqlmacro__';                ",
  "const LOOKUP_LEFT_COMMA  = `(,)(\\\\s*)(\\\\b${DELETE_LEFT_COMMA}\\\\b)`;  ",
  "const LOOKUP_RIGHT_COMMA = `(\\\\b${DELETE_RIGHT_COMMA}\\\\b)(\\\\s*)(,)`; ",
  "const LOOKUP_LEFT_TAG  = `(\\\\b${DELETE_LEFT_COMMA}\\\\b)`;               ",
  "const LOOKUP_RIGHT_TAG = `(\\\\b${DELETE_RIGHT_COMMA}\\\\b)`;              ",
  "function remove_comma( s ) {                                               ",
  "  return (                                                                 ",
  "    s.replace( new RegExp( LOOKUP_RIGHT_COMMA, 'gm'),(s,s0,s1,s2)=>{       ",
  "      return `${s1} `;                                                     ",
  "    }).replace( new RegExp( LOOKUP_LEFT_COMMA, 'gm'),(s,s0,s1,s2)=>{       ",
  "      return ` ${s1}`;                                                     ",
  "    }).replace( new RegExp( LOOKUP_RIGHT_TAG,  'gm'),(s,s0,s1,s2)=>{       ",
  "      return ``;                                                           ",
  "    }).replace( new RegExp( LOOKUP_LEFT_TAG,   'gm'),(s,s0,s1,s2)=>{       ",
  "      return ``;                                                           ",
  "    })                                                                     ",
  "  )                                                                        ",
  "}                                                                          ",
  "function sqlmacro_output_filter( s ) {                                     ",
  "  return remove_comma( s );                                                ",
  "}                                                                          ",
];


function sqlmacro( strings, ...values ) {
  const input          =  joinStringsAndValues( strings, values );
  const [ s, paramLines ] = extractParamLine( input );

  const result = [
    ...SHARED_LIB,
    'const __result = [];',
    'const __write = (v)=>__result.push(v);'
  ];

  const escapeText=(s)=>s.replaceAll('\\', '\\\\' ).replaceAll('`','\\`').replaceAll('$','\\$');
  const fmtText =(s,...args)=>'__write( `' + escapeText( s.substring(...args) ) +'` );' ;
  const fmtCode =(s,...args)=>s.trim()[0] === '=' ? '__write(' + escapeText( s.trim().substring(1)) + ');': s;

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
  result.push( 'return sqlmacro_output_filter( __result.join(\'\'));' );
  const script = result.join('\n');
  const params =  parseParams(paramLines);
  // console.error({ script, params} );
  try {
    return (new Function( ...params, script ))
  } catch ( e ) {
    console.error(e);
    throw new SyntaxError( e.message + " in \n" + script ,{cause:e});
  }
}





