import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  signal,
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

@Component({
  selector: 'app-update-personal-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PopupComponent],
  templateUrl: './update-personal-info.html',
  styleUrls: ['./update-personal-info.scss'],
})
export class UpdatePersonalInfo implements OnInit, OnChanges {
  @Input() customer!: UpdateCustomerState;
  @Output() save = new EventEmitter<UpdateCustomerState>();
  @Output() delete = new EventEmitter<void>();

  form!: FormGroup;
  today = new Date().toISOString().split('T')[0];

  editMode = signal(false);
  isSaving = signal(false);

  title = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor(private fb: FormBuilder, public customerService: CustomerService) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCustomerData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customer'] && this.form) {
      this.loadCustomerData();
    }
  }

  /** ✅ Form oluştur */
  buildForm(): void {
    this.form = this.fb.group({
      id: [''],
      customerNumber: [''],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      nationalId: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      motherName: [''],
      fatherName: [''],
    });
  }

  /** ✅ Veriyi state veya @Input üzerinden doldur */
  private loadCustomerData(): void {
    const data = this.customer || this.customerService.state() || {};

    this.form.patchValue({
      id: data.id ?? '',
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

  /** ✅ Tarih formatı düzelt */
  private formatDate(date?: string): string {
    if (!date) return '';
    return date.includes('T') ? date.substring(0, 10) : date;
  }

  isInvalid(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  getErrorMessage(control: string): string {
    const c = this.form.get(control);
    if (!c?.errors) return '';
    if (c.errors['required']) return 'This field is required.';
    if (c.errors['pattern']) return 'National ID must be 11 digits.';
    return 'Invalid field.';
  }

  toggleEdit(): void {
    this.editMode.set(true);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const updated: UpdateCustomerState = {
      ...this.customerService.state(),
      ...this.form.value,
    };

    this.isSaving.set(true);

    this.customerService.updateCustomer(updated).subscribe({
      next: () => {
        this.customerService.state.set(updated);
        this.isSaving.set(false);
        this.editMode.set(false);

        this.title.set('Success');
        this.successMessage.set('Customer updated successfully.');
        this.errorMessage.set(null);
        this.save.emit(updated);
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
        this.delete.emit();
      },
      error: (err) => {
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
