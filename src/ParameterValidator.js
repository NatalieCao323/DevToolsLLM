const fs = require('fs');

/**
 * Parameter validator for LLM tool calls
 */
class ParameterValidator {
  constructor(schema) {
    this.schema = schema || {};
  }

  /**
   * Validate parameters against schema
   */
  validate(params, toolName) {
    const toolSchema = this.schema[toolName];
    
    if (!toolSchema) {
      return {
        valid: false,
        errors: [`No schema found for tool: ${toolName}`]
      };
    }

    const errors = [];
    const warnings = [];

    // Check required parameters
    if (toolSchema.required) {
      toolSchema.required.forEach(param => {
        if (!(param in params)) {
          errors.push(`Missing required parameter: ${param}`);
        }
      });
    }

    // Validate parameter types
    if (toolSchema.properties) {
      Object.entries(params).forEach(([key, value]) => {
        const propSchema = toolSchema.properties[key];
        
        if (!propSchema) {
          warnings.push(`Unknown parameter: ${key}`);
          return;
        }

        const typeError = this.validateType(value, propSchema, key);
        if (typeError) {
          errors.push(typeError);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate parameter type
   */
  validateType(value, schema, paramName) {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    
    if (schema.type && actualType !== schema.type) {
      return `Parameter '${paramName}' expected type ${schema.type}, got ${actualType}`;
    }

    // Validate array items
    if (schema.type === 'array' && schema.items && Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const itemError = this.validateType(value[i], schema.items, `${paramName}[${i}]`);
        if (itemError) return itemError;
      }
    }

    // Validate object properties
    if (schema.type === 'object' && schema.properties && typeof value === 'object') {
      for (const [key, val] of Object.entries(value)) {
        if (schema.properties[key]) {
          const propError = this.validateType(val, schema.properties[key], `${paramName}.${key}`);
          if (propError) return propError;
        }
      }
    }

    // Validate enum
    if (schema.enum && !schema.enum.includes(value)) {
      return `Parameter '${paramName}' must be one of: ${schema.enum.join(', ')}`;
    }

    // Validate min/max
    if (typeof value === 'number') {
      if (schema.minimum !== undefined && value < schema.minimum) {
        return `Parameter '${paramName}' must be >= ${schema.minimum}`;
      }
      if (schema.maximum !== undefined && value > schema.maximum) {
        return `Parameter '${paramName}' must be <= ${schema.maximum}`;
      }
    }

    // Validate string length
    if (typeof value === 'string') {
      if (schema.minLength !== undefined && value.length < schema.minLength) {
        return `Parameter '${paramName}' must be at least ${schema.minLength} characters`;
      }
      if (schema.maxLength !== undefined && value.length > schema.maxLength) {
        return `Parameter '${paramName}' must be at most ${schema.maxLength} characters`;
      }
    }

    return null;
  }

  /**
   * Load schema from file
   */
  static loadSchema(schemaFile) {
    try {
      const schemaData = fs.readFileSync(schemaFile, 'utf-8');
      const schema = JSON.parse(schemaData);
      return new ParameterValidator(schema);
    } catch (error) {
      throw new Error(`Failed to load schema: ${error.message}`);
    }
  }
}

/**
 * Validate tool call parameters from command line
 */
async function validate(schemaFile) {
  try {
    const validator = ParameterValidator.loadSchema(schemaFile);
    
    console.log('\n✅ Schema loaded successfully\n');
    console.log('='.repeat(60));
    console.log('\n📋 Available tools:');
    
    Object.keys(validator.schema).forEach(toolName => {
      console.log(`  - ${toolName}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('\n💡 Usage:');
    console.log('  const validator = ParameterValidator.loadSchema("schema.json");');
    console.log('  const result = validator.validate(params, "toolName");');
    console.log('  if (!result.valid) {');
    console.log('    console.error(result.errors);');
    console.log('  }');
    console.log('');
    
    return validator;
  } catch (error) {
    console.error('Error validating schema:', error.message);
    throw error;
  }
}

module.exports = {
  ParameterValidator,
  validate
};
