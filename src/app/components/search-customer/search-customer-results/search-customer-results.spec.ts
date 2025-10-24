import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchCustomerResults } from './search-customer-results';

describe('SearchCustomerResults', () => {
  let component: SearchCustomerResults;
  let fixture: ComponentFixture<SearchCustomerResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchCustomerResults]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchCustomerResults);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
