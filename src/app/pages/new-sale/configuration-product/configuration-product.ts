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
import { CreateOrderRequest } from '../../../models/requests/createOrderRequest';
import { OrderService } from '@/src/app/services/order-service';

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
  private basketService = inject(BasketService);
  private customerService = inject(CustomerService);
  private configurationService = inject(ConfigurationService);
  private orderService = inject(OrderService);

  billingAccountId: number | null = null;

  loading = signal(false);
  error = signal<string | null>(null);
  productsData = signal<GetCharacteristicsByProductOffersResponse[]>([]);
  cities = signal<{ id: number; name: string }[]>([]);
  districts = signal<{ id: number; name: string }[]>([]);

  addresses = signal<{ id: number; displayText: string }[]>([]);

  selectedServiceAddress = signal<{ id: number; displayText: string } | null>(null);

  form = this.fb.group({
    products: this.fb.array<FormGroup>([]),
  });

  get productsFA(): FormArray<FormGroup> {
    return this.form.get('products') as FormArray<FormGroup>;
  }

  ngOnInit() {
    this.route.queryParams.subscribe((p) => {
      this.billingAccountId = p['billingAccountId'] ? +p['billingAccountId'] : null;
    });

    const customerId = this.customerService.state().id;
    if (customerId) {
      this.loadAddresses(customerId); // mevcut adresleri çek
    }

    this.loadCities();

    if (!this.billingAccountId) {
      this.error.set('Billing account is missing.');
      return;
    }

    this.loading.set(true);

    this.basketService.getBasket(this.billingAccountId).subscribe({
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

  private loadAddresses(customerId: string) {
    this.customerService.getAddressesByCustomerId(customerId).subscribe({
      next: (res) => {
        const list = (res ?? []).map((a: any) => {
          const text = [
            a.cityName,
            a.districtName,
            a.street ? `${a.street} No:${a.houseNumber}` : `No:${a.houseNumber}`,
            a.description,
          ]
            .filter(Boolean)
            .join(', ');

          return { id: a.id, displayText: text };
        });

        this.addresses.set(list);
      },
      error: () => this.addresses.set([]),
    });
  }

  private fetchCharacteristics(productOfferIds: number[]) {
    this.configurationService.getCharacteristicsByProductOfferIds(productOfferIds).subscribe({
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

  loadCities() {
    this.customerService.getCities().subscribe({
      next: (res) => this.cities.set(res ?? []),
      error: () => this.cities.set([]),
    });
  }

  onCityChange(cityId: number) {
    this.districts.set([]);
    if (!cityId) return;
    this.customerService.getDistrictsByCityId(cityId).subscribe({
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
    const customerId = this.customerService.state().id;
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

    this.customerService.createAddress(req).subscribe({
      next: (res: CreatedAddressResponse) => {
        const text = [
          res.cityName,
          res.districtName,
          res.street ? `${res.street} No:${res.houseNumber}` : `No:${res.houseNumber}`,
          res.description,
        ]
          .filter(Boolean)
          .join(', ');

        this.addresses.set([...this.addresses(), { id: res.id!, displayText: text }]);

        this.selectedServiceAddress.set({ id: res.id!, displayText: text });

        this.closeAddressModal();
      },
      error: () => this.error.set('Address could not be created.'),
    });
  }

  closeAddressModal() {
    const modal = document.getElementById('addressModal') as HTMLDialogElement;
    if (modal) modal.close();
  }

  goPrevious() {
    const customerId = this.customerService.state().id;
    this.router.navigate([`/customers/update/${customerId}/offer-selection`], {
      queryParams: { billingAccountId: this.billingAccountId },
    });
  }

  findCharacteristicName(productOfferId: number, charId: number): string {
    const prod = this.productsData().find((p) => p.productOfferId === productOfferId);
    if (!prod) return '';

    const char = prod.characteristics.find((c) => c.id === charId);
    return char?.name ?? '';
  }

  goNext() {
    this.form.markAllAsTouched();

    if (!this.form.valid) {
      this.error.set('Please fill in all required fields.');
      return;
    }

    if (!this.selectedServiceAddress()) {
      this.error.set('Please select a service address.');
      return;
    }

    const basketItems = this.basketService.basket().basketItems;

    const productConfigs = this.productsFA.controls.map((group: FormGroup) => {
      const productOfferId = group.get('productOfferId')!.value as number;
      const characteristicsGroup = group.get('characteristics') as FormGroup;

      const charValues = Object.entries(characteristicsGroup.value).map(([charId, charValue]) => ({
        charId: Number(charId),
        value: charValue,
      }));

      return {
        productOfferId,
        charValues,
      };
    });

    const orderItems = productConfigs.flatMap((config) => {
      const matchedBasketItems = basketItems.filter(
        (item) => item.productOfferId === config.productOfferId
      );

      return matchedBasketItems.map((item) => ({
        basketItemId: item.basketItemId,
        charValues: config.charValues.map((char) => ({
          characteristicName: String(
            this.findCharacteristicName(config.productOfferId, char.charId)
          ),
          characteristicValue: String(char.value),
        })),
      }));
    });

    const request: CreateOrderRequest = {
      billingAccountId: this.billingAccountId!,
      items: orderItems,
      addressId: this.selectedServiceAddress()?.id!,
    };

    this.configurationService.createOrder(request).subscribe({
      next: (res) => {
        this.orderService.orderState.set(res);
        const customerId = this.customerService.state().id;

        this.router.navigate([`/customers/update/${customerId}/submit-order`], {
          queryParams: { billingAccountId: this.billingAccountId },
        });
      },
      error: (err) => {
        console.error('Order creation failed:', err);
        this.error.set('Order could not be created. Please try again.');
      },
    });
  }
}
