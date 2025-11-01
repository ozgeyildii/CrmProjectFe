import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Loader } from '../../components/loader/loader';
import { SearchCustomerForm } from '../../components/search-customer/search-customer-form/search-customer-form';
import { SearchCustomerResults } from '../search-customer/search-customer-results/search-customer-results';
import { UpdatePersonalInfo } from './update-personal-info/update-personal-info';

import { CustomerService } from '../../services/customer-service';
import { SearchCustomerService } from '../../services/search-customer-service';
import { GetCustomerResponse } from '../../models/responses/getCustomerResponse';
import { SearchCustomerList } from '../../models/responses/searchCustomersResponse';

@Component({
  selector: 'app-update-customer',
  standalone: true,
  imports: [CommonModule, Loader, UpdatePersonalInfo, SearchCustomerForm, SearchCustomerResults],
  templateUrl: './update-customer.html',
  styleUrls: ['./update-customer.scss']
})
export class UpdateCustomer {
  isLoading = signal(false);
  showResults = false;

  customers: SearchCustomerList = [];
  filters: any = {};
  page = 0;
  size = 20;
  hasMore = false;

  constructor(
    private route: ActivatedRoute,
    public customerService: CustomerService,
    private searchCustomerService: SearchCustomerService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCustomer(id);
    }
  }

  /** 🔹 Belirli bir ID ile müşteri detayını getirir */
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

  /** 🔹 Arama tetiklenince çalışır */
  onSearch(filters: any) {
    this.filters = filters;
    this.page = 0;
    this.loadCustomers();
  }

  /** 🔹 Arama sonuçlarını backend’den getirir */
  loadCustomers() {
    this.isLoading.set(true);
    this.showResults = false;

    this.searchCustomerService.searchCustomers(this.filters, this.page, this.size).subscribe({
      next: (res: any) => {
        this.customers = res || [];
        this.hasMore = res && res.length === this.size;
        this.isLoading.set(false);
        this.showResults = true;
      },
      error: (err) => {
        console.error('Error searching customers:', err);
        this.customers = [];
        this.isLoading.set(false);
        this.showResults = false;
      }
    });
  }

  nextPage() {
    if (!this.hasMore) return;
    this.page++;
    this.loadCustomers();
  }

  previousPage() {
    if (this.page > 0) {
      this.page--;
      this.loadCustomers();
    }
  }

  /** 🔹 Sonuçlardan bir müşteri seçilirse */
  onSelectCustomer(customer: GetCustomerResponse) {
    this.customerService.state.set(customer);
    this.showResults = false; // sonuçları kapat, formu aç
  }

  /** 🔹 Arama temizlenirse */
  onClear() {
    this.filters = {};
    this.customers = [];
    this.showResults = false;
  }

  /** 🔹 Güncelleme işlemi (mock) */
  onSave(updatedCustomer: GetCustomerResponse) {
    console.log('Updated:', updatedCustomer);
    alert('Customer updated successfully (mock)');
  }

  onCancel() {
    history.back();
  }
}
