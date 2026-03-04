/**
 * 测试 Parameter Validation 的真实验证能力
 * 证明它不是只显示 success，而是真的在验证
 */

console.log('🧪 测试 Parameter Validation 真实验证能力\n');
console.log('='.repeat(70));

// 模拟前端验证逻辑
function validateParams(schema, params, toolName) {
  try {
    const schemaObj = JSON.parse(schema);
    const paramsObj = JSON.parse(params);
    
    const toolSchema = schemaObj[toolName];
    
    if (!toolSchema) {
      return {
        valid: false,
        errors: [`No schema found for tool: ${toolName}`],
        warnings: []
      };
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

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };

  } catch (error) {
    return {
      valid: false,
      errors: [`JSON Parse Error: ${error.message}`],
      warnings: []
    };
  }
}

// Schema 定义
const schema = JSON.stringify({
  searchTool: {
    required: ["query"],
    properties: {
      query: {
        type: "string",
        minLength: 1,
        maxLength: 200
      },
      limit: {
        type: "number",
        minimum: 1,
        maximum: 100
      }
    }
  }
});

// 测试用例
const testCases = [
  {
    name: '✅ 正确的参数',
    params: JSON.stringify({ query: "test search", limit: 10 }),
    toolName: 'searchTool'
  },
  {
    name: '❌ 缺少必需参数',
    params: JSON.stringify({ limit: 10 }),
    toolName: 'searchTool'
  },
  {
    name: '❌ 类型错误 - query 应该是 string',
    params: JSON.stringify({ query: 123, limit: 10 }),
    toolName: 'searchTool'
  },
  {
    name: '❌ 类型错误 - limit 应该是 number',
    params: JSON.stringify({ query: "test", limit: "10" }),
    toolName: 'searchTool'
  },
  {
    name: '❌ query 太短（minLength: 1）',
    params: JSON.stringify({ query: "", limit: 10 }),
    toolName: 'searchTool'
  },
  {
    name: '❌ query 太长（maxLength: 200）',
    params: JSON.stringify({ query: "a".repeat(201), limit: 10 }),
    toolName: 'searchTool'
  },
  {
    name: '❌ limit 太小（minimum: 1）',
    params: JSON.stringify({ query: "test", limit: 0 }),
    toolName: 'searchTool'
  },
  {
    name: '❌ limit 太大（maximum: 100）',
    params: JSON.stringify({ query: "test", limit: 101 }),
    toolName: 'searchTool'
  },
  {
    name: '⚠️  未知参数（会有警告）',
    params: JSON.stringify({ query: "test", limit: 10, unknown: "param" }),
    toolName: 'searchTool'
  },
  {
    name: '❌ 工具名不存在',
    params: JSON.stringify({ query: "test" }),
    toolName: 'nonExistentTool'
  },
  {
    name: '❌ 无效的 JSON',
    params: '{ invalid json }',
    toolName: 'searchTool'
  }
];

// 运行测试
console.log('\n📋 测试结果：\n');

let passCount = 0;
let failCount = 0;

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
  
  const result = validateParams(schema, testCase.params, testCase.toolName);
  
  if (result.valid) {
    console.log('   ✅ 验证通过');
    passCount++;
  } else {
    console.log('   ❌ 验证失败');
    failCount++;
  }
  
  if (result.errors.length > 0) {
    console.log('   错误:');
    result.errors.forEach(err => console.log(`     - ${err}`));
  }
  
  if (result.warnings.length > 0) {
    console.log('   警告:');
    result.warnings.forEach(warn => console.log(`     - ${warn}`));
  }
  
  console.log('');
});

console.log('='.repeat(70));
console.log('📊 测试总结\n');
console.log(`总测试数: ${testCases.length}`);
console.log(`预期通过: 1`);
console.log(`预期失败: ${testCases.length - 1}`);
console.log(`实际通过: ${passCount}`);
console.log(`实际失败: ${failCount}`);

if (passCount === 1 && failCount === testCases.length - 1) {
  console.log('\n🎉 验证功能完全正常！');
  console.log('✅ 能正确识别有效参数');
  console.log('✅ 能正确识别缺少必需参数');
  console.log('✅ 能正确识别类型错误');
  console.log('✅ 能正确识别长度/范围错误');
  console.log('✅ 能正确识别未知参数');
  console.log('✅ 能正确处理 JSON 解析错误');
} else {
  console.log('\n❌ 验证功能有问题');
}

console.log('\n' + '='.repeat(70));
console.log('\n💡 在 Web UI 中测试：');
console.log('   1. 访问 http://localhost:3003');
console.log('   2. 点击 "Parameter Validation"');
console.log('   3. 尝试修改参数，例如：');
console.log('      - 删除 "query" 字段 → 会显示错误');
console.log('      - 把 limit 改成 "10" (字符串) → 会显示类型错误');
console.log('      - 把 limit 改成 101 → 会显示超出范围');
console.log('   4. 点击 "Validate Parameters" 查看结果\n');
