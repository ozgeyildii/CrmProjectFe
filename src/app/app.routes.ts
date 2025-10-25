import { Routes } from '@angular/router';
import { SearchCustomer } from './pages/search-customer/search-customer';
import { CreateCustomer } from './pages/create-customer/create-customer';

export const routes: Routes = [
    {path:'', redirectTo:'customers/search', pathMatch:'full'},
    {path:'customers/search', component:SearchCustomer},
    {path:'customers/create', component:CreateCustomer}
];
