import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-customer-form',
  imports: [ReactiveFormsModule],
  templateUrl: './search-customer-form.html',
  styleUrl: './search-customer-form.scss',
})
export class SearchCustomerForm {
  @Output() search = new EventEmitter<any>();
  @Output() clear = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      idNumber: [''],
      customerNumber: [''],
      accountNumber: [''],
      gsmNumber: [''],
      firstName: [''],
      lastName: [''],
      orderNumber: ['']
    });
  }

  onSearch() { this.search.emit(this.form.value); }
  onClear() { this.form.reset(); this.clear.emit(); }
  onCreate() { this.create.emit(); }
}
