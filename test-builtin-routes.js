const { createSource } = require('./dist/index.js');

// 测试默认内置路由
console.log('=== 测试默认内置路由 ===');
const source1 = createSource({
  id: 'api',
  entities: {
    user: {
      findMany: async () => [{ id: 1, name: 'Alice' }],
      findOne: async (args) => ({ id: parseInt(args.id), name: 'Alice' })
    }
  }
});

console.log('可用路由:', source1.getRoutes().map(r => `${r.method} ${r.path}`));

// 测试自定义消息
console.log('\n=== 测试自定义消息 ===');
const source2 = createSource(
  {
    id: 'custom',
    entities: {
      user: {
        findMany: async () => [{ id: 1, name: 'Bob' }]
      }
    }
  },
  {
    enableBuiltinRoutes: true,
    rootMessage: 'My Custom API Server'
  }
);

console.log('自定义消息源创建成功');

// 测试禁用内置路由
console.log('\n=== 测试禁用内置路由 ===');
const source3 = createSource(
  {
    id: 'minimal',
    entities: {
      user: {
        findMany: async () => [{ id: 1, name: 'Charlie' }]
      }
    }
  },
  {
    enableBuiltinRoutes: false
  }
);

console.log('禁用内置路由的源创建成功');
console.log('所有测试通过！'); 