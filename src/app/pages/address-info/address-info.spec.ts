import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressInfo } from './address-info';

describe('AddressInfo', () => {
  let component: AddressInfo;
  let fixture: ComponentFixture<AddressInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddressInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
