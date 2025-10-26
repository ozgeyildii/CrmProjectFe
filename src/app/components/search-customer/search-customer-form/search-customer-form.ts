import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
      nationalId: [''],
      customerNumber: [''],
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

    // Kullanıcı unique alanlardan birine yazmaya başlamış mı?
    const anyUniqueStarted = this.uniqueFields.some(
      f => (formValue[f] || '').trim().length > 0
    );

    const nameFilled = this.nameFields.some(f => (formValue[f] || '').trim().length > 0);

    if (anyUniqueStarted) {
      // Hangi unique alan doluysa sadece o açık kalsın, diğerleri disable
      this.uniqueFields.forEach(f => {
        const val = (formValue[f] || '').trim();
        if (val.length > 0) {
          this.form.get(f)?.enable({ emitEvent: false });
        } else {
          this.form.get(f)?.disable({ emitEvent: false });
        }
      });

      // İsim alanlarını disable et
      this.nameFields.forEach(f => this.form.get(f)?.disable({ emitEvent: false }));
    } else if (nameFilled) {
      // İsim alanları doluysa sadece firstName ve lastName aktif
      this.nameFields.forEach(f => this.form.get(f)?.enable({ emitEvent: false }));
      this.uniqueFields.forEach(f => this.form.get(f)?.disable({ emitEvent: false }));
    } else {
      // Hiçbir alan dolu değilse tüm alanlar aktif
      [...this.uniqueFields, ...this.nameFields].forEach(f =>
        this.form.get(f)?.enable({ emitEvent: false })
      );
    }
  }

  isSearchDisabled(): boolean {
    const formValue = this.form.getRawValue();

    // Önce unique alanların tamamlanma durumlarını kontrol et
    for (const field of this.uniqueFields) {
      const val = (formValue[field] || '').trim();
      if (val) {
        if (field === 'nationalId' && val.length === 11) return false;
        if (field === 'customerNumber' && val.length === 17) return false;
        if (field === 'value' && val.length === 12) return false;
        if (!['nationalId', 'customerNumber', 'value'].includes(field)) return false;
        // yazmaya başladı ama tamamlanmadı => search kapalı
        return true;
      }
    }

    // Eğer isim alanlarından biri doluysa search aktif
    const nameFilled = this.nameFields.some(f => (formValue[f] || '').trim().length > 0);
    return !nameFilled;
  }

  onSearch() {
    if (!this.isSearchDisabled()) {
      this.search.emit(this.form.getRawValue());
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
