import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchCustomerList } from '../../../models/responses/searchCustomersResponse';
import { CommonModule } from '@angular/common';

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

  @Output() select = new EventEmitter<string>();
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();

  onSelect(customerId: string) {
    this.select.emit(customerId);
  }

  nextPage() {
    this.next.emit();
  }

  previousPage() {
    this.prev.emit();
  }
}
