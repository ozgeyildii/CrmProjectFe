import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UpdateCustomerState } from '../../../models/states/updateCustomerState';
import { CustomerService } from '../../../services/customer-service';

@Component({
  selector: 'app-update-personal-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-personal-info.html',
  styleUrls: ['./update-personal-info.scss']
})
export class UpdatePersonalInfo implements OnInit, OnChanges {
  @Input() customer!: UpdateCustomerState;
  @Output() save = new EventEmitter<UpdateCustomerState>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      nationalId: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      motherName: [''],
      fatherName: ['']
    });
  }

  ngOnInit(): void {
    const state = this.customerService.state();
    if (state && Object.keys(state).length > 0) {
      this.form.patchValue({
        firstName: state.firstName || '',
        lastName: state.lastName || '',
        middleName: state.middleName || '',
        nationalId: state.nationalId || '',
        dateOfBirth: state.dateOfBirth || '',
        gender: state.gender || '',
        motherName: state.motherName || '',
        fatherName: state.fatherName || ''
      });
    }
  }

  // ✅ Eğer @Input customer değişirse formu yeniden patch’ler
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customer'] && this.customer) {
      this.form.patchValue({
        firstName: this.customer.firstName || '',
        lastName: this.customer.lastName || '',
        middleName: this.customer.middleName || '',
        nationalId: this.customer.nationalId || '',
        dateOfBirth: this.customer.dateOfBirth || '',
        gender: this.customer.gender || '',
        motherName: this.customer.motherName || '',
        fatherName: this.customer.fatherName || ''
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const updatedCustomer: UpdateCustomerState = {
      ...this.customerService.state(),
      ...this.form.value
    };

    // State güncelle
    this.customerService.state.set(updatedCustomer);

    // Parent’a emit et
    this.save.emit(updatedCustomer);
  }

  onCancelClick(): void {
    this.cancel.emit();
  }
}
