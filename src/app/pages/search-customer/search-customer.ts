import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { SearchCustomerList } from '../../models/responses/searchCustomersResponse';
import { SearchCustomerService } from '../../services/search-customer-service';
import { SearchCustomerForm } from '../../components/search-customer/search-customer-form/search-customer-form';
import { SearchCustomerResults } from '../../components/search-customer/search-customer-results/search-customer-results';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../services/loader-service';
import { Loader } from '../../components/loader/loader';

@Component({
  selector: 'app-customer-search',
  templateUrl: './search-customer.html',
  imports: [SearchCustomerForm, SearchCustomerResults, CommonModule, Loader],
})
export class SearchCustomer {
  customers: SearchCustomerList = [];
  filters: any = {};
  loading = false;
  page = 0;
  size = 3;
  hasMore = false;

  constructor(
    private searchCustomerService: SearchCustomerService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    public loaderService: LoaderService
  ) {}

  onSearch(filters: any) {
    this.filters = filters;
    this.page = 0;
    this.loadCustomers();
  }
loadCustomers() {
  this.searchCustomerService.searchCustomers(this.filters, this.page, this.size).subscribe({
    next: (res: any) => {
      // Eğer veri geldiyse kaydet
      this.customers = res || [];

      // Eğer gelen veri sayısı size'dan küçükse → bu son sayfa
      this.hasMore = res && res.length === this.size;

      // Eğer son sayfadaysak ama boş geldiyse (örneğin fazla tıklama olmuşsa)
      if (res.length === 0 && this.page > 0) {
        this.page--; // bir önceki sayfaya dön
        this.hasMore = false;
        this.loadCustomers(); // geri yükle
      }
    },
    error: () => {
      this.customers = [];
      this.hasMore = false;
    }
  });
}

nextPage() {
  if (!this.hasMore) return; // eğer son sayfaysa gitme
  this.page++;
  this.loadCustomers();
}

previousPage() {
  if (this.page > 0) {
    this.page--;
    this.loadCustomers();
  }
}

  onClear() {
    this.filters = {};
    this.customers = [];
    this.page = 0;
  }

  onSelectCustomer(customerId: string) {
    this.router.navigate(['/customers/detail', customerId]);
  }

  onCreateCustomer() {
    this.router.navigate(['/customers/create']);
  }
}
