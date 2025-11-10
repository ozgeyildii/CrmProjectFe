import { Routes } from '@angular/router';
import { SearchCustomer } from './pages/search-customer/search-customer';

import { PersonalInfo } from './pages/create-customer/personal-info/personal-info';
import { CustomerCreate } from './pages/create-customer/customer-create';
import { AddressInfo } from './pages/create-customer/address-info/address-info';
import { ContactInfo } from './pages/create-customer/contact-info/contact-info';
import { LoginComponent } from './pages/login/login';
import { MainLayout } from './layouts/main-layout/main-layout';
import { authGuard } from './guards/auth-guard';
import { UpdatePersonalInfo } from './pages/update-customer/update-personal-info/update-personal-info';
import { UpdateCustomer } from './pages/update-customer/update-customer';
import { UpdateContactMedium } from './pages/update-customer/update-contact-medium/update-contact-medium';
import { UpdateAddressInfo } from './pages/update-customer/update-address-info/update-address-info';
import { CreateBillingAccount } from './pages/update-customer/create-billing-account/create-billing-account';
import { UpdateBillingAccount } from './pages/update-customer/update-billing-account/update-billing-account';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'customers/search', pathMatch: 'full' },
      { path: 'customers/search', canActivate: [authGuard], component: SearchCustomer },
      {
        path: 'customers/create',
        component: CustomerCreate,
        children: [
          { path: '', redirectTo: 'personal-info', pathMatch: 'full' },
          { path: 'personal-info', canActivate: [authGuard], component: PersonalInfo },
          { path: 'address-info', canActivate: [authGuard], component: AddressInfo },
          { path: 'contact-info', canActivate: [authGuard], component: ContactInfo },
        ],
      },
      {
        path: 'customers/update/:id',
        canActivate: [authGuard],
        component: UpdateCustomer,
        children: [
          { path: '', redirectTo: 'update-personal-info', pathMatch: 'full' },
          { path: 'update-personal-info', canActivate: [authGuard], component: UpdatePersonalInfo },
          {
            path: 'update-contact-medium',
            canActivate: [authGuard],
            component: UpdateContactMedium,
          },
          { path: 'update-address', canActivate: [authGuard], component: UpdateAddressInfo },
          { path: 'update-billing-account', canActivate: [authGuard], component: UpdateBillingAccount  },
          { path: 'create-billing-account', canActivate: [authGuard], component: CreateBillingAccount  },
        ],
      },

      
    ],
  },
  {
    path: '**',
    redirectTo: 'customers/create',
  },
];
