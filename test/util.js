// Inspired by https://awaters1.github.io/Javascript-Code-Coverage-Istanbul-JSDom-Mocha/
// jest wraps istanbul, but uses different coverage varible key name

const fs = require('fs');
const { createInstrumenter } = require('istanbul-lib-instrument');

var coverageVar = '__coverage__';

function instrument(file) {
    var js = fs.readFileSync(file, 'utf-8');

    var instrumenter = createInstrumenter({
        coverageVariable: coverageVar
    });
    var filename = fs.realpathSync(file);
    var generatedCode = instrumenter.instrumentSync(js, filename);
    return generatedCode;
}

exports.coverageVar = coverageVar;
exports.instrument = instrument;
