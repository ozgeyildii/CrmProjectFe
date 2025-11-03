import {
  Component,
  Input,
  OnInit,
  OnChanges,
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
import { UpdateCustomerState, ContactMedium } from '../../../models/states/updateCustomerState';
import { CustomerService } from '../../../services/customer-service';
import { PopupComponent } from '../../../components/popup/popup';
import { UpdateContactMediumRequest } from '../../../models/requests/updateContactMediumRequest';

@Component({
  selector: 'app-update-contact-medium',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PopupComponent],
  templateUrl: './update-contact-medium.html',
  styleUrls: ['./update-contact-medium.scss']
})
export class UpdateContactMedium implements OnInit, OnChanges {
  @Input() customer!: UpdateCustomerState;

  form!: FormGroup;
  editMode = signal(false);
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
    console.log("ngOnInit çalıştı");
    console.log('Customer data loaded:', this.customerService.state());
    const data = this.customer || this.customerService.state() || {};
    console.log('Patching form with data:', data);
    this.patchFormFromState(data);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customer'] && this.customer) {
      this.patchFormFromState(this.customer);
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      homePhone: [''],
      mobilePhone: ['', Validators.required],
      fax: ['']
    });
  }

  private patchFormFromState(state: UpdateCustomerState): void {
    if (!state || !state.contactMediums) return;

    const email = state.contactMediums.find(m => m.type === 'EMAIL')?.value || '';
    const mobilePhone = state.contactMediums.find(m => m.type === 'PHONE')?.value || '';
    const homePhone = state.contactMediums.find(m => m.type === 'HOME_PHONE')?.value || '';
    const fax = state.contactMediums.find(m => m.type === 'FAX')?.value || '';

    console.log("contactMediums verileri:", state.contactMediums);
    this.customer = state;

    this.form.patchValue({email, homePhone, mobilePhone, fax });
  }

  toggleEdit(): void {
    this.editMode.set(true);
  }

  cancelEdit(): void {
    this.editMode.set(false);
    this.patchFormFromState(this.customerService.state()); // Eski veriye dön
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const currentState = this.customerService.state();

    console.log("Güncellenen form verileri:", currentState.contactMediums!.find(m => m.type === 'EMAIL')?.id);

    const updatedMediums: UpdateContactMediumRequest[] = [
      { id: currentState.contactMediums!.find(m => m.type === 'EMAIL')?.id!, customerId: this.customer.id!, type: 'EMAIL', value: this.form.value.email, isPrimary: true },
      { id: currentState.contactMediums!.find(m => m.type === 'PHONE')?.id!, customerId: this.customer.id!, type: 'PHONE', value: this.form.value.mobilePhone, isPrimary: true },
      { id: currentState.contactMediums!.find(m => m.type === 'HOME_PHONE')?.id!, customerId: this.customer.id!, type: 'HOME_PHONE', value: this.form.value.homePhone, isPrimary: false },
      { id: currentState.contactMediums!.find(m => m.type === 'FAX')?.id!, customerId: this.customer.id!, type: 'FAX', value: this.form.value.fax, isPrimary: false }
    ].filter(m => m.value && m.value.trim() !== '');

    const updatedCustomer: UpdateCustomerState = {
      ...currentState,
      contactMediums: updatedMediums
    };

    this.isSaving.set(true);

    console.log("Güncellenen iletişim bilgileri:", updatedMediums);

    this.customerService.updateMultipleContactMediums(updatedMediums).subscribe({
      next: () => {
        this.customerService.state.set(updatedCustomer);
        this.isSaving.set(false);
        this.editMode.set(false);
        this.title.set('Success');
        this.successMessage.set('Contact information updated successfully.');
        this.errorMessage.set(null);
      },
      error: () => {
        this.isSaving.set(false);
        this.successMessage.set(null);
        this.title.set('Error');
        this.errorMessage.set('An error occurred while updating contact information.');
      }
    });
  }

  closePopup(): void {
    this.title.set(null);
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }
}
