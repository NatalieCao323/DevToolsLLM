import React, { useState } from 'react';
import './ParameterValidation.css';

function ParameterValidation() {
  const [schema, setSchema] = useState('{\n  "searchTool": {\n    "required": ["query"],\n    "properties": {\n      "query": {\n        "type": "string",\n        "minLength": 1,\n        "maxLength": 200\n      },\n      "limit": {\n        "type": "number",\n        "minimum": 1,\n        "maximum": 100\n      }\n    }\n  }\n}');
  
  const [params, setParams] = useState('{\n  "query": "test search",\n  "limit": 10\n}');
  
  const [toolName, setToolName] = useState('searchTool');
  const [validationResult, setValidationResult] = useState(null);

  const validateParams = () => {
    try {
      const schemaObj = JSON.parse(schema);
      const paramsObj = JSON.parse(params);
      
      const toolSchema = schemaObj[toolName];
      
      if (!toolSchema) {
        setValidationResult({
          valid: false,
          errors: [`No schema found for tool: ${toolName}`],
          warnings: []
        });
        return;
      }

      const errors = [];
      const warnings = [];

      // Check required parameters
      if (toolSchema.required) {
        toolSchema.required.forEach(param => {
          if (!(param in paramsObj)) {
            errors.push(`Missing required parameter: ${param}`);
          }
        });
      }

      // Validate parameter types
      if (toolSchema.properties) {
        Object.entries(paramsObj).forEach(([key, value]) => {
          const propSchema = toolSchema.properties[key];
          
          if (!propSchema) {
            warnings.push(`Unknown parameter: ${key}`);
            return;
          }

          const actualType = Array.isArray(value) ? 'array' : typeof value;
          
          if (propSchema.type && actualType !== propSchema.type) {
            errors.push(`Parameter '${key}' expected type ${propSchema.type}, got ${actualType}`);
          }

          // Validate string constraints
          if (propSchema.type === 'string' && typeof value === 'string') {
            if (propSchema.minLength && value.length < propSchema.minLength) {
              errors.push(`Parameter '${key}' must be at least ${propSchema.minLength} characters`);
            }
            if (propSchema.maxLength && value.length > propSchema.maxLength) {
              errors.push(`Parameter '${key}' must be at most ${propSchema.maxLength} characters`);
            }
          }

          // Validate number constraints
          if (propSchema.type === 'number' && typeof value === 'number') {
            if (propSchema.minimum !== undefined && value < propSchema.minimum) {
              errors.push(`Parameter '${key}' must be >= ${propSchema.minimum}`);
            }
            if (propSchema.maximum !== undefined && value > propSchema.maximum) {
              errors.push(`Parameter '${key}' must be <= ${propSchema.maximum}`);
            }
          }
        });
      }

      setValidationResult({
        valid: errors.length === 0,
        errors,
        warnings
      });

    } catch (error) {
      setValidationResult({
        valid: false,
        errors: [`JSON Parse Error: ${error.message}`],
        warnings: []
      });
    }
  };

  return (
    <div className="parameter-validation">
      <header className="page-header">
        <h1>Parameter Validation</h1>
        <p>Validate tool parameters against JSON Schema</p>
      </header>

      <div className="validation-container">
        <div className="validation-inputs">
          <div className="input-section">
            <label>Tool Name</label>
            <input
              type="text"
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              placeholder="Enter tool name"
            />
          </div>

          <div className="input-section">
            <label>JSON Schema</label>
            <textarea
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              rows={15}
              placeholder="Enter JSON schema..."
            />
          </div>

          <div className="input-section">
            <label>Parameters to Validate</label>
            <textarea
              value={params}
              onChange={(e) => setParams(e.target.value)}
              rows={10}
              placeholder="Enter parameters as JSON..."
            />
          </div>

          <button onClick={validateParams} className="validate-button">
            Validate Parameters
          </button>
        </div>

        {validationResult && (
          <div className="validation-results">
            <div className={`result-header ${validationResult.valid ? 'valid' : 'invalid'}`}>
              <h2>
                {validationResult.valid ? 'Validation Passed' : 'Validation Failed'}
              </h2>
            </div>

            {validationResult.errors.length > 0 && (
              <div className="errors-section">
                <h3>Errors</h3>
                <ul>
                  {validationResult.errors.map((error, index) => (
                    <li key={index} className="error-item">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {validationResult.warnings.length > 0 && (
              <div className="warnings-section">
                <h3>Warnings</h3>
                <ul>
                  {validationResult.warnings.map((warning, index) => (
                    <li key={index} className="warning-item">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {validationResult.valid && (
              <div className="success-message">
                All parameters are valid and match the schema!
              </div>
            )}
          </div>
        )}
      </div>

      <div className="examples-section">
        <h2>Example Schemas</h2>
        <div className="example-cards">
          <div className="example-card">
            <h3>Search Tool</h3>
            <pre>{`{
  "searchTool": {
    "required": ["query"],
    "properties": {
      "query": { "type": "string" },
      "limit": { "type": "number" }
    }
  }
}`}</pre>
          </div>

          <div className="example-card">
            <h3>Calculator Tool</h3>
            <pre>{`{
  "calculator": {
    "required": ["expression"],
    "properties": {
      "expression": {
        "type": "string",
        "minLength": 1
      }
    }
  }
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParameterValidation;
