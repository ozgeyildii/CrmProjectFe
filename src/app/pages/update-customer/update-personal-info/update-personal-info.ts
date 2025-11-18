import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  signal,
  effect,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UpdateCustomerState } from '../../../models/states/updateCustomerState';
import { CustomerService } from '../../../services/customer-service';
import { PopupComponent } from '../../../components/popup/popup';
import { UpdatePersonalInfoRequest } from '../../../models/requests/updatePersonalInfoRequest';
 
@Component({
  selector: 'app-update-personal-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PopupComponent],
  templateUrl: './update-personal-info.html',
  styleUrls: ['./update-personal-info.scss'],
})
export class UpdatePersonalInfo implements OnInit, OnChanges {
  @Input() customer!: UpdateCustomerState;
 
  form!: FormGroup;
  today = new Date().toISOString().split('T')[0];
 
  editMode = signal(false);
  isSaving = signal(false);
 
  title = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
 
  customerWatcher = effect(() => {
    const customer = this.customerService.state();
    if (!customer || Object.keys(customer).length === 0) return;
 
    this.loadCustomerData();
  });
 
  constructor(private fb: FormBuilder, public customerService: CustomerService) {}
 
  ngOnInit(): void {
    this.buildForm();
    this.loadCustomerData();
    this.disableEditableFields(); // Başlangıçta disable yap
    this.watchDateValidation();
  }
 
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customer'] && this.form) {
      this.loadCustomerData();
    }
  }
 
  private buildForm(): void {
    this.form = this.fb.group({
      accountNumber: [{ value: '-', disabled: true }],
      customerNumber: [{ value: '', disabled: true }],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      nationalId: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      dateOfBirth: ['', [Validators.required, this.minimumAgeValidator(18)]],
      gender: ['', Validators.required],
      motherName: [''],
      fatherName: [''],
    });
  }
 
  private disableEditableFields(): void {
    this.form.get('firstName')?.disable();
    this.form.get('lastName')?.disable();
    this.form.get('nationalId')?.disable();
    this.form.get('dateOfBirth')?.disable();
    this.form.get('gender')?.disable();
    this.form.get('motherName')?.disable();
    this.form.get('fatherName')?.disable();
  }
 
  private enableEditableFields(): void {
    this.form.get('firstName')?.enable();
    this.form.get('lastName')?.enable();
    this.form.get('nationalId')?.enable();
    this.form.get('dateOfBirth')?.enable();
    this.form.get('gender')?.enable();
    this.form.get('motherName')?.enable();
    this.form.get('fatherName')?.enable();
  }
 
  private watchDateValidation(): void {
    const dateControl = this.form.get('dateOfBirth');
    const today = this.today;
    dateControl?.valueChanges.subscribe((value) => {
      if (value && value > today) {
        dateControl.setErrors({ futureDate: true });
      } else if (dateControl?.hasError('futureDate')) {
        dateControl.setErrors(null);
      }
    });
  }
 
  private loadCustomerData(): void {
  const source = (this.customer && Object.keys(this.customer).length > 0)
    ? this.customer
    : this.customerService.state();
 
 
  const data = source || {};
  this.form.patchValue({
    accountNumber:
      data.billingAccounts && data.billingAccounts.length > 0
        ? data.billingAccounts[0].accountNumber
        : '',
    customerNumber: data.customerNumber ?? '',
    firstName: data.firstName ?? '',
    middleName: data.middleName ?? '',
    lastName: data.lastName ?? '',
    nationalId: data.nationalId ?? '',
    dateOfBirth: this.formatDate(data.dateOfBirth),
    gender: data.gender ?? '',
    motherName: data.motherName ?? '',
    fatherName: data.fatherName ?? '',
  });
}
 
 
  private formatDate(date?: string): string {
    if (!date) return '';
    return date.includes('T') ? date.substring(0, 10) : date;
  }
 
  private minimumAgeValidator(minAge: number) {
    return (control: any) => {
      if (!control.value) return null;
      const today = new Date();
      const birthDate = new Date(control.value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      const actualAge =
        m < 0 || (m === 0 && today.getDate() < birthDate.getDate())
          ? age - 1
          : age;
      return actualAge < minAge ? { underage: true } : null;
    };
  }
 
  getErrorMessage(controlName: string): string {
  const control = this.form.get(controlName);
  if (!control || !control.errors) return '';
 
  if (control.errors['required']) {
    return 'This field is required.';
  }
 
  if (control.errors['minlength']) {
    return `Minimum ${control.errors['minlength'].requiredLength} characters required.`;
  }
 
  if (control.errors['maxlength']) {
    return `Maximum ${control.errors['maxlength'].requiredLength} characters allowed.`;
  }
 
  if (control.errors['pattern']) {
    return 'Invalid format.';
  }
 
  if (control.errors['futureDate']) {
    return 'Date of Birth cannot be in the future.';
  }
 
  if (control.errors['underage']) {
    return 'You must be at least 18 years old.';
  }
 
  return 'Invalid field.';
}
 
 
  toggleEdit(): void {
    this.editMode.set(true);
    this.enableEditableFields();
  }
 
  cancelEdit(): void {
    this.editMode.set(false);
    this.disableEditableFields();
    this.loadCustomerData();
  }
 
  isInvalid(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
 
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
 
    const updated: UpdatePersonalInfoRequest = {
      ...this.customerService.state(),
      ...this.form.getRawValue(),
    };
 
    this.isSaving.set(true);
 
    this.customerService.updateCustomer(updated).subscribe({
      next: () => {
        this.customerService.state.set(updated);
        this.isSaving.set(false);
        this.editMode.set(false);
        this.disableEditableFields();
 
        this.title.set('Success');
        this.successMessage.set('Customer updated successfully.');
        this.errorMessage.set(null);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.successMessage.set(null);
        if (err.status === 409) {
          this.title.set('Duplicate National ID');
          this.errorMessage.set('A customer already exists with this Nationality ID.');
        } else {
          this.title.set('Update Failed');
          this.errorMessage.set('An error occurred while updating.');
        }
      },
    });
  }
 
  onDelete(): void {
    this.title.set('Warning');
    this.errorMessage.set('Are you sure to delete this customer?');
    this.successMessage.set(null);
  }
 
  confirmDelete(): void {
    const id = this.form.get('id')?.value;
    if (!id) return;
    this.customerService.deleteCustomer(id).subscribe({
      next: () => {
        this.title.set('Deleted');
        this.successMessage.set('Customer deleted successfully.');
        this.errorMessage.set(null);
      },
      error: () => {
        this.successMessage.set(null);
        this.title.set('Error');
        this.errorMessage.set('Error deleting customer.');
      },
    });
  }
 
  closePopup(): void {
    if (this.errorMessage() === 'Are you sure to delete this customer?') {
      this.confirmDelete();
    } else {
      this.title.set(null);
      this.errorMessage.set(null);
      this.successMessage.set(null);
    }
  }
}