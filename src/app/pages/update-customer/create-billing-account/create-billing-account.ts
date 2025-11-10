import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../../services/customer-service';
import { GetCityResponse } from '../../../models/responses/getCityResponse';
import { GetDistrictResponse } from '../../../models/responses/getDistrictResponse';
import { CreateAddressRequest } from '../../../models/requests/createAddressRequest';
import { CreateBillingAccountRequest } from '../../../models/requests/createBillingAccountRequest';
import { CreatedAddressResponse } from '../../../models/responses/createdAddressResponse';

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

  // sadece en güncel adres tutulur
  tempAddress = signal<CreateAddressRequest | null>(null);
  createdAddress = signal<CreatedAddressResponse | null>(null);

  cities = signal<GetCityResponse[]>([]);
  districts = signal<GetDistrictResponse[]>([]);

  ngOnInit(): void {
    this.initializeForms();
    this.loadCities();
  }

  initializeForms(): void {
    this.accountForm = this.fb.group({
      accountName: ['', [Validators.required, Validators.minLength(2)]],
    });

    this.addressForm = this.fb.group({
      cityId: ['', Validators.required],
      districtId: ['', Validators.required],
      street: ['', Validators.required],
      houseNumber: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  // 🏙 Şehirleri getir
  loadCities(): void {
    this.customerService.getCities().subscribe({
      next: (res) => this.cities.set(res),
      error: (err) => console.error('Failed to load cities', err),
    });
  }

  // 🏘 Şehir seçilince ilçeleri getir
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
    this.showModal.set(true);
  }

  // 💾 "Save" sadece formu memory'de saklar, backend’e gitmez
  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const customerId = this.customerService.state().id;
    const newAddress: CreateAddressRequest = {
      customerId: customerId!,
      districtId: this.addressForm.value.districtId,
      street: this.addressForm.value.street,
      houseNumber: this.addressForm.value.houseNumber,
      description: this.addressForm.value.description,
    };

    // sadece state’de tut
    this.tempAddress.set(newAddress);
    this.createdAddress.set(null);
    this.showModal.set(false);

    console.log('Temporary address saved (not backend):', newAddress);
  }

  // ❌ Adresi sil
  deleteAddress(): void {
    this.tempAddress.set(null);
    this.createdAddress.set(null);
  }

  // 🧾 "Create" → önce adres oluşturur, sonra billing account
  onSubmit(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    const customerId = this.customerService.state().id!;
    const tempAddr = this.tempAddress();

    if (!tempAddr) {
      alert('Please add an address before creating the billing account.');
      return;
    }

    this.isLoading.set(true);

    // 1️⃣ önce adres isteği
    this.customerService.addAddress(tempAddr).subscribe({
      next: (res: CreatedAddressResponse) => {
        console.log('Address created on backend:', res);
        this.createdAddress.set(res);

        if (res.id == null) {
          console.error('Address ID is missing in response');
          this.isLoading.set(false);
          return;
        }

        // 2️⃣ sonra billing account isteği
        const request: CreateBillingAccountRequest = {
          type: 'INDIVIDUAL',
          status: 'ACTIVE',
          accountName: this.accountForm.value.accountName,
          customerId,
          addressId: res.id,
        };

        this.customerService.createBillingAccount(request).subscribe({
          next: () => {
            this.isLoading.set(false);
            console.log('Billing account created successfully');
            this.router.navigate([`/customers/update/${customerId}/update-billing-account`]);
          },
          error: (err) => {
            this.isLoading.set(false);
            console.error('Failed to create billing account', err);
          },
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Failed to create address', err);
      },
    });
  }

  onCancel(): void {
    const customerId = this.customerService.state().id;
    this.router.navigate([`/customers/update/${customerId}/update-billing-account`]);
  }
}
