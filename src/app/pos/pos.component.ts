import { Component } from '@angular/core';
import { ProductService } from '../services/product.service';
import { SalesService } from '../services/sales.service';
import { MembersService } from '../services/members.service';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss']
})
export class PosComponent {

  products: any[] = [];
  selectedProducts: any[] = [];
  members: any[] = [];
  overallTotal: number = 0;
  totalQuantity: number = 0;
  selectedMemberId: number = 0;
  filteredMembers: any[] = [];
  selectedMember: any = null;
  searchTerm: string = '';

  constructor(
    public productService: ProductService,
    public salesService: SalesService,
    private membersService: MembersService
  ) { }

  ngOnInit() {
    this.productService.products$.subscribe((products: any[]) => {
      if (products && products.length > 0) {
        this.products = products.map(product => ({ ...product, counter: 0 }));
      }
    });

    this.membersService.members$.subscribe((members: any[]) => {
      if (members && members.length > 0) {
        this.members = members;
        this.filteredMembers = [...members];
      }
    });
  }

  customSearchFn(term: string, item: any) {
    item.name = item.name.replace(',','');
    term = term.toLocaleLowerCase();
    return item.name.toLocaleLowerCase().indexOf(term) > -1;
  }

  filterMembers(): void {
    this.filteredMembers = this.members.filter(member =>
      member.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  onMemberChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedMemberId = Number(selectedValue);
    console.log('Selected Member ID:', this.selectedMemberId);
  }

  addToRightDiv(product: any) {
    const existingProductIndex = this.selectedProducts.findIndex(selectedProduct => selectedProduct.product === product.product);

    if (existingProductIndex === -1) {
        product.counter++;
        this.selectedProducts.push(product);
    } else {
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
    const transactionId = this.generateTransactionId();
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
      transactionId: transactionId,
      dateTime: new Date().toISOString()
    };

    if(this.selectedMemberId == undefined) {
      this.selectedMemberId = 0;
    }

    console.log('Order Summary:', orderSummary, this.selectedMemberId);
    // this.addToSales(orderSummary);
    // this.selectedProducts = [];
    // this.calculateOverallTotal();
  }

  addToSales(transactionSales: any) {
    console.log('sale', transactionSales)
    this.salesService.addSales(transactionSales);
}

  generateTransactionId(): string {
    const randomNumber = Math.floor(Math.random() * 90000) + 10000;
    const timestamp = new Date().getTime();
    const transactionId = `TRX-${timestamp}-${randomNumber}`;

    return transactionId;
  }

}
