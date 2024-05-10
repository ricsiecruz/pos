import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalReference: NgbModalRef | undefined;

  constructor(private modalService: NgbModal) {}

  closeModal(): void {
    if (this.modalReference) {
      this.modalReference.close();
    }
  }

  openModal(content: any): void {
    this.modalReference = this.modalService.open(content, { windowClass : "profile-status-modal"});
  }
}
