const { createSource } = require('./dist/index.js');

const source = createSource({
  id: 'test',
  entities: {
    product: {
      table: {
        name: 'products',
        schema: 'public',
        columns: {
          id: { type: 'integer', nullable: false, unique: true, default: 'auto_increment' },
          name: { type: 'varchar', nullable: false, unique: false, default: undefined },
          price: { type: 'decimal', nullable: false, unique: false, default: undefined }
        }
      }
    }
  }
});

const app = source.getApp();

async function testCRUD() {
  console.log('🧪 Testing Complete CRUD Operations\n');

  try {
    // Create
    console.log('1. Creating product...');
    const createReq = new Request('http://localhost:3000/test/product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Laptop', price: 999.99 })
    });
    const createRes = await app.fetch(createReq);
    const created = await createRes.json();
    console.log('   Created:', created);
    console.log('   Status:', createRes.status);

    // Read Many
    console.log('\n2. Reading all products...');
    const readManyReq = new Request('http://localhost:3000/test/product');
    const readManyRes = await app.fetch(readManyReq);
    const products = await readManyRes.json();
    console.log('   Products:', products);
    console.log('   Status:', readManyRes.status);

    // Read One
    console.log('\n3. Reading single product...');
    const readOneReq = new Request('http://localhost:3000/test/product/1');
    const readOneRes = await app.fetch(readOneReq);
    const product = await readOneRes.json();
    console.log('   Product:', product);
    console.log('   Status:', readOneRes.status);

    // Update
    console.log('\n4. Updating product...');
    const updateReq = new Request('http://localhost:3000/test/product/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Gaming Laptop', price: 1299.99 })
    });
    const updateRes = await app.fetch(updateReq);
    const updated = await updateRes.json();
    console.log('   Updated:', updated);
    console.log('   Status:', updateRes.status);

    // Read after update
    console.log('\n5. Reading updated product...');
    const readUpdatedReq = new Request('http://localhost:3000/test/product/1');
    const readUpdatedRes = await app.fetch(readUpdatedReq);
    const updatedProduct = await readUpdatedRes.json();
    console.log('   Updated Product:', updatedProduct);

    // Delete
    console.log('\n6. Deleting product...');
    const deleteReq = new Request('http://localhost:3000/test/product/1', {
      method: 'DELETE'
    });
    const deleteRes = await app.fetch(deleteReq);
    const deleted = await deleteRes.json();
    console.log('   Deleted:', deleted);
    console.log('   Status:', deleteRes.status);

    // Verify deletion
    console.log('\n7. Verifying deletion...');
    const verifyReq = new Request('http://localhost:3000/test/product');
    const verifyRes = await app.fetch(verifyReq);
    const remaining = await verifyRes.json();
    console.log('   Remaining products:', remaining);

    // Try to read deleted product (should return 404)
    console.log('\n8. Trying to read deleted product...');
    const readDeletedReq = new Request('http://localhost:3000/test/product/1');
    const readDeletedRes = await app.fetch(readDeletedReq);
    const deletedResult = await readDeletedRes.json();
    console.log('   Result:', deletedResult);
    console.log('   Status:', readDeletedRes.status);

  } catch (error) {
    console.error('Test error:', error);
  }
}

testCRUD().then(() => {
  console.log('\n✅ CRUD tests completed!');
}).catch(error => {
  console.error('\n❌ CRUD tests failed:', error);
}); 