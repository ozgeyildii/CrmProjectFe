import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchCustomerForm } from './search-customer-form';

describe('SearchCustomerForm', () => {
  let component: SearchCustomerForm;
  let fixture: ComponentFixture<SearchCustomerForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchCustomerForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchCustomerForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
