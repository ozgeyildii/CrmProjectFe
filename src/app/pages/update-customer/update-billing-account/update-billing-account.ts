import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CustomerService } from '../../../services/customer-service'; 
import { GetBillingAccountResponse } from '../../../models/responses/getBillingAccountResponse';
@Component({
  selector: 'app-update-billing-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './update-billing-account.html',
  styleUrls: ['./update-billing-account.scss'],
})
export class UpdateBillingAccount implements OnInit {
  accounts = signal<GetBillingAccountResponse[]>([]);
  totalPages = signal(0);
  currentPage = signal(0);
  hasData = signal(false);
 
  constructor(private customerService: CustomerService, private router: Router) {}
 
  ngOnInit(): void {
    this.loadAccounts();
  }
 
  loadAccounts(page: number = 0): void {
    const customerId = this.customerService.state().id;
    this.customerService.getAccounts(customerId!, page).subscribe({
      next: (res) => {
       console.log('res geldi', res);
        this.accounts.set(res.content);
        this.totalPages.set(res.totalPages);
        this.currentPage.set(res.number);
        this.hasData.set(res.content && res.content.length > 0);     
      },
      error: (err) => console.error('Failed to load accounts', err),
    });
  }
 

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) this.loadAccounts(this.currentPage() + 1);
  }
 
  prevPage(): void {
    if (this.currentPage() > 0) this.loadAccounts(this.currentPage() - 1);
  }
 
  createAccount(): void {
      const customerId = this.customerService.state().id;
      this.router.navigate([`/customers/update/${customerId}/create-billing-account`]);

  }

  goToOfferSelection(billingAccountId: number): void {
    const customerId = this.customerService.state().id;
    this.router.navigate([`/customers/update/${customerId}/offer-selection`], { queryParams: { billingAccountId: billingAccountId } });
  }

  deleteAccount(accountId: number): void {
    this.customerService.deleteAccount(accountId).subscribe({
      next: () => {
        console.log('Account deleted successfully');
        this.loadAccounts(this.currentPage());
      },
      error: (err) => console.error('Failed to delete account', err),
    });
}

}