import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormsModule,
} from '@angular/forms';
import { BasketService } from '../../../services/basket-service';
import { CustomerService } from '../../../services/customer-service';
import { ConfigurationService } from '../../../services/configuration-service';
import { GetCharacteristicsByProductOffersResponse } from '../../../models/responses/getCharacteristicsByProductOfferResponse';
import { CreateAddressRequest } from '../../../models/requests/createAddressRequest';
import { CreatedAddressResponse } from '../../../models/responses/createdAddressResponse';

@Component({
  selector: 'app-configuration-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './configuration-product.html',
  styleUrls: ['./configuration-product.scss'],
})
export class ConfigurationProduct {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private basketApi = inject(BasketService);
  private customerApi = inject(CustomerService);
  private configurationApi = inject(ConfigurationService);

  billingAccountId: number | null = null;

  /* ==== signals ==== */
  loading = signal(false);
  error = signal<string | null>(null);
  productsData = signal<GetCharacteristicsByProductOffersResponse[]>([]);
  cities = signal<{ id: number; name: string }[]>([]);
  districts = signal<{ id: number; name: string }[]>([]);
  selectedServiceAddress = signal<{ id: number; displayText: string } | null>(null);

  form = this.fb.group({
    products: this.fb.array<FormGroup>([]),
  });
  get productsFA(): FormArray<FormGroup> {
    return this.form.get('products') as FormArray<FormGroup>;
  }

  /* ===== lifecycle ===== */
  ngOnInit() {
    this.route.queryParams.subscribe((p) => {
      this.billingAccountId = p['billingAccountId'] ? +p['billingAccountId'] : null;
    });

    this.loadCities();

    if (!this.billingAccountId) {
      this.error.set('Billing account is missing.');
      return;
    }

    this.loading.set(true);

    this.basketApi.getBasket(this.billingAccountId).subscribe({
      next: (basket) => {
        const productOfferIds = (basket?.basketItems ?? [])
          .map((i: any) => i.productOfferId)
          .filter((id: any) => id !== undefined && id !== null);

        if (!productOfferIds.length) {
          this.error.set('No product offers found in the basket.');
          this.loading.set(false);
          return;
        }

        this.fetchCharacteristics(productOfferIds);
      },
      error: () => {
        this.error.set('Basket could not be loaded.');
        this.loading.set(false);
      },
    });
  }

  /* ===== data fetchers ===== */
  private fetchCharacteristics(productOfferIds: number[]) {
    this.configurationApi.getCharacteristicsByProductOfferIds(productOfferIds).subscribe({
      next: (res: GetCharacteristicsByProductOffersResponse[]) => {
        this.productsData.set(res ?? []);
        this.seedForm(res ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Characteristics could not be loaded.');
        this.loading.set(false);
      },
    });
  }

  private seedForm(responses: GetCharacteristicsByProductOffersResponse[]) {
    this.productsFA.clear();

    responses.forEach((p) => {
      const charControls: Record<string, any> = {};
      p.characteristics.forEach((c) => {
        const ctrl = this.fb.control<string | null>(
          { value: null, disabled: !c.editable },
          c.editable ? [Validators.required] : []
        );
        charControls[c.id.toString()] = ctrl;
      });

      const group = this.fb.group({
        productOfferId: [p.productOfferId, Validators.required],
        characteristics: this.fb.group(charControls),
      });

      this.productsFA.push(group);
    });
  }

  /* ===== address dropdowns & modal ===== */
  loadCities() {
    this.customerApi.getCities().subscribe({
      next: (res) => this.cities.set(res ?? []),
      error: () => this.cities.set([]),
    });
  }

  onCityChange(cityId: number) {
    this.districts.set([]);
    if (!cityId) return;
    this.customerApi.getDistrictsByCityId(cityId).subscribe({
      next: (res) => this.districts.set(res ?? []),
      error: () => this.districts.set([]),
    });
  }

  openAddAddressModal() {
    (document.getElementById('addressModal') as HTMLDialogElement)?.showModal?.();
  }

  saveNewAddress(modalForm: {
    districtId: number;
    street: string;
    houseNumber: string;
    description: string;
  }) {
    const customerId = this.customerApi.state().id;
    if (!customerId) {
      this.error.set('Customer ID is missing.');
      return;
    }

    const req: CreateAddressRequest = {
      customerId,
      districtId: modalForm.districtId,
      street: modalForm.street,
      houseNumber: modalForm.houseNumber,
      description: modalForm.description,
    };

    this.customerApi.createAddress(req).subscribe({
      next: (res: CreatedAddressResponse) => {
        const addressText = [
          res.cityName,
          res.districtName,
          res.street ? `${res.street} No:${res.houseNumber}` : `No:${res.houseNumber}`,
          res.description,
        ]
          .filter(Boolean)
          .join(', ');

        this.selectedServiceAddress.set({
          id: res.id!,
          displayText: addressText,
        });
      },
      error: () => this.error.set('Address could not be created.'),
    });
  }

  closeAddressModal() {
    (document.getElementById('addressModal') as HTMLDialogElement)?.close?.();
  }

  /* ===== navigation ===== */
  goPrevious() {
    this.router.navigate(['/customers/update/${customerId}/offer-selection']);
  }

  goNext() {
    this.form.markAllAsTouched();
    if (!this.form.valid) {
      this.error.set('Please fill in all required fields.');
      return;
    }
    if (!this.selectedServiceAddress()) {
      this.error.set('Please add a service address.');
      return;
    }

    const payload = this.productsFA.controls.map((grp) => {
      const poId = grp.get('productOfferId')!.value as number;
      const charValuesGroup = grp.get('characteristics') as FormGroup;
      const characteristics = Object.entries(charValuesGroup.value).map(([charId, value]) => ({
        charId: +charId,
        value,
      }));
      return {
        productOfferId: poId,
        serviceAddressId: this.selectedServiceAddress()!.id,
        characteristics,
      };
    });

    console.log('✅ Payload:', payload);
  }
}
