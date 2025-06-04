const { createSource } = require('./dist/index.js');

// 创建一个简单的测试源
const source = createSource({
  id: "test",
  entities: {
    // 完全使用内置方法的实体
    product: {
      table: {
        name: "products",
        schema: "public",
        columns: {
          id: {
            type: "integer",
            nullable: false,
            unique: true,
            default: "auto_increment"
          },
          name: {
            type: "varchar",
            nullable: false,
            unique: false,
            default: undefined
          },
          price: {
            type: "decimal",
            nullable: false,
            unique: false,
            default: undefined
          },
          description: {
            type: "text",
            nullable: true,
            unique: false,
            default: null
          }
        }
      }
      // 没有定义任何方法，将使用内置CRUD
    },

    // 混合使用内置和自定义方法的实体
    category: {
      table: {
        name: "categories",
        schema: "public",
        columns: {
          id: {
            type: "integer",
            nullable: false,
            unique: true,
            default: "auto_increment"
          },
          name: {
            type: "varchar",
            nullable: false,
            unique: true,
            default: undefined
          }
        }
      },

      // 自定义create方法
      create: async (args) => {
        console.log("Custom category create:", args);
        if (!args?.name) {
          throw { status: 400, message: "Category name is required" };
        }
        return {
          id: Date.now(),
          name: args.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      // findMany, findOne, update, delete 将使用内置方法
    }
  }
});

const app = source.getApp();

// 测试函数
async function testAPI() {
  console.log("🧪 Testing Table Config and Builtin CRUD Methods\n");

  try {
    // 测试内置create方法
    console.log("1. Testing builtin create (POST /test/product)");
    const createReq = new Request('http://localhost:3000/test/product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Test Product",
        price: 99.99,
        description: "A test product"
      })
    });
    
    const createRes = await app.fetch(createReq);
    const createData = await createRes.json();
    console.log("Create response:", createData);
    console.log("Status:", createRes.status);
    console.log("");

    // 测试内置findMany方法
    console.log("2. Testing builtin findMany (GET /test/product)");
    const findManyReq = new Request('http://localhost:3000/test/product');
    const findManyRes = await app.fetch(findManyReq);
    const findManyData = await findManyRes.json();
    console.log("FindMany response:", findManyData);
    console.log("Status:", findManyRes.status);
    console.log("");

    // 测试自定义create方法
    console.log("3. Testing custom create (POST /test/category)");
    const customCreateReq = new Request('http://localhost:3000/test/category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Electronics"
      })
    });
    
    const customCreateRes = await app.fetch(customCreateReq);
    const customCreateData = await customCreateRes.json();
    console.log("Custom create response:", customCreateData);
    console.log("Status:", customCreateRes.status);
    console.log("");

    // 测试内置findMany方法（category实体）
    console.log("4. Testing builtin findMany for category (GET /test/category)");
    const categoryFindReq = new Request('http://localhost:3000/test/category');
    const categoryFindRes = await app.fetch(categoryFindReq);
    const categoryFindData = await categoryFindRes.json();
    console.log("Category findMany response:", categoryFindData);
    console.log("Status:", categoryFindRes.status);
    console.log("");

    // 测试验证错误
    console.log("5. Testing validation error (POST /test/product without required fields)");
    const errorReq = new Request('http://localhost:3000/test/product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: "Missing name and price"
      })
    });
    
    const errorRes = await app.fetch(errorReq);
    const errorData = await errorRes.json();
    console.log("Validation error response:", errorData);
    console.log("Status:", errorRes.status);
    console.log("");

    // 测试API文档
    console.log("6. Testing API documentation (GET /api-doc)");
    const docReq = new Request('http://localhost:3000/api-doc');
    const docRes = await app.fetch(docReq);
    const docData = await docRes.json();
    console.log("API doc response:", JSON.stringify(docData, null, 2));
    console.log("");

  } catch (error) {
    console.error("Test error:", error);
  }
}

// 运行测试
testAPI().then(() => {
  console.log("✅ Tests completed!");
}).catch(error => {
  console.error("❌ Test failed:", error);
});

// 导出用于服务器运行
module.exports = {
  port: 3000,
  fetch: app.fetch,
}; 