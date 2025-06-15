import * as fs from 'fs';
import * as path from 'path';

interface Product {
    id: number;
    name: string;
    price: number;
    description?: string;
    createdAt: Date;
}

export class ProductDtos {
    private filePath: string;
    private products: Product[];

    constructor() {
        this.filePath = path.join(__dirname, '../data/products.json');
        this.products = this.loadProducts();
    }

    private loadProducts(): Product[] {
        try {
            if (fs.existsSync(this.filePath)) {
                const data = fs.readFileSync(this.filePath, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
        return [];
    }

    private saveProducts(): void {
        try {
            const dir = path.dirname(this.filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.filePath, JSON.stringify(this.products, null, 2));
        } catch (error) {
            console.error('Error saving products:', error);
            throw new Error('Failed to save products');
        }
    }

    getAllProducts(): Product[] {
        return this.products;
    }

    getProductById(id: number): Product | undefined {
        return this.products.find(product => product.id === id);
    }

    createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Product {
        const newProduct: Product = {
            id: this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1,
            ...productData,
            createdAt: new Date()
        };

        this.products.push(newProduct);
        this.saveProducts();
        return newProduct;
    }

    updateProduct(id: number, productData: Partial<Omit<Product, 'id' | 'createdAt'>>): Product | null {
        const productIndex = this.products.findIndex(product => product.id === id);

        if (productIndex === -1) {
            return null;
        }

        this.products[productIndex] = { ...this.products[productIndex], ...productData };
        this.saveProducts();
        return this.products[productIndex];
    }

    deleteProduct(id: number): boolean {
        const productIndex = this.products.findIndex(product => product.id === id);

        if (productIndex === -1) {
            return false;
        }

        this.products.splice(productIndex, 1);
        this.saveProducts();
        return true;
    }
}