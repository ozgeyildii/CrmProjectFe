import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateCustomerService } from '../../services/create-customer-service';
import { CreateIndividualCustomerRequest } from '../../models/requests/createIndividualCustomerRequest';

@Component({
  selector: 'app-create-customer',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './create-customer.html',
  styleUrls: ['./create-customer.scss'],
})
export class CreateCustomer implements OnInit {
  createCustomerForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private createCustomerService: CreateCustomerService) {}

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm() {
    this.createCustomerForm = this.formBuilder.group({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      middleName: new FormControl(''),
      nationalId: new FormControl('', [Validators.minLength(11), Validators.maxLength(11)]),
      dateOfBirth: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required]),
      motherName: new FormControl(''),
      fatherName: new FormControl(''),
    });
  }

  createCustomer() {
  console.log('create Customer çağrıldı');
  if (this.createCustomerForm.invalid) {
    this.createCustomerForm.markAllAsTouched();
    return;
  }

  const formValue = this.createCustomerForm.value;
  const newCustomerRequest: CreateIndividualCustomerRequest = formValue;

  console.log(newCustomerRequest);
  this.createCustomerService.createIndividualCustomer(newCustomerRequest).subscribe({
    next: (res) => console.log('Customer created successfully:', res),
    error: (err) => console.error('Error creating customer:', err),
  });
}
}
