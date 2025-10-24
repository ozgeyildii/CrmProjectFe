import { Routes } from '@angular/router';
import { SearchCustomer } from './pages/search-customer/search-customer';

export const routes: Routes = [
    {path:'', redirectTo:'app-customer-search', pathMatch:'full'},
    {path:'app-customer-search', component:SearchCustomer},
];
