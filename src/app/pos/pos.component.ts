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
  selectedMemberName: string = 'Walk-in Customer';
  filteredMembers: any[] = [];
  searchTerm: string = '';
  pc: any;

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

  updateButtonState(): void {
    this.pc = Number(this.pc);
    if (this.pc > 0) {
      const nextOrderButton = document.querySelector('.pos_selected_next');
      if (nextOrderButton) {
        nextOrderButton.classList.remove('disable');
      }
    } else {
      const nextOrderButton = document.querySelector('.pos_selected_next');
      if (nextOrderButton) {
        nextOrderButton.classList.add('disable');
      }
    }
    this.calculateOverallTotal();
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

  onMemberChange(): void {
    const selectedMember = this.members.find(member => member.id === this.selectedMemberId);
    this.selectedMemberName = selectedMember ? selectedMember.name : 'Walk-in Customer';
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
    console.log('this.pc', this.pc)
  }

  calculateOverallTotal() {
    this.pc = this.ensureNumber(this.pc); // Ensure pc is treated as a number
    this.overallTotal = this.selectedProducts.reduce((total, selectedProduct) => {
      return total + (selectedProduct.price * selectedProduct.counter);
    }, 0) + this.pc; // Add the value of pc to overallTotal
    this.totalQuantity = this.selectedProducts.reduce((total, selectedProduct) => {
      return total + selectedProduct.counter;
    }, 0);
  }

  updateOverallTotal() {
    this.calculateOverallTotal();
  }

  ensureNumber(value: any): any {
    return isNaN(Number(value)) ? '' : Number(value);
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

    if(this.selectedMemberId == 0) {
      this.selectedMemberName = 'Walk-in Customer'
    }

    console.log('customer', this.selectedMemberId, this.selectedMemberName)

    const orderSummary = {
      orders: orders,
      qty: this.totalQuantity,
      total: this.overallTotal,
      transactionId: transactionId,
      dateTime: new Date().toISOString(),
      customer: this.selectedMemberName,
      computer: this.pc
    };

    console.log('Order Summary:', orderSummary, this.pc);
    this.addToSales(orderSummary);
    this.selectedMemberId = 0;
    this.selectedProducts = [];
    this.pc = ''
    this.calculateOverallTotal();
    this.updateButtonState();
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
