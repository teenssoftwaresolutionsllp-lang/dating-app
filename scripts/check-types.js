const ts = require('typescript');
const fs = require('fs');
const path = require('path');

const configPath = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.json');
if (!configPath) {
  console.error('Could not find tsconfig.json');
  process.exit(1);
}

const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, './');
const program = ts.createProgram(parsed.fileNames, parsed.options);
const diagnostics = ts.getPreEmitDiagnostics(program);

console.log('TOTAL_ERRORS:', diagnostics.length);
diagnostics.forEach(d => {
  const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
  if (d.file) {
    const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
    console.log(`ERROR: ${d.file.fileName}:${line + 1}:${character + 1} - ${msg}`);
  } else {
    console.log(`ERROR: ${msg}`);
  }
});
