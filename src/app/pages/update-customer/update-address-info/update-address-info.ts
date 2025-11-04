import {
  Component,
  Input,
  SimpleChanges,
  signal
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../services/customer-service';
import { UpdateCustomerState, Address } from '../../../models/states/updateCustomerState';
import { PopupComponent } from '../../../components/popup/popup';
import { UpdateAddressRequest } from '../../../models/requests/updateAddressRequest';
import { UpdatedAddressResponse } from '../../../models/responses/updatedAddressResponse';

@Component({
  selector: 'app-update-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PopupComponent],
  templateUrl: './update-address-info.html',
  styleUrls: ['./update-address-info.scss']
})
export class UpdateAddressInfo {
  @Input() customer!: UpdateCustomerState;

  addresses: Address[] = [];
  selectedAddress: Address | null = null;

  form!: FormGroup;
  editMode = signal(false);
  addMode = signal(false);
  isSaving = signal(false);

  title = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    const state = this.customerService.state();
    this.addresses = state.addresses || [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customer'] && this.customer) {
      this.addresses = this.customer.addresses || [];
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      city: ['', Validators.required],
      district: ['', Validators.required],
      street: ['', Validators.required],
      houseNumber: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  onAddNew(): void {
    this.addMode.set(true);
    this.editMode.set(true);
    this.selectedAddress = null;
    this.form.reset();
  }

  onEdit(address: Address): void {
    this.selectedAddress = address;
    this.form.patchValue({
      city: address.cityName,
      district: address.districtName,
      street: address.street,
      houseNumber: address.houseNumber,
      description: address.description
    });
    this.addMode.set(false);
    this.editMode.set(true);
  }

  onDelete(address: Address): void {
    if (this.addresses.length === 1 || !address.id) return;

    this.customerService.deleteAddress(address.id!).subscribe({
      next: () => {
        this.addresses = this.addresses.filter(a => a.id !== address.id);
        this.customerService.state.set({
          ...this.customerService.state(),
          addresses: this.addresses
        });
        this.successMessage.set('Address deleted successfully.');
        this.errorMessage.set(null);
      },
      error: () => {
        this.errorMessage.set('Error deleting address.');
      }
    });
  }

  onSetPrimary(address: Address): void {
    if (!address.id) return;

    // Sadece bir tane primary olacak
    this.addresses.forEach(a => (a.isDefault = false));
    address.isDefault = true;

    this.customerService.updatePrimaryAddress(address.id!).subscribe({
      next: () => {
        this.successMessage.set('Primary address updated.');
        this.customerService.state.set({
          ...this.customerService.state(),
          addresses: this.addresses
        });
      },
      error: () => {
        this.errorMessage.set('Error updating primary address.');
      }
    });
  }

  onCancel(): void {
    this.editMode.set(false);
    this.addMode.set(false);
    this.selectedAddress = null;
    this.form.reset();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const req: UpdateAddressRequest = {
      id: this.selectedAddress ? this.selectedAddress.id! : 0,
      customerId: this.customer?.id ?? '', // UUID string
      city: this.form.value.city,
      district: this.form.value.district,
      street: this.form.value.street,
      houseNumber: this.form.value.houseNumber,
      description: this.form.value.description
    };

    this.isSaving.set(true);

    const request$ = this.addMode()
      ? this.customerService.createAddress(req)
      : this.customerService.updateAddress(req);

    request$.subscribe({
      next: (res: UpdatedAddressResponse) => {
        if (this.addMode()) {
          this.addresses.push({
            ...res,
            isDefault: false,
            customerId: this.customer.id!
          });
        } else if (this.selectedAddress?.id) {
          const idx = this.addresses.findIndex(a => a.id === this.selectedAddress!.id);
          if (idx !== -1)
            this.addresses[idx] = { ...this.addresses[idx], ...res };
        }

        this.customerService.state.set({
          ...this.customerService.state(),
          addresses: this.addresses
        });

        this.isSaving.set(false);
        this.editMode.set(false);
        this.addMode.set(false);
        this.title.set('Success');
        this.successMessage.set('Address updated successfully.');
      },
      error: () => {
        this.isSaving.set(false);
        this.title.set('Error');
        this.errorMessage.set('An error occurred while saving the address.');
      }
    });
  }

  closePopup(): void {
    this.title.set(null);
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }
}
