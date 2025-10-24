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
  @Output() select = new EventEmitter<string>();
 
  onSelect(customerId: string) { this.select.emit(customerId); }
}
