import { Component, signal } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { Loader } from '../../components/loader/loader';
import { SearchCustomerForm } from '../../components/search-customer/search-customer-form/search-customer-form';
import { SearchCustomerResults } from '../search-customer/search-customer-results/search-customer-results';
 
import { CustomerService } from '../../services/customer-service';
import { SearchCustomerService } from '../../services/search-customer-service';
import { SearchCustomerList } from '../../models/responses/searchCustomersResponse';
import { GetCustomerResponse } from '../../models/responses/getCustomerResponse';
import { filter } from 'rxjs/operators';
 
@Component({
  selector: 'app-update-customer',
  standalone: true,
  imports: [
    CommonModule,
    Loader,
    SearchCustomerForm,
    SearchCustomerResults,
    RouterOutlet,
    RouterModule,
  ],
  templateUrl: './update-customer.html',
  styleUrls: ['./update-customer.scss'],
})
export class UpdateCustomer {
  showSidebar = signal(true);
  activeTab: string = 'info';
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
    private searchCustomerService: SearchCustomerService,
    private router: Router
  ) {}
 
  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url: string = event.urlAfterRedirects;
 
        // Eğer offer-selection altına girdiysek sidebar gizle
        if (url.includes('/offer-selection') || url.includes('/configuration-product')) {
          this.showSidebar.set(false);
        } else {
          this.showSidebar.set(true);
        }
      });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCustomer(id);
    }
  }
 
  loadCustomer(id: string): void {
    this.isLoading.set(true);
    this.customerService.getCustomerById(id).subscribe({
      next: (data: GetCustomerResponse) => {
        this.customerService.state.update((state) => ({
          ...state,
          ...data,
        }));
        this.isLoading.set(false);
        console.log('Customer loaded:', data);
      },
      error: (err) => {
        console.error('Error fetching customer:', err);
        this.isLoading.set(false);
      },
    });
    this.customerService.getAccounts(id, 0).subscribe({
      next: (res) => {
        this.customerService.state.update((state) => ({
          ...state,
          billingAccounts: [...res.content],
        }));
        console.log('Billing accounts loaded:', res.content);
        console.log('Loading customer:', this.customerService.state());
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load accounts', err);
        this.isLoading.set(false);
      },
    });
 
  }
 
  onSearch(filters: any) {
    this.filters = filters;
    this.page = 0;
    this.loadCustomers();
  }
 
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
      },
    });
  }
 
  setActiveTab(tab: string) {
    this.activeTab = tab;
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
 
  onSelectCustomer(customer: GetCustomerResponse) {
    this.customerService.state.set(customer);
    this.showResults = false;
  }
 

  onClear() {    
    this.filters = {};
    this.customers = [];
    this.showResults = true;
    this.customerService.state.set({});
  }
}
 
 