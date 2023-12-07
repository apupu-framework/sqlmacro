
import { readFile, writeFile } from 'fs/promises';

function interpolate( TEMPLATE, BODY ) {
  return new Function( 'BODY', 'return \x60' + TEMPLATE + '\x60' )( BODY );
}

async function compile( templateFile, bodyFile, outputFile ) {
  try {
    const TEMPLATE = (await readFile( templateFile     , 'utf-8' ));
    const BODY     = (await readFile( bodyFile         , 'utf-8' ));
    await writeFile( outputFile, interpolate( TEMPLATE, BODY ) , 'utf-8' );
    return `succeeded to compile modules (${outputFile})`;
  } catch (e) {
    throw e;
  }
}


[
  compile( 'index.template.cjs', 'index.js', 'index.cjs' ),
  compile( 'index.template.mjs', 'index.js', 'index.mjs' ),
  compile( 'index.test.template.cjs', 'index.test.js', 'index.test.cjs' ),
  compile( 'index.test.template.mjs', 'index.test.js', 'index.test.mjs' ),
].map( e=>e.then(v=>console.log(v)).catch(v=>console.error(v) ));


// (async ()=>{
//   {
//     const BODY     = (await readFile( 'index.js',           'utf-8' ));
//     const TEMPLATE = (await readFile( 'index.template.cjs', 'utf-8' ));
//     await writeFile( 'index.mjs', interpolate( TEMPLATE, BODY ) , 'utf-8' );
//   }
//
//   await writeFile( 'index.mjs', BODY + '\n\nexport{ sqlmacro };\n', 'utf-8' );
//   await writeFile( 'index.cjs', BODY + '\n\nmodule.exports.sqlmacro = sqlmacro;\n', 'utf-8' );
//
//   return 'succeeded to compile modules';
//
// })().then(v=>console.log(v)).catch(v=>console.error(v));
//
// (async ()=>{
//   const BODY = (await readFile( 'index.test.js', 'utf-8' ));
//   await writeFile( 'index.test.mjs', 'import{ sqlmacro } from "sqlmacro";\n\n'                + BODY, 'utf-8' );
//   await writeFile( 'index.test.cjs', 'const { sqlmacro } = require("sqlmacro");\n\n'+ BODY, 'utf-8' );
//   return 'succeeded to compile tests';
//
// })().then(v=>console.log(v)).catch(v=>console.error(v));
