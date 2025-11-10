import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../../services/customer-service';
import { GetCityResponse } from '../../../models/responses/getCityResponse';
import { GetDistrictResponse } from '../../../models/responses/getDistrictResponse';
 
@Component({
  selector: 'app-create-billing-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-billing-account.html',
  styleUrls: ['./create-billing-account.scss'],
})
export class CreateBillingAccount implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private customerService = inject(CustomerService);
 
  accountForm!: FormGroup;
  addressForm!: FormGroup;
 
  isLoading = signal(false);
  showModal = signal(false);
  editingIndex = signal<number | null>(null);
 
  cities = signal<GetCityResponse[]>([]);
  districts = signal<GetDistrictResponse[]>([]);
  addresses = signal<any[]>([]);
 
  ngOnInit(): void {
    this.initForms();
    this.loadCities();
  }
 
  initForms(): void {
    this.accountForm = this.fb.group({
      accountName: ['', [Validators.required, Validators.minLength(2)]],
      accountDescription: [''],
    });
 
    this.addressForm = this.fb.group({
      cityId: ['', Validators.required],
      districtId: ['', Validators.required],
      flatNumber: ['', Validators.required],
      street: ['', Validators.required],
      addressDescription: ['', Validators.required],
    });
  }
 
  // 🏙 Şehirleri backend'den al
  loadCities(): void {
    this.customerService.getCities().subscribe({
      next: (res) => this.cities.set(res),
      error: (err) => console.error('Failed to load cities', err),
    });
  }
 
  // 🏘 Şehir değiştiğinde ilçeleri al
  onCityChange(): void {
    const cityId = this.addressForm.get('cityId')?.value;
    if (!cityId) {
      this.districts.set([]);
      return;
    }
 
    this.customerService.getDistrictsByCityId(cityId).subscribe({
      next: (res) => this.districts.set(res),
      error: (err) => console.error('Failed to load districts', err),
    });
 
    this.addressForm.get('districtId')?.reset();
  }
 
  // ➕ Yeni adres formunu aç
  openModalForNew(): void {
    this.addressForm.reset();
    this.editingIndex.set(null);
    this.showModal.set(true);
  }
 
  // ✏️ Adresi düzenle
  editAddress(index: number): void {
    this.addressForm.patchValue(this.addresses()[index]);
    this.editingIndex.set(index);
    this.showModal.set(true);
  }
 
  // 💾 Adresi kaydet (frontend + backend)
  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }
 
    const addressData = this.addressForm.value;
 
    this.isLoading.set(true);
    this.customerService.addAddress(addressData).subscribe({
      next: (savedAddress) => {
        // frontend list güncellemesi
        if (this.editingIndex() !== null) {
          const updated = [...this.addresses()];
          updated[this.editingIndex()!] = savedAddress;
          this.addresses.set(updated);
        } else {
          this.addresses.update((list) => [...list, savedAddress]);
        }
 
        this.isLoading.set(false);
        this.showModal.set(false);
        this.addressForm.reset();
        this.editingIndex.set(null);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Failed to save address', err);
      },
    });
  }
 
  // ❌ Adres sil
  deleteAddress(index: number): void {
    this.addresses.update((list) => list.filter((_, i) => i !== index));
  }
 
  // 🧾 Billing account oluştur
  onSubmit(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }
 
    const customerId = this.customerService.state().id;
    const request = {
      ...this.accountForm.value,
      customerId,
      addresses: this.addresses(),
    };
 
    this.isLoading.set(true);
 
    this.customerService.createBillingAccount(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        console.log('Billing account created successfully');
        this.router.navigate([
          `/customers/update/${customerId}/update-billing-account`,
        ]);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Failed to create billing account', err);
      },
    });
  }
 
  onCancel(): void {
    const customerId = this.customerService.state().id;
    this.router.navigate([
      `/customers/update/${customerId}/update-billing-account`,
    ]);
  }
}