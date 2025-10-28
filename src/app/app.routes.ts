import { Routes } from '@angular/router';
import { SearchCustomer } from './pages/search-customer/search-customer';

import { PersonalInfo } from './pages/create-customer/personal-info/personal-info';
import { CustomerCreate } from './pages/create-customer/customer-create';
import { AddressInfo } from './pages/create-customer/address-info/address-info';
import { ContactInfo } from './pages/create-customer/contact-info/contact-info';


export const routes: Routes = [
  { path: '', redirectTo: 'customers/search', pathMatch: 'full' },
  { path: 'customers/search', component: SearchCustomer },
  {
    path: 'customers/create',
    component: CustomerCreate,
    children: [
      { path: '', redirectTo: 'personal-info', pathMatch: 'full' },
      { path: 'personal-info', component: PersonalInfo },
      { path: 'address-info', component: AddressInfo},
      { path: 'contact-info', component: ContactInfo},
    ],
  },
];

