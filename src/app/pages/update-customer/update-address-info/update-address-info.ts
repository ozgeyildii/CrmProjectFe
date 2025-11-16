import { Component, Input, SimpleChanges, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../services/customer-service';
import { UpdateCustomerState, Address } from '../../../models/states/updateCustomerState';
import { PopupComponent } from '../../../components/popup/popup';
import { UpdateAddressRequest } from '../../../models/requests/updateAddressRequest';
import { UpdatedAddressResponse } from '../../../models/responses/updatedAddressResponse';
import { CreateAddressRequest } from '../../../models/requests/createAddressRequest';
import { CreatedAddressResponse } from '../../../models/responses/createdAddressResponse';

@Component({
  selector: 'app-update-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PopupComponent],
  templateUrl: './update-address-info.html',
  styleUrls: ['./update-address-info.scss'],
})
export class UpdateAddressInfo {
  @Input() customer!: UpdateCustomerState;

  addresses: Address[] = [];
  selectedAddress: Address | null = null;

  cities: any[] = [];
  districts: any[] = [];
  isLoadingDistricts = signal(false); // Yükleme durumu eklendi

  form!: FormGroup;
  editMode = signal(false);
  addMode = signal(false);
  isSaving = signal(false);

  title = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor(private fb: FormBuilder, private customerService: CustomerService) {}

  ngOnInit(): void {
    this.buildForm();
    const state = this.customerService.state();
    this.addresses = state.addresses || [];

    this.loadCities();

    // ✅ Açılışta default adres varsa toggle açık olacak
    this.syncPrimaryToggle();

    this.form.get('cityId')?.valueChanges.subscribe((cityId) => {
      if (cityId) {
        this.loadDistricts(cityId);
      } else {
        this.districts = [];
        this.isLoadingDistricts.set(false);
        this.form.get('districtId')?.setValue('');
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customer'] && this.customer) {
      this.addresses = this.customer.addresses || [];
      this.syncPrimaryToggle();
    }
  }

  private syncPrimaryToggle(): void {
    const primary = this.addresses.find((a) => a.isDefault);
    if (primary) {
      this.addresses.forEach((a) => (a.isDefault = a.id === primary.id));
    }
    if (this.addresses.length === 1) {
      this.addresses[0].isDefault = true;
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      cityId: ['', Validators.required],
      districtId: ['', Validators.required],
      street: ['', Validators.required],
      houseNumber: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  onAddNew(): void {
    this.addMode.set(true);
    this.editMode.set(true);
    this.selectedAddress = null;
    this.districts = []; // District'leri temizle
    this.isLoadingDistricts.set(false);
    this.form.reset();
    this.form.get('districtId')?.setValue(''); // District'i açıkça temizle
  }

  onEdit(address: Address): void {
    this.selectedAddress = address;
    this.addMode.set(false);
    this.editMode.set(true);

    this.form.get('cityId')?.setValue(address.cityId ?? '');

    if (address.cityId) {
      // Önce district'leri yükle, sonra formu doldur
      this.isLoadingDistricts.set(true);
      this.customerService.getDistrictsByCityId(address.cityId).subscribe({
        next: (data) => {
          this.districts = data;
          this.isLoadingDistricts.set(false);
          
          // District'ler yüklendikten sonra formu doldur
          this.form.patchValue({
            districtId: address.districtId,
            street: address.street,
            houseNumber: address.houseNumber,
            description: address.description,
          });
        },
        error: () => {
          this.isLoadingDistricts.set(false);
          this.errorMessage.set('Error loading districts.');
        }
      });
    }
  }

  onDelete(address: Address): void {
    if (this.addresses.length === 1 || !address.id) return;

    this.customerService.deleteAddress(address.id!).subscribe({
      next: () => {
        this.refreshAddresses();
        this.successMessage.set('Address deleted successfully.');
        this.errorMessage.set(null);
      },
      error: (err) => {
        if (err?.error?.title === 'Business Rule Violation') {
          this.errorMessage.set(err.error.detail);
        } else {
          this.errorMessage.set('Error updating primary address.');
        }
      },
    });
  }

  onSetPrimary(address: Address): void {
    if (!address.id) return;

    // Tüm adreslerin toggle'ını kapat, seçileni aç
    this.addresses.forEach((a) => (a.isDefault = false));
    address.isDefault = true;

    const selectedId = address.id; // 🔹 Seçilen adresi hatırla

    this.customerService.updatePrimaryAddress(address.id!).subscribe({
      next: () => {
        this.successMessage.set('Primary address updated.');
        this.refreshAddresses(true, selectedId); // ✅ toggle senkronizasyonu için id gönder
      },
      error: () => {
        this.errorMessage.set('Error updating primary address.');
      },
    });
  }

  private refreshAddresses(preservePrimary: boolean = false, selectedId?: number): void {
    const customerId = this.customerService.state().id;
    if (!customerId) return;

    this.customerService.getAddressesByCustomerId(customerId).subscribe({
      next: (data) => {
        this.addresses = data;

        // 🔸 Sadece backend'den gelen "isDefault: true" olanları açık göster
        const primary = this.addresses.find((a) => a.isDefault);
        if (primary) {
          this.addresses.forEach((a) => (a.isDefault = a.id === primary.id));
        }

        // (Opsiyonel) sadece 1 adres varsa toggle'ı aktif ve disabled yap
        if (this.addresses.length === 1) {
          this.addresses[0].isDefault = true;
        }

        // 🔹 customerService state'ini güncelle
        this.customerService.state.set({
          ...this.customerService.state(),
          addresses: this.addresses,
        });
      },
      error: () => {
        this.errorMessage.set('Error refreshing addresses.');
      },
    });
  }

  loadCities(): void {
    this.customerService.getCities().subscribe({
      next: (data) => {
        this.cities = data;
      },
      error: () => {
        this.errorMessage.set('Error loading cities.');
      },
    });
  }

  loadDistricts(cityId: number): void {
    this.isLoadingDistricts.set(true);
    this.districts = []; // Önce temizle
    this.form.get('districtId')?.setValue(''); // District değerini temizle
    
    this.customerService.getDistrictsByCityId(cityId).subscribe({
      next: (data) => {
        this.districts = data;
        this.isLoadingDistricts.set(false);
      },
      error: () => {
        this.isLoadingDistricts.set(false);
        this.errorMessage.set('Error loading districts.');
      },
    });
  }

  onCancel(): void {
    this.editMode.set(false);
    this.addMode.set(false);
    this.selectedAddress = null;
    this.form.reset();
    this.districts = [];
    this.isLoadingDistricts.set(false);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    if (this.addMode()) {
      const createReq: CreateAddressRequest = {
        customerId: this.customerService.state().id ?? '',
        districtId: this.form.value.districtId,
        street: this.form.value.street,
        houseNumber: this.form.value.houseNumber,
        description: this.form.value.description,
      };

      this.customerService.createAddress(createReq).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.editMode.set(false);
          this.addMode.set(false);
          this.refreshAddresses(); // ✅ sadece güncelleme yapılır
          this.title.set('Success');
          this.successMessage.set('Address created successfully.');
        },
        error: () => {
          this.isSaving.set(false);
          this.title.set('Error');
          this.errorMessage.set('An error occurred while creating the address.');
        },
      });
    } else {
      const updateReq: UpdateAddressRequest = {
        id: this.selectedAddress ? this.selectedAddress.id! : 0,
        customerId: this.customerService.state().id ?? '',
        districtId: this.form.value.districtId,
        street: this.form.value.street,
        houseNumber: this.form.value.houseNumber,
        description: this.form.value.description,
      };

      this.customerService.updateAddress(updateReq).subscribe({
        next: (res: UpdatedAddressResponse) => {
          this.isSaving.set(false);
          this.editMode.set(false);
          this.addMode.set(false);
          this.refreshAddresses();
          this.title.set('Success');
          this.successMessage.set('Address updated successfully.');
        },
        error: () => {
          this.isSaving.set(false);
          this.title.set('Error');
          this.errorMessage.set('An error occurred while saving the address.');
        },
      });
    }
  }

  closePopup(): void {
    this.title.set(null);
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }
}