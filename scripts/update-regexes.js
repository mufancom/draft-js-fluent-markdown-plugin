const Glob = require('glob');
const RegexTools = require('regex-tools');

let regexFileNames = Glob.sync('bld/regexes/*.regex.js');

for (let fileName of regexFileNames) {
  RegexTools.process(fileName);
}
