// src/controller/product.controller.ts
import { Request, Response } from '../router/router';
import { ProductDtos } from '../dtos/product.dtos';

const productService = new ProductDtos();

export const getAllProducts = (req: Request, res: Response) => {
  try {
    const products = productService.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params!.id);
    const product = productService.getProductById(id);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = (req: Request, res: Response) => {
  try {
    const { name, price, description } = req.body;

    if (!name || !price) {
      res.status(400).json({ error: 'Name and price are required' });
      return;
    }

    const newProduct = productService.createProduct({ name, price, description });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params!.id);
    const { name, price, description } = req.body;

    const updatedProduct = productService.updateProduct(id, { name, price, description });

    if (!updatedProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params!.id);
    const success = productService.deleteProduct(id);

    if (!success) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};