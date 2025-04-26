import { Component, TemplateRef, ViewChild, ChangeDetectorRef } from "@angular/core";
import { FoodsService } from "../../services/foods.service";
import { ModalService } from "../../modal.service";
import { WebSocketService } from "../../websocket-service";

@Component({
  selector: "app-foods",
  templateUrl: "./foods.component.html",
  styleUrls: ["./foods.component.scss"],
})
export class FoodsComponent {
  @ViewChild("addProductModal") addProductModal?: TemplateRef<any>;
  @ViewChild("addStockModal") addStockModal?: TemplateRef<any>;
  @ViewChild("editProductModal") editProductModal?: TemplateRef<any>;
  products: any[] = [];
  newProduct: any = { product: "", price: "", stocks: "", utensils: false };
  editingProduct: any = null;
  qty: string = "";

  constructor(
    private modalService: ModalService,
    private foodsService: FoodsService,
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.foodsService.foods$.subscribe((products: any[]) => {
      this.products = products;
    });

    this.webSocketService.receive().subscribe((message: any) => {
      if (message.action === "addProduct") {
        this.products.push(message.product);
        this.cdr.detectChanges();
      }
    });
  }

  editProduct(product: any) {
    this.editingProduct = { ...product };
    this.modalService.openModal(this.editProductModal);
  }

  addModal() {
    this.modalService.openModal(this.addProductModal);
  }

  addProduct() {
    // this.foodsService.addProduct(this.newProduct);

    this.foodsService.addProduct(this.newProduct).subscribe({
      next: (createdProduct: any) => {
        console.log("Product added", createdProduct);
        this.products.push(createdProduct); // ✅ Add new item to the list
        this.modalService.closeModal();
        this.clearForm();
      },

      error: (err) => {
        console.error("Failed to add product:", err);
        // this.errorMessage = 'Error adding member: ' + err.message;
      },
    });

    this.newProduct = { product: "", price: "", stocks: "", utensils: false };
  }

  addStocks(product: any) {
    this.editingProduct = { ...product };
    this.modalService.openModal(this.addStockModal);
  }

  saveEditedProduct() {
    if (this.editingProduct) {
      console.log("drinks", this.editingProduct.id, this.editingProduct);
      this.foodsService.editProduct(this.editingProduct.id, this.editingProduct);
      this.modalService.closeModal();
      this.editingProduct = null;
    }
  }

  saveAddedStocks() {
    const newStocks = parseInt(this.qty, 10);
    if (!isNaN(newStocks)) {
      const currentStocks = parseInt(this.editingProduct.stocks, 10);
      const totalStocks = currentStocks + newStocks;
      this.editingProduct.stocks = totalStocks.toString();

      const updatedProducts = this.products.map((p) => {
        if (p.id === this.editingProduct.id) {
          return { ...p, stocks: this.editingProduct.stocks };
        }
        return p;
      });
      this.products = updatedProducts;

      this.foodsService.addStocks(this.editingProduct.id, this.editingProduct);
      this.modalService.closeModal();
      this.editingProduct = null;
    } else {
      console.error("Invalid stock quantity");
    }
    this.clearForm();
  }

  cancelForm() {
    this.clearForm();
    this.modalService.closeModal();
  }

  clearForm() {
    this.newProduct = { product: "", price: "", stocks: "", utensils: false };
  }
}
