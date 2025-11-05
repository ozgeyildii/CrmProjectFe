import { Component, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PopupComponent } from '../../../components/popup/popup';
import { CreateCustomerService } from '../../../services/create-customer-service';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PopupComponent],
  templateUrl: './personal-info.html',
  styleUrls: ['./personal-info.scss'],
})
export class PersonalInfo implements OnInit {
  createPersonalInfoForm!: FormGroup;

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  title = signal<string | null>(null);

  today = new Date().toISOString().split('T')[0];

  constructor(
    private formBuilder: FormBuilder,
    private createCustomerService: CreateCustomerService,
    public router: Router,
    private customerCreationService: CreateCustomerService
  ) {}

  ngOnInit(): void {
    this.buildForm();

    const dateControl = this.createPersonalInfoForm.get('dateOfBirth');
    const today = this.today;

    dateControl?.valueChanges.subscribe((value) => {
      if (value && value > today) {
        dateControl.setErrors({ futureDate: true });
      } else if (dateControl?.hasError('futureDate')) {
        dateControl.setErrors(null);
      }
    });
  }

  private minimumAgeValidator(minAge: number) {
    return (control: any) => {
      if (!control.value) return null;

      const today = new Date();
      const birthDate = new Date(control.value);

      const age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();

      const actualAge = m < 0 || (m === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;

      return actualAge < minAge ? { underage: true } : null;
    };
  }

  buildForm() {
    this.createPersonalInfoForm = this.formBuilder.group({
      firstName: [this.createCustomerService.state().firstName ?? '', [Validators.required]],
      lastName: [this.createCustomerService.state().lastName ?? '', [Validators.required]],
      middleName: [this.createCustomerService.state().middleName ?? ''],
      nationalId: [
        this.createCustomerService.state().nationalId ?? '',
        [Validators.required, Validators.pattern(/^[0-9]{11}$/)],
      ],
      dateOfBirth: [
        this.createCustomerService.state().dateOfBirth ?? '',
        [Validators.required, this.minimumAgeValidator(18)],
      ],
      gender: [this.createCustomerService.state().gender ?? '', [Validators.required]],
      motherName: [this.createCustomerService.state().motherName ?? ''],
      fatherName: [this.createCustomerService.state().fatherName ?? ''],
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.createPersonalInfoForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(controlName: string): string {
    const control = this.createPersonalInfoForm.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'This field is required.';
    if (control.errors['minlength'])
      return `Minimum ${control.errors['minlength'].requiredLength} characters required.`;
    if (control.errors['maxlength'])
      return `Maximum ${control.errors['maxlength'].requiredLength} characters allowed.`;
    if (control.errors['futureDate']) return 'Date of Birth cannot be in the future.';
    if (control.errors['underage']) return 'You must be at least 18 years old.';
    return 'Invalid field.';
  }

  checkNationalIdBeforeCreate() {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.title.set(null);

    if (this.createPersonalInfoForm.invalid) {
      this.createPersonalInfoForm.markAllAsTouched();
      return;
    }

    const nationalId = this.createPersonalInfoForm.get('nationalId')?.value;
    if (!nationalId) return;

    this.createCustomerService.checkNationalId(nationalId).subscribe({
      next: (res:any) => {
        if (res.exists) {
          this.title.set('Duplicate Nationality ID Found');
          this.errorMessage.set(res.message);
        } else {
          const newValue = {
            ...this.createCustomerService.state(),
            ...this.createPersonalInfoForm.value,
          };
          this.createCustomerService.state.set(newValue);

          this.router.navigate(['/customers/create/address-info']);
        }
      },
      error: () => {
        this.title.set('Service Error');
        this.errorMessage.set('Unable to check National ID. Please try again later.');
      },
    });
  }

  onCancel() {
    this.router.navigate(['customers/search']);
  }

  closePopup() {
    this.title.set(null);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }
}
