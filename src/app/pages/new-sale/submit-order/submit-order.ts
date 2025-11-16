import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '@/src/app/services/order-service';

@Component({
  selector: 'app-submit-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './submit-order.html',
  styleUrls: ['./submit-order.scss'],
})
export class SubmitOrder {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);

  loading = signal(false);
  errorMsg = signal<string | null>(null);

  orderPreview = signal<{
    orderId: string;
    orderItems: { productOfferId: number; productOfferName: string }[];
    serviceAddress: string;
    totalAmount: number;
  } | null>(null);

  ngOnInit() {
    const state = this.orderService.orderState();
    if (!state || !state.id) {
      this.errorMsg.set('Order state not found!');
      return;
    }

    const a = state.address!;
    const formattedAddr = `${a.cityName}, ${a.districtName}, ${a.street} No:${a.houseNumber}, ${a.description}`;

    this.orderPreview.set({
      orderId: state.id!,
      orderItems: state.createdOrderItem ?? [],
      serviceAddress: formattedAddr,
      totalAmount: state.totalPrice ?? 0,
    });
  }

  goPrevious() {
    const customerId = this.route.snapshot.paramMap.get('customerId');
    const billingAccountId = this.orderService.orderState().billingAccountId;
    this.router.navigate([`/customers/update/${customerId}/configuration-product`], {
      queryParams: { billingAccountId },
    });
  }

  submitOrder() {
    if (this.loading()) return;

    const orderId = this.orderService.orderState().id;
    if (!orderId) {
      this.errorMsg.set('Order ID not found.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set(null);

    this.orderService.createProduct(orderId).subscribe({
      next: () => {
        this.loading.set(false);
        this.openSuccess();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set('Order submit failed, try again.');
        console.error(err);
      },
    });
  }

  openSuccess() {
    const modal = document.getElementById('successModal') as HTMLDialogElement;
    modal.showModal();
  }

  closeSuccess() {
    const modal = document.getElementById('successModal') as HTMLDialogElement;
    modal.close();

    const customerId = this.route.snapshot.paramMap.get('customerId');
    this.router.navigate([`/customers/update/${customerId}/update-billing-account`]);
  }
}
