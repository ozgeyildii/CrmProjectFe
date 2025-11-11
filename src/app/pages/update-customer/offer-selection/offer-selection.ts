import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Offer {
  id: string;
  name: string;
  price: number;
  desc?: string;
}

@Component({
  selector: 'app-offer-selection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './offer-selection.html',
  styleUrls: ['./offer-selection.scss']
})
export class OfferSelection {
  activeTab: 'catalog' | 'campaign' = 'catalog';

  // Mock veriler
  catalogOffers: Offer[] = [
    { id: '71233', name: '8Mbps / 4 GB kotalı ADSL Internet', price: 59.9 },
    { id: '202610', name: 'Müşteri Modemi PR', price: 79.9 },
    { id: '126030', name: 'Aktivasyon/Peşin', price: 79.9 }
  ];

  campaignOffers: Offer[] = [
    { id: 'C-001', name: 'Kampanya - İnternet + TV', price: 99.9 },
    { id: 'C-002', name: 'Kampanya - Fiber 100', price: 129.9 }
  ];

  selectedOffer: Offer | null = null;
  basket: Offer[] = [];

  // Filtre alanları
  catalogSelection = 'all';
  campaignIdFilter = '';
  campaignNameFilter = '';

  setTab(tab: 'catalog' | 'campaign') {
    this.activeTab = tab;
    this.selectedOffer = null;
  }

  selectOffer(offer: Offer) {
    this.selectedOffer = offer;
  }

  addToBasket() {
    if (this.selectedOffer) {
      this.basket.push({ ...this.selectedOffer });
      this.selectedOffer = null;
    }
  }

  removeFromBasket(index: number) {
    this.basket.splice(index, 1);
  }

  clearBasket() {
    this.basket = [];
  }

  get total(): number {
    return this.basket.reduce((sum, o) => sum + o.price, 0);
  }

  filteredCatalog(): Offer[] {
    if (this.catalogSelection === 'all') return this.catalogOffers;
    return this.catalogOffers.filter(o => o.id.startsWith(this.catalogSelection));
  }

  filteredCampaigns(): Offer[] {
    return this.campaignOffers.filter(o =>
      o.id.toLowerCase().includes(this.campaignIdFilter.toLowerCase()) &&
      o.name.toLowerCase().includes(this.campaignNameFilter.toLowerCase())
    );
  }
}
