import { Component, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CreateCustomerService } from '../../services/create-customer-service';
import { CreateIndividualCustomerRequest } from '../../models/requests/createIndividualCustomerRequest';
import { PopupComponent } from '../../components/popup/popup';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-customer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PopupComponent],
  templateUrl: './create-customer.html',
  styleUrls: ['./create-customer.scss'],
})
export class CreateCustomer implements OnInit {
  createCustomerForm!: FormGroup;

  // ✅ Signals ile reaktif state yönetimi
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  title = signal<string | null>(null);

  constructor(
    private formBuilder: FormBuilder,
    private createCustomerService: CreateCustomerService, public router:Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm() {
    this.createCustomerForm = this.formBuilder.group({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      middleName: new FormControl(''),
      nationalId: new FormControl('', [
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11),
      ]),
      dateOfBirth: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required]),
      motherName: new FormControl(''),
      fatherName: new FormControl(''),
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.createCustomerForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(controlName: string): string {
    const control = this.createCustomerForm.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'This field is required.';
    if (control.errors['minlength'])
      return `Minimum ${control.errors['minlength'].requiredLength} characters required.`;
    if (control.errors['maxlength'])
      return `Maximum ${control.errors['maxlength'].requiredLength} characters allowed.`;

    return 'Invalid field.';
  }

  createCustomer() {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.title.set(null);

    if (this.createCustomerForm.invalid) {
      this.createCustomerForm.markAllAsTouched();
      return;
    }

    const formValue = this.createCustomerForm.value;
    const newCustomerRequest: CreateIndividualCustomerRequest = formValue;

    this.createCustomerService.createIndividualCustomer(newCustomerRequest, true).subscribe({
      next: (res) => {
        this.title.set('Customer Created');
        this.successMessage.set('Customer created successfully!');
      },
      error: (err) => {
        if(err.error?.detail == "Nationality identity exists."){
          this.title.set('Duplicate Nationality ID Found');
          this.errorMessage.set(
           "A customer is already exist with this Nationality ID. Please review and ensure all the fields are filled correctly."
          );
        }
      },
    });
  }

  onCancel(){
      this.router.navigate(['customers/search'])
  }

  closePopup() {
    this.title.set(null);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }
}
