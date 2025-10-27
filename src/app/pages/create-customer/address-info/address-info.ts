import { Component, OnInit, signal, effect } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CreateCustomerService } from '../../../services/create-customer-service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-address-info',
 imports: [CommonModule,RouterLink,FormsModule,ReactiveFormsModule],
   templateUrl: './address-info.html',
  styleUrls: ['./address-info.scss'],
})
export class AddressInfo implements OnInit {
  addressForm!: FormGroup;
  addresses = signal<any[]>([]);
  showForm = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private customerService: CreateCustomerService
  ) {
    // Debug için state’i console’da izleyelim
    effect(() => {
      console.log('📦 Address list changed:', this.addresses());
      console.log('📦 Customer state:', this.customerService.state());
    });
  }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    this.addressForm = this.fb.group({
      city: ['', [Validators.required, Validators.maxLength(20)]],
      district: ['', [Validators.required, Validators.maxLength(20)]],
      street: ['', [Validators.required, Validators.maxLength(20)]],
      houseNumber: ['', [Validators.required, Validators.maxLength(10)]],
      description: ['', [Validators.required, Validators.maxLength(250)]],
      isPrimary: [false],
    });
  }

  onAddNewAddress(): void {
    this.showForm.set(true);
  }

  onSave(): void {
    if (this.addressForm.valid) {
      const newAddress = { ...this.addressForm.value };

      // Eğer ilk adresse giriliyorsa primary yap
      if (this.addresses().length === 0) {
        newAddress.isPrimary = true;
      }

      this.addresses.update((prev) => [...prev, newAddress]);
      this.showForm.set(false);
      this.addressForm.reset();

      // Customer state’e adresleri kaydet
      this.customerService.state.update((prev) => ({
        ...prev,
        addresses: this.addresses(),
      }));
    }
  }

  onSelectPrimary(index: number): void {
    this.addresses.update((list) =>
      list.map((a, i) => ({ ...a, isPrimary: i === index }))
    );

    this.customerService.state.update((prev) => ({
      ...prev,
      addresses: this.addresses(),
    }));
  }

  onCancel(): void {
    this.router.navigate(['/customers/search']);
  }

  // "Previous" sadece router ile geri gider, state’i etkilemez
  onPrevious(): void {
    this.router.navigate(['/customers/create/personal-info']);
  }

  onNext(): void {
    if (this.addresses().length > 0) {
      this.router.navigate(['/customers/create/contact-medium']);
    }
  }
}
