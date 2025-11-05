import { Component, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { CreateCustomerService } from '../../../services/create-customer-service';

@Component({
  selector: 'app-address-info',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './address-info.html',
  styleUrls: ['./address-info.scss'],
})
export class AddressInfo implements OnInit {
  addressForm!: FormGroup;

  private addressListForm!: FormGroup;

  addresses = signal<any[]>([]);
  showForm = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private createCustomerService: CreateCustomerService
  ) {}

  ngOnInit(): void {
    this.buildForms();

    const saved = this.createCustomerService.state().addresses ?? [];
    if (saved.length > 0) {
      this.addresses.set(saved);
      saved.forEach((addr: any) => this.addAddress(addr)); // ✅ Artık tanımlı
    }
  }

  private buildForms(): void {
    this.addressListForm = this.fb.group({
      addresses: this.fb.array([]),
    });

    this.addressForm = this.fb.group({
      cityName: ['', [Validators.required, Validators.maxLength(20)]],
      districtName: ['', [Validators.required, Validators.maxLength(20)]],
      street: ['', [Validators.required, Validators.maxLength(20)]],
      houseNumber: ['', [Validators.required, Validators.maxLength(10)]],
      description: ['', [Validators.required, Validators.maxLength(250)]],
      isDefault: [false],
    });
  }

  private get addressesFormArray(): FormArray {
    return this.addressListForm.get('addresses') as FormArray;
  }

  private newAddress(address?: any): FormGroup {
    return this.fb.group({
      cityName: new FormControl(address?.city ?? '', [Validators.required, Validators.maxLength(20)]),
      districtName: new FormControl(address?.district ?? '', [Validators.required, Validators.maxLength(20)]),
      street: new FormControl(address?.street ?? '', [Validators.required, Validators.maxLength(20)]),
      houseNumber: new FormControl(address?.houseNumber ?? '', [Validators.required, Validators.maxLength(10)]),
      description: new FormControl(address?.description ?? '', [Validators.required, Validators.maxLength(250)]),
      isDefault: new FormControl(address?.isDefault ?? false),
    });
  }

  private addAddress(address?: any): void {
    this.addressesFormArray.push(this.newAddress(address));
  }

  onAddNewAddress(): void {
    this.addressForm.reset({
      cityName: '',
      districtName: '',
      street: '',
      houseNumber: '',
      description: '',
      isDefault: false,
    });
    this.showForm.set(true);
  }

  onSave(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const newAddr = { ...this.addressForm.value };

    if (this.addresses().length === 0) {
      newAddr.isDefault = true;
    }

    const updatedList = [...this.addresses(), newAddr];
    this.addresses.set(updatedList);

    this.createCustomerService.state.update(prev => ({
      ...prev,
      addresses: updatedList,
    }));

    this.addAddress(newAddr);

    this.showForm.set(false);
  }

  onSelectPrimary(index: number): void {
    const updated = this.addresses().map((a, i) => ({ ...a, isDefault: i === index }));
    this.addresses.set(updated);

    this.createCustomerService.state.update(prev => ({
      ...prev,
      addresses: updated,
    }));

    this.addressesFormArray.controls.forEach((grp, i) =>
      grp.get('isDefault')?.setValue(i === index)
    );
  }

  onPrevious(): void {
    this.router.navigate(['/customers/create/personal-info']);
  }

  onNext(): void {
    if (this.addresses().length > 0) {
      this.router.navigate(['/customers/create/contact-info']);
    }
  }

  onCancel(): void {
    this.router.navigate(['/customers/search']);
  }
}
