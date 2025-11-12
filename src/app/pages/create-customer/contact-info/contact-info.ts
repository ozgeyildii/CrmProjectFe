import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CreateCustomerService } from '../../../services/create-customer-service';
import { Loader } from '../../../components/loader/loader';
import { LoaderService } from '../../../services/loader-service';

@Component({
  selector: 'app-contact-info',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, Loader],
  templateUrl: './contact-info.html',
  styleUrls: ['./contact-info.scss'],
})
export class ContactInfo implements OnInit, OnDestroy {
  contactForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private createCustomerService: CreateCustomerService,
    public loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadStateValues();

    this.contactForm.valueChanges.subscribe(() => {
      this.saveCurrentFormToState();
    });
  }

  ngOnDestroy(): void {
    this.saveCurrentFormToState();
  }

  buildForm(): void {
    this.contactForm = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(50)]),
      homePhone: new FormControl('', [Validators.pattern(/^$|^[0-9]{10}$/)]),
      mobilePhone: new FormControl('', [Validators.required, Validators.pattern(/^\+?[0-9]{10}$/)]),
      fax: new FormControl('', [Validators.pattern(/^$|([0-9]{4}|[0-9]{13})$/)]),
    });
  }

  loadStateValues(): void {
    const mediums = this.createCustomerService.state().contactMediums;
    if (mediums && Array.isArray(mediums)) {
      this.contactForm.patchValue({
        email: mediums.find((m) => m.type === 'EMAIL')?.value || '',
        homePhone: mediums.find((m) => m.type === 'HOME_PHONE')?.value || '',
        mobilePhone: mediums.find((m) => m.type === 'PHONE')?.value || '',
        fax: mediums.find((m) => m.type === 'FAX')?.value || '',
      });
    }
  }

  onFaxInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // sadece rakam bırak

    // 13 karakterden uzun olmasın
    if (value.length > 13) {
      value = value.slice(0, 13);
    }

    // input alanını güncelle
    input.value = value;

    // FormControl değerini güncelle ve validasyonu tetikle
    const faxControl = this.contactForm.get('fax');
    faxControl?.setValue(value, { emitEvent: true });

    // manuel olarak validasyonu kontrol et
    if (value.length !== 0 && value.length !== 4 && value.length !== 13) {
      faxControl?.setErrors({ invalidFaxLength: true });
    } else {
      // geçerli uzunlukta ise özel hatayı temizle
      if (faxControl?.hasError('invalidFaxLength')) {
        faxControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      }
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.contactForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  onCreate(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.saveCurrentFormToState();

    this.createCustomerService.createCustomer().subscribe({
      next: (response) => {
        console.log('Customer created successfully:', response);
        this.router.navigate(['customers/update', response.id]);
        this.createCustomerService.state.set({});
      },
      error: (err) => {
        console.error('Customer creation failed:', err);
      },
    });
  }

  onPrevious(): void {
    this.saveCurrentFormToState();
    this.router.navigate(['/customers/create/address-info']);
  }

  onCancel(): void {
    this.router.navigate(['/customers/search']);
  }

  private saveCurrentFormToState(): void {
    const formValues = this.contactForm.value;
    const contactMediums = [
      { type: 'EMAIL', value: formValues.email, isPrimary: true },
      { type: 'HOME_PHONE', value: formValues.homePhone, isPrimary: false },
      { type: 'PHONE', value: formValues.mobilePhone, isPrimary: true },
      { type: 'FAX', value: formValues.fax, isPrimary: false },
    ].filter((cm) => cm.value && cm.value.trim() !== '');
    this.createCustomerService.state.update((prev) => ({
      ...prev,
      contactMediums,
    }));
  }
}
