import { Component } from '@angular/core';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss']
})
export class PosComponent {

  products: any[] = [];
  selectedProducts: any[] = [];
  overallTotal: number = 0;
  totalQuantity: number = 0;

  constructor(public productService: ProductService) { }

  ngOnInit() {
    // Subscribe to the products$ observable to get the list of products
    this.productService.products$.subscribe((products: any[]) => {
      if (products && products.length > 0) {
        this.products = products.map(product => ({ ...product, counter: 0 }));
      }
    });
  }

  addToRightDiv(product: any) {
    // Check if the product already exists in selectedProducts
    const existingProductIndex = this.selectedProducts.findIndex(selectedProduct => selectedProduct.product === product.product);

    if (existingProductIndex === -1) {
        // If the product doesn't exist, add it to selectedProducts
        product.counter++;
        this.selectedProducts.push(product);
    } else {
        // If the product already exists, increment its counter
        this.selectedProducts[existingProductIndex].counter++;
    }
    this.calculateOverallTotal();
  }

  calculateOverallTotal() {
    this.overallTotal = this.selectedProducts.reduce((total, selectedProduct) => {
      return total + (selectedProduct.price * selectedProduct.counter);
    }, 0);
    this.totalQuantity = this.selectedProducts.reduce((total, selectedProduct) => {
      return total + selectedProduct.counter;
    }, 0);
  }

  updateOverallTotal() {
    this.calculateOverallTotal();
  }

  incrementCounter(selectedProduct: any) {
    selectedProduct.counter++;
    this.calculateOverallTotal();
  }

  decrementCounter(selectedProduct: any) {
    if (selectedProduct.counter > 0) {
      selectedProduct.counter--;
      this.calculateOverallTotal();
    }
  }

  deleteProduct(index: number) {
    this.selectedProducts.splice(index, 1);
    this.calculateOverallTotal();
  }

  clearSelectedProducts() {

    // Generate transaction ID
    const transactionId = this.generateTransactionId();

    // Log order summary with transaction ID
    const orders = this.selectedProducts.map(product => {
        return {
            product: product.product,
            price: product.price,
            quantity: product.counter,
            total: product.price * product.counter
        };
    });

    const orderSummary = {
        orders: orders,
        qty: this.totalQuantity,
        total: this.overallTotal,
        transactionId: transactionId, // Add the transaction ID to the order summary
        dateTime: new Date().toISOString()
    };

    console.log('Order Summary:', orderSummary);
    this.selectedProducts = [];
    this.calculateOverallTotal();
  }

  generateTransactionId(): string {
    const randomNumber = Math.floor(Math.random() * 90000) + 10000;

    // Get the current timestamp
    const timestamp = new Date().getTime();

    // Concatenate the timestamp and random number to create the transaction ID
    const transactionId = `TRX-${timestamp}-${randomNumber}`;

    return transactionId;
  }


}
