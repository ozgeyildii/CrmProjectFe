import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Loader } from '../../components/loader/loader';

import { SearchCustomerForm } from '../../components/search-customer/search-customer-form/search-customer-form';
import { CustomerService } from '../../services/customer-service';
import { GetCustomerResponse } from '../../models/responses/getCustomerResponse';
import { UpdatePersonalInfo } from './update-personal-info/update-personal-info';

@Component({
  selector: 'app-update-customer',
  standalone: true,
  imports: [CommonModule, Loader, UpdatePersonalInfo, SearchCustomerForm],
  templateUrl: './update-customer.html',
  styleUrls: ['./update-customer.scss']
})
export class UpdateCustomer{
  isLoading = signal(true);

  constructor(
    private route: ActivatedRoute,
    public customerService: CustomerService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCustomer(id);
    }
  }

  loadCustomer(id: string): void {
    this.isLoading.set(true);
    this.customerService.getCustomerById(id).subscribe({
      next: (data: GetCustomerResponse) => {
        this.customerService.state.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching customer:', err);
        this.isLoading.set(false);
      }
    });
  }

  onSave(updatedCustomer: GetCustomerResponse) {
    console.log('Save event received:', updatedCustomer);
    // TODO: burada PUT isteği eklenecek
    alert('Customer updated successfully (mock)');
  }

  onCancel() {
    history.back();
  }
}
