import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SearchCustomerList } from '../../models/responses/searchCustomersResponse';
import { SearchCustomerService } from '../../services/search-customer-service';
import { SearchCustomerForm } from '../../components/search-customer/search-customer-form/search-customer-form';
import { SearchCustomerResults } from './search-customer-results/search-customer-results';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../services/loader-service';
import { Loader } from '../../components/loader/loader';
import { PopupComponent } from '../../components/popup/popup';
import { GetCustomerResponse } from '../../models/responses/getCustomerResponse';

@Component({
  selector: 'app-customer-search',
  templateUrl: './search-customer.html',
  imports: [SearchCustomerForm, SearchCustomerResults, CommonModule, Loader, PopupComponent],
})
export class SearchCustomer {
  customers: SearchCustomerList = [];
  filters: any = {};
  loading = false;
  page = 0;
  size = 20;
  hasMore = false;
  showPopup = signal(false);
  popupTitle = signal('');
  popupMessage = signal('');
  popupType = signal<'success' | 'error' | 'warning'>('warning');

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

        if (this.customers.length === 0 && this.page === 0) {
          this.popupMessage.set('No customer found.');
          this.popupType.set('warning');
          this.showPopup.set(true);
        }

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
      },
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

  onSelectCustomer(customer: GetCustomerResponse) {
    this.router.navigate(['/customers/detail', customer.customerNumber]);
  }

  onCreateCustomer() {
    this.router.navigate(['/customers/create']);
  }

  onClosePopup() {
    this.showPopup.set(false);
  }
}
