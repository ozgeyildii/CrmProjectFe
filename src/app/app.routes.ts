import { Routes } from '@angular/router';
import { SearchCustomer } from './pages/search-customer/search-customer';

import { PersonalInfo } from './pages/create-customer/personal-info/personal-info';
import { CustomerCreate } from './pages/create-customer/customer-create';
import { AddressInfo } from './pages/create-customer/address-info/address-info';
import { ContactInfo } from './pages/create-customer/contact-info/contact-info';
import { LoginComponent } from './pages/login/login';
import { MainLayout } from './layouts/main-layout/main-layout';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo:'login', pathMatch:'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayout,
    children: [
      {path:'', redirectTo:'customers/search', pathMatch:'full'},
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
    ],
  },
  {
        path:'**',
        redirectTo:'customers/create'
    }
];
