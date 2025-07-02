import { Component, TemplateRef, ViewChild } from "@angular/core";
import { ModalService } from "../../modal.service";
import { ProductService } from "../../services/product.service";
import { WebSocketService } from "../../websocket-service";

@Component({
  selector: "app-products",
  templateUrl: "./products.component.html",
  styleUrl: "./products.component.scss",
})
export class ProductsComponent {
  @ViewChild("editProductModal") editProductModal?: TemplateRef<any>;
  @ViewChild("addProductModal") addProductModal?: TemplateRef<any>;
  product: string = "";
  price: string = "";
  products: any[] = [];
  newProduct: any = {
    product: "",
    price: 0,
    barista: true, // Default to true; change to false if needed
  };
  editingProduct: any = null;

  constructor(private modalService: ModalService, private productService: ProductService) {}

  ngOnInit() {
    this.productService.getProducts();
    this.productService.products$.subscribe((products: any[]) => {
      this.products = products;
    });
  }

  addProduct() {
    if (this.newProduct.product.trim() !== "" && !isNaN(Number(this.newProduct.price))) {
      const tempId = Date.now();
      const tempProduct = { ...this.newProduct, id: tempId };

      // Optimistic update
      this.productService.addLocalProduct(tempProduct);
      this.productService.saveProductsToStorage(); // << NEW: save to localStorage

      this.productService.addProduct(this.newProduct).subscribe({
        next: (createdProduct: any) => {
          console.log("Products page added:", createdProduct);
          // Optionally, replace tempProduct with real createdProduct here
        },
        error: (err) => {
          console.error("Failed to add product:", err);
          this.productService.removeLocalProduct(tempId);
          this.productService.saveProductsToStorage(); // << NEW: update localStorage after removal
        },
      });

      this.modalService.closeModal();
      this.newProduct = { product: "", price: 0, barista: true };
    }
  }

  editProduct(product: any) {
    this.editingProduct = { ...product };
    this.modalService.openModal(this.editProductModal);
  }

  addModal() {
    this.modalService.openModal(this.addProductModal);
  }

  saveEditedProduct() {
    if (this.editingProduct) {
      console.log("drinks", this.editingProduct.id, this.editingProduct);
      this.productService.editProduct(this.editingProduct.id, this.editingProduct);
      this.modalService.closeModal();
      this.editingProduct = null;
    }
  }

  cancelForm() {
    this.clearForm();
    this.modalService.closeModal();
  }

  clearForm() {
    this.newProduct = { product: "", price: "", barista: true };
  }

  deleteProduct(productId: string) {
    if (confirm("Are you sure you want to delete this product?")) {
      this.productService.deleteProduct(productId);
    }
  }
}
