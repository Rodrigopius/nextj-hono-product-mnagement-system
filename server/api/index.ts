import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { productsCollection, categoriesCollection } from '../firebase/firebase';

const app = new Hono();

// ----------------- CORS -----------------
app.use('/*', cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-domain.vercel.app',
    '*.vercel.app'
  ],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// ----------------- VALIDATION -----------------
const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
});

// ----------------- HEALTH CHECK -----------------
app.get('/', (c) => {
  return c.json({
    ok: true,
    message: 'Product Management API is running (Vercel Serverless)',
    time: new Date().toISOString(),
  });
});

// ----------------- PRODUCTS -----------------

// GET all products
app.get('/products', async (c) => {
  const snap = await productsCollection.get();
  const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return c.json({ success: true, data });
});

// GET product by ID
app.get('/products/:id', async (c) => {
  const id = c.req.param('id');
  const doc = await productsCollection.doc(id).get();

  if (!doc.exists) return c.json({ success: false, error: 'Not found' }, 404);

  return c.json({ success: true, data: { id: doc.id, ...doc.data() } });
});

// CREATE product
app.post('/products', zValidator('json', productSchema), async (c) => {
  const body = c.req.valid('json');

  const exists = await productsCollection.where('slug', '==', body.slug).limit(1).get();
  if (!exists.empty) return c.json({ success: false, error: 'Slug already exists' }, 400);

  const newData = {
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const ref = await productsCollection.add(newData);

  return c.json({ success: true, data: { id: ref.id, ...newData } }, 201);
});

// UPDATE product
app.put('/products/:id', zValidator('json', productSchema.partial()), async (c) => {
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const doc = await productsCollection.doc(id).get();
  if (!doc.exists) return c.json({ success: false, error: 'Not found' }, 404);

  if (body.slug && body.slug !== doc.data()?.slug) {
    const exists = await productsCollection.where('slug', '==', body.slug).limit(1).get();
    if (!exists.empty) return c.json({ success: false, error: 'Slug already exists' }, 400);
  }

  const updateData = { ...body, updatedAt: new Date().toISOString() };

  await productsCollection.doc(id).update(updateData);

  return c.json({ success: true, data: { id, ...updateData } });
});

// DELETE product
app.delete('/products/:id', async (c) => {
  const id = c.req.param('id');

  const doc = await productsCollection.doc(id).get();
  if (!doc.exists) return c.json({ success: false, error: 'Not found' }, 404);

  await productsCollection.doc(id).delete();
  return c.json({ success: true });
});

// ----------------- CATEGORIES -----------------

app.get('/categories', async (c) => {
  const snap = await categoriesCollection.get();
  return c.json({
    success: true,
    data: snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  });
});

app.post('/categories', zValidator('json', categorySchema), async (c) => {
  const body = c.req.valid('json');

  const exists = await categoriesCollection.where('slug', '==', body.slug).limit(1).get();
  if (!exists.empty) return c.json({ success: false, error: 'Slug exists' }, 400);

  const data = { ...body, createdAt: new Date().toISOString() };
  const ref = await categoriesCollection.add(data);

  return c.json({ success: true, data: { id: ref.id, ...data } }, 201);
});

app.delete('/categories/:id', async (c) => {
  const id = c.req.param('id');

  const used = await productsCollection.where('category', '==', id).limit(1).get();
  if (!used.empty) return c.json({ success: false, error: 'Category in use' }, 400);

  await categoriesCollection.doc(id).delete();

  return c.json({ success: true });
});

// ----------------- EXPORT FOR VERCEL -----------------
export default app;
