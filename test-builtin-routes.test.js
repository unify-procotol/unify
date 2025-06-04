const { test, expect } = require('bun:test');
const { createSource } = require('./dist/index.js');

test('默认内置路由', () => {
  const source1 = createSource({
    id: 'api',
    entities: {
      user: {
        findMany: async () => [{ id: 1, name: 'Alice' }],
        findOne: async (args) => ({ id: parseInt(args.id), name: 'Alice' })
      }
    }
  });

  const routes = source1.getRoutes();
  expect(routes.length).toBeGreaterThan(0);
  expect(routes.some(r => r.method === 'GET')).toBe(true);
});

test('自定义消息', () => {
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

  expect(source2).toBeDefined();
  expect(typeof source2.getRoutes).toBe('function');
});

test('禁用内置路由', () => {
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

  expect(source3).toBeDefined();
  expect(typeof source3.getRoutes).toBe('function');
}); 