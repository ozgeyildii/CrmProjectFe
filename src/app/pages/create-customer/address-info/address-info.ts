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
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CreateCustomerService } from '../../../services/create-customer-service';
import { GetCityResponse } from '../../../models/responses/getCityResponse';
import { GetDistrictResponse } from '../../../models/responses/getDistrictResponse';

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
  editIndex: number | null = null;

  cities: GetCityResponse[] = [];
  districts: GetDistrictResponse[] = [];
  isLoadingDistricts = signal(false); // Yükleme durumu

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private createCustomerService: CreateCustomerService
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.loadCities();

    const saved = this.createCustomerService.state().addresses ?? [];
    if (saved.length > 0) {
      this.addresses.set(saved);
      saved.forEach((addr: any) => this.addAddress(addr));
    }

    // City değişince district'leri yükle
    this.addressForm.get('cityId')?.valueChanges.subscribe((cityId) => {
      if (cityId) {
        this.loadDistricts(cityId);
      } else {
        this.districts = [];
        this.isLoadingDistricts.set(false);
      }
      this.addressForm.get('districtId')?.setValue('');
    });
  }

  private buildForms(): void {
    this.addressListForm = this.fb.group({
      addresses: this.fb.array([]),
    });

    this.addressForm = this.fb.group({
      cityId: ['', Validators.required],
      districtId: ['', Validators.required],
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
      cityId: new FormControl(address?.cityId ?? ''),
      cityName: new FormControl(address?.cityName ?? ''),
      districtId: new FormControl(address?.districtId ?? ''),
      districtName: new FormControl(address?.districtName ?? ''),
      street: new FormControl(address?.street ?? '', [
        Validators.required,
        Validators.maxLength(20),
      ]),
      houseNumber: new FormControl(address?.houseNumber ?? '', [
        Validators.required,
        Validators.maxLength(10),
      ]),
      description: new FormControl(address?.description ?? '', [
        Validators.required,
        Validators.maxLength(250),
      ]),
      isDefault: new FormControl(address?.isDefault ?? false),
    });
  }

  private addAddress(address?: any): void {
    this.addressesFormArray.push(this.newAddress(address));
  }

  private loadCities(): void {
    this.createCustomerService.getCities().subscribe((data) => (this.cities = data));
  }

  private loadDistricts(cityId: number): void {
    this.isLoadingDistricts.set(true);
    this.districts = []; // Önce temizle

    this.createCustomerService.getDistrictsByCityId(cityId).subscribe({
      next: (data) => {
        this.districts = data;
        this.isLoadingDistricts.set(false);
      },
      error: (err) => {
        console.error('Error loading districts:', err);
        this.isLoadingDistricts.set(false);
      },
    });
  }

  onAddNewAddress(): void {
    this.addressForm.reset({
      cityId: '',
      districtId: '',
      street: '',
      houseNumber: '',
      description: '',
      isDefault: false,
    });
    this.districts = []; // District'leri temizle
    this.editIndex = null;
    this.showForm.set(true);
  }

  onSaveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const formValue = this.addressForm.value;
    const selectedCity = this.cities.find((c) => c.id === +formValue.cityId);
    const selectedDistrict = this.districts.find((d) => d.id === +formValue.districtId);

    const newAddr = {
      ...formValue,
      cityName: selectedCity?.name ?? '',
      districtName: selectedDistrict?.name ?? '',
    };

    let updatedList = [...this.addresses()];

    // Düzenleme modu
    if (this.editIndex !== null) {
      updatedList[this.editIndex] = newAddr;
    } else {
      if (updatedList.length === 0) {
        newAddr.isDefault = true;
      }
      updatedList.push(newAddr);
    }

    this.addresses.set(updatedList);
    this.createCustomerService.state.update((prev) => ({
      ...prev,
      addresses: updatedList,
    }));

    this.showForm.set(false);
  }

  onEditAddress(index: number): void {
    const addr = this.addresses()[index];
    this.editIndex = index;

    // Önce district'leri yükle, sonra formu doldur
    this.isLoadingDistricts.set(true);
    this.createCustomerService.getDistrictsByCityId(addr.cityId).subscribe({
      next: (data) => {
        this.districts = data;
        this.isLoadingDistricts.set(false);

        // District'ler yüklendikten sonra formu doldur
        this.addressForm.patchValue({
          cityId: addr.cityId,
          districtId: addr.districtId,
          street: addr.street,
          houseNumber: addr.houseNumber,
          description: addr.description,
          isDefault: addr.isDefault,
        });
      },
      error: (err) => {
        console.error('Error loading districts:', err);
        this.isLoadingDistricts.set(false);
      },
    });

    this.showForm.set(true);
  }

  onDeleteAddress(index: number): void {
    let updatedList = [...this.addresses()];
    updatedList.splice(index, 1);

    if (updatedList.length === 1) {
      updatedList[0].isDefault = true;
    }

    this.addresses.set(updatedList);
    this.createCustomerService.state.update((prev) => ({
      ...prev,
      addresses: updatedList,
    }));
  }

  onSelectPrimary(index: number): void {
    const updated = this.addresses().map((a, i) => ({
      ...a,
      isDefault: i === index,
    }));
    this.addresses.set(updated);

    this.createCustomerService.state.update((prev) => ({
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
