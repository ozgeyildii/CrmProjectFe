import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchCustomerList } from '../../../models/responses/searchCustomersResponse';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GetCustomerResponse } from '../../../models/responses/getCustomerResponse';

@Component({
  selector: 'app-search-customer-results',
  imports: [CommonModule],
  templateUrl: './search-customer-results.html',
  styleUrl: './search-customer-results.scss',
})
export class SearchCustomerResults {
  @Input() customers: SearchCustomerList = [];
  @Input() page = 0;
  @Input() hasMore = false;

  @Output() select = new EventEmitter<GetCustomerResponse>();
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();

  constructor(private router: Router) {}

  onClick(customer: GetCustomerResponse) {
    this.select.emit(customer);
    this.router.navigate(['customers/update', customer.id]);
  }

  nextPage() {
    this.next.emit();
  }

  previousPage() {
    this.prev.emit();
  }
}
