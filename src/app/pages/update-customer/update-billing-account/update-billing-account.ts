import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CustomerService } from '../../../services/customer-service';
import { OrderService } from '../../../services/order-service';
import { GetBillingAccountResponse } from '../../../models/responses/getBillingAccountResponse';

interface ProductDetail {
  productId: number;
  productName: string;
  campaignId: number | null;
  campaignName: string | null;
  addressText: string;
}

@Component({
  selector: 'app-update-billing-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './update-billing-account.html',
  styleUrls: ['./update-billing-account.scss'],
})
export class UpdateBillingAccount implements OnInit {
  private customerService = inject(CustomerService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  accounts = signal<GetBillingAccountResponse[]>([]);
  totalPages = signal(0);
  currentPage = signal(0);
  hasData = signal(false);

  productDetails = signal<{ [billingAccountId: number]: ProductDetail[] }>({});
  selectedProduct = signal<ProductDetail | null>(null);

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(page: number = 0): void {
    const customerId = this.customerService.state().id;

    this.customerService.getAccounts(customerId!, page).subscribe({
      next: (res) => {
        this.accounts.set(res.content);
        this.totalPages.set(res.totalPages);
        this.currentPage.set(res.number);
        this.hasData.set(res.content.length > 0);

        res.content.forEach((acc) => this.loadProductsForAccount(acc.id));
      },
      error: (err) => console.error('Failed to load accounts', err),
    });
  }

  loadProductsForAccount(billingAccountId: number) {
    this.orderService.getOrders(billingAccountId).subscribe({
      next: (orders) => {
        const map = { ...this.productDetails() };
        const list: ProductDetail[] = [];

        orders.forEach((order) => {
          const a = order.address;

          const addressText = `Address: ${a.cityName}/${a.districtName}, ${a.street} ${
            a.houseNumber
          }, ${a.description ?? ''}`.trim();

          order.createdOrderItem.forEach((item) =>
            list.push({
              productId: item.productId,
              productName: item.productName,
              campaignId: item.campaignId ?? null,
              campaignName: item.campaignName ?? null,
              addressText,
            })
          );
        });

        map[billingAccountId] = list;
        this.productDetails.set(map);
      },
      error: (err) => console.error('Failed to load order products', err),
    });
  }
  createAccount(): void {
    const customerId = this.customerService.state().id;
    this.router.navigate([`/customers/update/${customerId}/create-billing-account`]);
  }

  goToOfferSelection(billingAccountId: number): void {
    const customerId = this.customerService.state().id;
    this.router.navigate([`/customers/update/${customerId}/offer-selection`], {
      queryParams: { billingAccountId },
    });
  }

  deleteAccount(accountId: number): void {
    this.customerService.deleteAccount(accountId).subscribe({
      next: () => this.loadAccounts(this.currentPage()),
      error: (err) => console.error('Failed to delete account', err),
    });
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) this.loadAccounts(this.currentPage() + 1);
  }

  prevPage(): void {
    if (this.currentPage() > 0) this.loadAccounts(this.currentPage() - 1);
  }

  openDetailsModal(item: ProductDetail) {
    this.selectedProduct.set(item);
    (document.getElementById('productModal') as HTMLDialogElement).showModal();
  }

  closeModal() {
    (document.getElementById('productModal') as HTMLDialogElement).close();
  }
}
