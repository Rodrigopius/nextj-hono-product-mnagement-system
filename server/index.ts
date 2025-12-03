import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { serve } from '@hono/node-server';
import { productsCollection, categoriesCollection } from './firebase/firebase';

const app = new Hono();

// Enable CORS for frontend
app.use('/*', cors({
  origin: ['http://localhost:3000'], // Your Next.js frontend
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// Product validation schema
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

// Category validation schema
const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
});

// ==================== HEALTH CHECK ====================
app.get('/', (c) => {
  return c.json({ 
    message: 'Product Management API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ==================== PRODUCT ENDPOINTS ====================

// GET all products
app.get('/products', async (c) => {
  try {
    const snapshot = await productsCollection.get();
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return c.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    }, 500);
  }
});

// GET single product by ID
app.get('/products/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const doc = await productsCollection.doc(id).get();
    
    if (!doc.exists) {
      return c.json({
        success: false,
        error: 'Product not found'
      }, 404);
    }
    
    return c.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch product',
      message: error.message
    }, 500);
  }
});

// CREATE new product
app.post('/products', zValidator('json', productSchema), async (c) => {
  const productData = c.req.valid('json');
  
  try {
    // Check if product with same slug already exists
    const existingProduct = await productsCollection
      .where('slug', '==', productData.slug)
      .limit(1)
      .get();
    
    if (!existingProduct.empty) {
      return c.json({
        success: false,
        error: 'Product with this slug already exists'
      }, 400);
    }
    
    const newProduct = {
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const docRef = await productsCollection.add(newProduct);
    
    return c.json({
      success: true,
      message: 'Product created successfully',
      data: {
        id: docRef.id,
        ...newProduct
      }
    }, 201);
  } catch (error: any) {
    console.error('Error creating product:', error);
    return c.json({
      success: false,
      error: 'Failed to create product',
      message: error.message
    }, 500);
  }
});

// UPDATE product
app.put('/products/:id', zValidator('json', productSchema.partial()), async (c) => {
  const id = c.req.param('id');
  const updateData = c.req.valid('json');
  
  try {
    const doc = await productsCollection.doc(id).get();
    
    if (!doc.exists) {
      return c.json({
        success: false,
        error: 'Product not found'
      }, 404);
    }
    
    // Check if slug is being changed and if it already exists
    if (updateData.slug && updateData.slug !== doc.data()?.slug) {
      const existingProduct = await productsCollection
        .where('slug', '==', updateData.slug)
        .limit(1)
        .get();
      
      if (!existingProduct.empty) {
        return c.json({
          success: false,
          error: 'Product with this slug already exists'
        }, 400);
      }
    }
    
    const updatedProduct = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    
    await productsCollection.doc(id).update(updatedProduct);
    
    return c.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        id,
        ...updatedProduct
      }
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return c.json({
      success: false,
      error: 'Failed to update product',
      message: error.message
    }, 500);
  }
});

// DELETE product
app.delete('/products/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const doc = await productsCollection.doc(id).get();
    
    if (!doc.exists) {
      return c.json({
        success: false,
        error: 'Product not found'
      }, 404);
    }
    
    await productsCollection.doc(id).delete();
    
    return c.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return c.json({
      success: false,
      error: 'Failed to delete product',
      message: error.message
    }, 500);
  }
});

// ==================== CATEGORY ENDPOINTS ====================

// GET all categories
app.get('/categories', async (c) => {
  try {
    const snapshot = await categoriesCollection.get();
    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return c.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch categories',
      message: error.message
    }, 500);
  }
});

// CREATE new category
app.post('/categories', zValidator('json', categorySchema), async (c) => {
  const categoryData = c.req.valid('json');
  
  try {
    // Check if category with same slug already exists
    const existingCategory = await categoriesCollection
      .where('slug', '==', categoryData.slug)
      .limit(1)
      .get();
    
    if (!existingCategory.empty) {
      return c.json({
        success: false,
        error: 'Category with this slug already exists'
      }, 400);
    }
    
    const newCategory = {
      ...categoryData,
      createdAt: new Date().toISOString(),
    };
    
    const docRef = await categoriesCollection.add(newCategory);
    
    return c.json({
      success: true,
      message: 'Category created successfully',
      data: {
        id: docRef.id,
        ...newCategory
      }
    }, 201);
  } catch (error: any) {
    console.error('Error creating category:', error);
    return c.json({
      success: false,
      error: 'Failed to create category',
      message: error.message
    }, 500);
  }
});

// DELETE category
app.delete('/categories/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    // Check if any products are using this category
    const productsWithCategory = await productsCollection
      .where('category', '==', id)
      .limit(1)
      .get();
    
    if (!productsWithCategory.empty) {
      return c.json({
        success: false,
        error: 'Cannot delete category. Products are still associated with it.'
      }, 400);
    }
    
    const doc = await categoriesCollection.doc(id).get();
    
    if (!doc.exists) {
      return c.json({
        success: false,
        error: 'Category not found'
      }, 404);
    }
    
    await categoriesCollection.doc(id).delete();
    
    return c.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return c.json({
      success: false,
      error: 'Failed to delete category',
      message: error.message
    }, 500);
  }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Endpoint not found'
  }, 404);
});

// Global error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  
  return c.json({
    success: false,
    error: 'Internal server error',
    message: err.message
  }, 500);
});

// ==================== SERVER START ====================

const port = parseInt(process.env.PORT || '3001');

console.clear(); // Clear console to avoid duplicate output

console.log('Starting Product Management API Server...');

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`
Server is running on port ${info.port}
Started: ${new Date().toLocaleString()}
Environment: ${process.env.NODE_ENV || 'development'}

Available Endpoints:
  GET    http://localhost:${info.port}/               - Health check
  GET    http://localhost:${info.port}/products       - Get all products
  POST   http://localhost:${info.port}/products       - Create product
  GET    http://localhost:${info.port}/products/:id   - Get product by ID
  PUT    http://localhost:${info.port}/products/:id   - Update product
  DELETE http://localhost:${info.port}/products/:id   - Delete product
  GET    http://localhost:${info.port}/categories     - Get all categories
  POST   http://localhost:${info.port}/categories     - Create category
  DELETE http://localhost:${info.port}/categories/:id - Delete category

Frontend URL: http://localhost:3000
`);
});

export default app;