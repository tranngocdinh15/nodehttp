// src/routes/product.route.ts
import { Router } from '../router/router';
import * as productController from '../controller/product.controller';

const router = new Router();

// GET /api/v1/products - Return list of products
router.get('/', productController.getAllProducts);

// GET /api/v1/products/:id - Return product by ID
router.get('/:id', productController.getProductById);

// POST /api/v1/products - Create new product
router.post('/', productController.createProduct);

// PUT /api/v1/products/:id - Update product
router.put('/:id', productController.updateProduct);

// DELETE /api/v1/products/:id - Delete product
router.delete('/:id', productController.deleteProduct);

export { router as productRoutes };