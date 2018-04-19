// Inspired by https://awaters1.github.io/Javascript-Code-Coverage-Istanbul-JSDom-Mocha/

const fs = require('fs');
const crypto = require('crypto');
const { createInstrumenter } = require('istanbul-lib-instrument');

// istanbul-lib-instrument/src/visitor.js
// defaultProgramVisitorOpts.coverageVariable
const defaultCoverageVariable = '__coverage__';

// istanbul-lib-instrument/src/visitor.js
// generate a variable name from hashing the supplied file path
function genVar(filename) {
    const hash = crypto.createHash('sha1');
    hash.update(filename);
    return 'cov_' + parseInt(hash.digest('hex').substr(0, 12), 16).toString(36);
}

function instrument(file) {
    var js = fs.readFileSync(file, 'utf-8');

    var instrumenter = createInstrumenter({
        coverageVariable: defaultCoverageVariable
    });
    var filename = fs.realpathSync(file);
    var generatedCode = instrumenter.instrumentSync(js, filename);
    return generatedCode;
}

exports.coverageVar = defaultCoverageVariable;
exports.genVar = genVar;
exports.instrument = instrument;
