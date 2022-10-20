
import { readFile, writeFile } from 'fs/promises';

(async ()=>{
  const s = (await readFile( 'index.js', 'utf-8' ));
  await writeFile( 'index.mjs', s + '\n\nexport{ sqlmacro };\n', 'utf-8' );
  await writeFile( 'index.cjs', s + '\n\nmodule.exports.sqlmacro = sqlmacro;\n', 'utf-8' );

  return 'succeeded to compile modules';

})().then(v=>console.log(v)).catch(v=>console.error(v));

(async ()=>{
  const s = (await readFile( 'index.test.js', 'utf-8' ));
  await writeFile( 'index.test.mjs', 'import{ sqlmacro } from "sqlmacro";\n\n'                + s, 'utf-8' );
  await writeFile( 'index.test.cjs', 'const { sqlmacro } = require("sqlmacro");\n\n'+ s, 'utf-8' );
  return 'succeeded to compile tests';

})().then(v=>console.log(v)).catch(v=>console.error(v));
