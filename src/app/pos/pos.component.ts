import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ProductService } from '../services/product.service';
import { SalesService } from '../services/sales.service';
import { MembersService } from '../services/members.service';
import { FoodsService } from '../services/foods.service';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss']
})
export class PosComponent {

  products: any[] = [];
  foods: any[] = [];
  selectedProducts: any[] = [];
  members: any[] = [];
  overallTotal: number = 0;
  totalQuantity: number = 0;
  selectedMemberId: number = 0;
  selectedMemberName: string = 'Walk-in Customer';
  filteredMembers: any[] = [];
  searchTerm: string = '';
  pc: any;
  subtotal: number = 0;
  paidAmount: number | null = null;
  credit: boolean = false;
  creditAmount: number = 0;
  mode_of_payment: string = 'cash';

  constructor(
    public productService: ProductService,
    private foodsService: FoodsService,
    public salesService: SalesService,
    private membersService: MembersService
  ) { }

  ngOnInit() {
    this.productService.products$.subscribe((products: any[]) => {
      if (products && products.length > 0) {
        this.products = products.map(product => ({ ...product, counter: 0 }));
      }
    });

    this.foodsService.foods$.subscribe((foods: any[]) => {
      if(foods && foods.length > 0) {
        this.foods = foods.map(food => ({ ...food, counter: 0 }))
      }
    })

    this.membersService.members$.subscribe((members: any[]) => {
      if (members && members.length > 0) {
        this.members = members;
        this.filteredMembers = [...members];
      }
    });
  }

  check() {
    this.credit = !this.credit;
    if (!this.credit) {
      this.creditAmount = 0;
    }
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
        const newProduct = { ...product, counter: 1 };
        this.selectedProducts.push(newProduct);
    } else {
        this.selectedProducts[existingProductIndex].counter++;
    }
    this.subtotal = this.calculateSubtotal();
    this.calculateOverallTotal();
  }

  calculateOverallTotal() {
    this.pc = this.ensureNumber(this.pc);
    this.subtotal = this.calculateSubtotal();
    this.overallTotal = this.subtotal + this.pc;
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
    this.subtotal = this.calculateSubtotal();
    this.calculateOverallTotal();
  }

  decrementCounter(selectedProduct: any) {
    if (selectedProduct.counter > 0) {
      selectedProduct.counter--;
      this.subtotal = this.calculateSubtotal();
      this.calculateOverallTotal();
    }
  }

  deleteProduct(index: number) {
    this.selectedProducts.splice(index, 1);
    this.subtotal = this.calculateSubtotal();
    this.calculateOverallTotal();
    this.pc = this.selectedProducts.length === 0 ? undefined : this.pc;
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

    if (this.selectedMemberId == 0) {
      this.selectedMemberName = 'Walk-in Customer';
    }

    this.creditAmount = this.calculateCredit();

    if(this.pc == '') {
      this.pc = 0;
    }

    this.subtotal = this.calculateSubtotal();
    const orderSummary = {
      orders: orders,
      qty: this.totalQuantity,
      total: this.overallTotal,
      subtotal: this.subtotal,
      transactionId: transactionId,
      dateTime: new Date().toISOString(),
      customer: this.selectedMemberName,
      computer: this.pc,
      mode_of_payment: this.mode_of_payment,
      credit: this.creditAmount
    };

    console.log('Order Summary:', orderSummary, this.creditAmount);
    this.addToSales(orderSummary);
    this.selectedMemberId = 0;
    this.selectedProducts = [];
    this.pc = '';
    this.creditAmount = 0;
    this.mode_of_payment = 'cash';
    this.calculateOverallTotal();
    this.updateButtonState();
    this.credit = false;
    this.paidAmount = 0;
    this.overallTotal = 0;
  }

  addToSales(transactionSales: any) {
    this.salesService.addSales(transactionSales);
  }

  calculateSubtotal(): number {
    return this.selectedProducts.reduce((subtotal, selectedProduct) => {
      return subtotal + (selectedProduct.price * selectedProduct.counter);
    }, 0);
  }
  
  updatePaidAmount() {
    this.paidAmount = Number(this.paidAmount);
  }

  calculateCredit(): number {
    if (this.credit) {
      if (this.paidAmount !== null) {
        return this.overallTotal - this.paidAmount;
      } else {
        return this.overallTotal;
      }
    } else {
      return 0;
    }
  }

  isCreditDue(): boolean {
    return this.calculateCredit() > 0;
  }

  generateTransactionId(): string {
    const randomNumber = Math.floor(Math.random() * 90000) + 10000;
    const timestamp = new Date().getTime();
    const transactionId = `TRX-${timestamp}-${randomNumber}`;

    return transactionId;
  }

}
