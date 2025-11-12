import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-customer-form',
  imports: [ReactiveFormsModule],
  templateUrl: './search-customer-form.html',
  styleUrls: ['./search-customer-form.scss'],
})
export class SearchCustomerForm {
  @Output() search = new EventEmitter<any>();
  @Output() clear = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();

  form: FormGroup;

  uniqueFields = ['nationalId', 'customerNumber', 'accountNumber', 'value', 'orderNumber'];
  nameFields = ['firstName', 'lastName'];

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      nationalId: ['', Validators.pattern('^[0-9]*$')],
      customerNumber: ['', Validators.pattern('^CUST-\\d{4}-\\d{7}$')],
      accountNumber: [''],
      value: [''],
      firstName: [''],
      lastName: [''],
      orderNumber: ['']
    });

    this.form.valueChanges.subscribe(() => this.updateFormState());
  }

  updateFormState() {
    const formValue = this.form.getRawValue();
    const anyUniqueStarted = this.uniqueFields.some(f => (formValue[f] || '').trim().length > 0);
    const nameFilled = this.nameFields.some(f => (formValue[f] || '').trim().length > 0);

    if (anyUniqueStarted) {
      this.uniqueFields.forEach(f => {
        const val = (formValue[f] || '').trim();
        if (val.length > 0) {
          this.form.get(f)?.enable({ emitEvent: false });
        } else {
          this.form.get(f)?.disable({ emitEvent: false });
        }
      });
      this.nameFields.forEach(f => this.form.get(f)?.disable({ emitEvent: false }));
    } else if (nameFilled) {
      this.nameFields.forEach(f => this.form.get(f)?.enable({ emitEvent: false }));
      this.uniqueFields.forEach(f => this.form.get(f)?.disable({ emitEvent: false }));
    } else {
      [...this.uniqueFields, ...this.nameFields].forEach(f =>
        this.form.get(f)?.enable({ emitEvent: false })
      );
    }
  }

  isSearchDisabled(): boolean {
    const formValue = this.form.getRawValue();

    // Eğer hiçbir alan dolu değilse
    if (Object.values(formValue).every(v => !v || (v + '').trim() === '')) return true;

    // Eğer form valid değilse (örneğin pattern hatası varsa)
    if (this.form.invalid) return true;

    // Unique alanlardan biri doluysa
    for (const field of this.uniqueFields) {
      const val = (formValue[field] || '').trim();
      if (val) {
        if (field === 'nationalId' && val.length === 11) return false;
        if (field === 'customerNumber' && val.length === 17) return false;
        if (field === 'accountNumber' && val.length === 14) return false;
        if (field === 'value' && val.length === 12) return false;
        if (!['nationalId', 'customerNumber','accountNumber', 'value'].includes(field)) return false;
        return true;
      }
    }

    // Eğer isim alanlarından biri doluysa
    const nameFilled = this.nameFields.some(f => (formValue[f] || '').trim().length > 0);
    return !nameFilled;
  }

  onSearch() {
    if (!this.isSearchDisabled()) {
      this.search.emit(this.form.getRawValue());
    } else {
      this.form.markAllAsTouched(); // 🔹 Hataları göstermek için
    }
  }

  onClear() {
    this.form.reset();
    this.updateFormState();
    this.clear.emit();
  }

  onCreateCustomer() {
    this.router.navigate(['customers/create']);
  }
}
