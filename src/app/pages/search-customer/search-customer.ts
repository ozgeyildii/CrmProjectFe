import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { SearchCustomerList } from '../../models/responses/searchCustomersResponse';
import { CreateCustomerService } from '../../services/create-customer-service';
import { SearchCustomerService } from '../../services/search-customer-service';
import { SearchCustomerForm } from '../../components/search-customer/search-customer-form/search-customer-form';
import { SearchCustomerResults } from '../../components/search-customer/search-customer-results/search-customer-results';
import { CommonModule } from '@angular/common';
 
@Component({
  selector: 'app-customer-search',
  templateUrl: './search-customer.html',
  imports:[SearchCustomerForm,SearchCustomerResults, CommonModule]
})
export class SearchCustomer {
  customers: SearchCustomerList = [];
  loading = false;
 
  constructor(private customerService: SearchCustomerService, private router: Router, private cdRef: ChangeDetectorRef) {}
 
  onSearch(filters: any) {
  this.loading = true;
  this.customerService.searchCustomers().subscribe({
    next: (res) => {
      this.customers = res;
      this.loading = false;
      this.cdRef.detectChanges(); // 👈 reconcile immediately
    },
    error: () => {
      this.customers = [];
      this.loading = false;
      this.cdRef.detectChanges();
    },
  });
}
 
  onClear() { this.customers = []; }
 
  onSelectCustomer(customerId: string) {
    this.router.navigate(['/customers/detail', customerId]);
  }
 
  onCreateCustomer() {
    this.router.navigate(['/customers/create']);
  }
}