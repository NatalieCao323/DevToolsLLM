const fs = require('fs');

function visualizeTrace(traceFile) {
    const traceData = fs.readFileSync(traceFile, 'utf-8');
    const visualization = createVisualization(traceData);
    console.log('Trace Visualization:\n' + visualization);
    return visualization;
}

function createVisualization(traceData) {
    // Generate ASCII visualization for trace
    const trace = JSON.parse(traceData);
    return trace.calls.map(call => ` ├─ tool: ${call.tool}`).join('\n');
}

module.exports = visualizeTrace;