import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../../services/customer-service';
import { GetCityResponse } from '../../../models/responses/getCityResponse';
import { GetDistrictResponse } from '../../../models/responses/getDistrictResponse';
import { CreateAddressRequest } from '../../../models/requests/createAddressRequest';
import { CreatedAddressResponse } from '../../../models/responses/createdAddressResponse';
import { CreateBillingAccountRequest } from '../../../models/requests/createBillingAccountRequest';

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

  showModal = signal(false);
  isLoading = signal(false);

  tempAddress = signal<CreateAddressRequest | null>(null);
  tempAddressDetailed = signal<any | null>(null);

  cities = signal<GetCityResponse[]>([]);
  districts = signal<GetDistrictResponse[]>([]);

  ngOnInit(): void {
    this.initForms();
    this.loadCities();
  }

  initForms() {
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

  loadCities() {
    this.customerService.getCities().subscribe((res) => this.cities.set(res));
  }

  onCityChange() {
    const cityId = this.addressForm.value.cityId;
    this.customerService.getDistrictsByCityId(cityId).subscribe((res) => this.districts.set(res));
  }

  openModalForNew() {
    this.addressForm.reset();
    this.showModal.set(true);
  }

  deleteAddress() {
    this.tempAddress.set(null);
    this.tempAddressDetailed.set(null);
  }

  // Only 1 address — override behavior
  saveAddress() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const city = this.cities().find(c => c.id === +this.addressForm.value.cityId);
    const district = this.districts().find(d => d.id === +this.addressForm.value.districtId);

    const req: CreateAddressRequest = {
      customerId: this.customerService.state().id!,
      districtId: +this.addressForm.value.districtId,
      street: this.addressForm.value.street,
      houseNumber: this.addressForm.value.houseNumber,
      description: this.addressForm.value.description,
    };

    // override old one — always 1 address
    this.tempAddress.set(req);

    this.tempAddressDetailed.set({
      cityName: city?.name,
      districtName: district?.name,
      street: req.street,
      houseNumber: req.houseNumber,
      description: req.description,
    });

    this.showModal.set(false);
  }

  onSubmit() {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    if (!this.tempAddress()) {
      alert('Please add an address.');
      return;
    }

    this.isLoading.set(true);

    // First create address
    this.customerService.addAddress(this.tempAddress()!).subscribe({
      next: (addrRes) => {
        const req: CreateBillingAccountRequest = {
          type: 'INDIVIDUAL',
          status: 'ACTIVE',
          accountName: this.accountForm.value.accountName,
          customerId: this.customerService.state().id!,
          addressId: addrRes.id!,
        };

        this.customerService.createBillingAccount(req).subscribe({
          next: () => {
            this.isLoading.set(false);
            const cid = this.customerService.state().id!;
            this.router.navigate([`/customers/update/${cid}/update-billing-account`]);
          },
          error: () => this.isLoading.set(false),
        });
      },
      error: () => this.isLoading.set(false),
    });
  }

  onCancel() {
    const customerId = this.customerService.state().id;
    this.router.navigate([`/customers/update/${customerId}/update-billing-account`]);
  }
}
