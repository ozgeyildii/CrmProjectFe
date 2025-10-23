import { Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./components/header/header";
import { Sidebar } from "./components/sidebar/sidebar";
import { CreateCustomer } from "./pages/create-customer/create-customer";
import { Loader } from "./components/loader/loader";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Sidebar, CreateCustomer, Loader],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  
}
