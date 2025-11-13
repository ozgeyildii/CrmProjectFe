import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BasketService } from '../../../services/basket-service';
import { AddBasketItemRequest } from '../../../models/requests/addBasketItemRequest';
import { CreatedBasketItemResponse } from '../../../models/responses/createdBasketItemResponse';
import { GetCatalogResponse } from '../../../models/responses/getCatalogResponse';
import { GetProductOfferByCatalogResponse } from '../../../models/responses/getProductOfferByCatalogResponse';
import { GetCampaignResponse } from '../../../models/responses/getCampaignResponse';
import { GetCampaignProductOfferResponse } from '../../../models/responses/getCampaignProductOfferResponse';
import { BasketState, BasketItem } from '../../../models/states/basketState';
import { CustomerService } from '../../../../app/services/customer-service';

@Component({
  selector: 'app-offer-selection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './offer-selection.html',
  styleUrls: ['./offer-selection.scss'],
})
export class OfferSelection {
  activeTab = signal<'catalog' | 'campaign'>('catalog');

  catalogs = signal<GetCatalogResponse[]>([]);
  catalogOffers = signal<GetProductOfferByCatalogResponse[]>([]);
  campaigns = signal<GetCampaignResponse[]>([]);
  campaignOffers = signal<GetCampaignProductOfferResponse[]>([]);

  selectedCatalogId: number | null = null;
  selectedCampaignId: number | null = null;

  campaignIdFilter = signal('');
  campaignNameFilter = signal('');

  billingAccountId: number | null = null;

  filteredCampaignOffers = computed(() => {
    const offers = this.campaignOffers();
    const idFilter = this.campaignIdFilter().trim().toLowerCase();
    const nameFilter = this.campaignNameFilter().trim().toLowerCase();

    return offers.filter((offer) => {
      const matchesId = idFilter
        ? offer.campaignId?.toString().toLowerCase().includes(idFilter)
        : true;
      const matchesName = nameFilter
        ? offer.productOfferName?.toLowerCase().includes(nameFilter)
        : true;
      return matchesId && matchesName;
    });
  });

  selectedOffer = signal<{ id: number; name: string; type: 'OFFER' | 'CAMPAIGN' } | null>(null);
  basket = signal<BasketState>({ id: '', billingAccountId: 0, totalPrice: 0, basketItems: [] });
  loading = signal(false);
  errorMsg = signal<string | null>(null);

  constructor(
    private basketApi: BasketService,
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router:Router
  ) {}

  ngOnInit() {
    this.loadCatalogs();
    this.loadCampaigns();

    this.route.queryParams.subscribe((params) => {
      this.billingAccountId = +params['billingAccountId'];
    });

    this.basketApi.getBasket(this.billingAccountId!).subscribe({
      next: (res) => {
        this.basket.set(res); // artık res zaten BasketState
      },
      error: () => this.catalogOffers.set([]),
    });
  }

  loadCatalogs() {
    this.basketApi.getAllCatalogs().subscribe({
      next: (res) => this.catalogs.set(res),
      error: () => this.catalogs.set([]),
    });
  }

  loadCampaigns() {
    this.basketApi.getAllCampaigns().subscribe({
      next: (res) => this.campaigns.set(res),
      error: () => this.campaigns.set([]),
    });
  }

  onCatalogSelect() {
    if (!this.selectedCatalogId) return;
    this.catalogOffers.set([]);
    this.basketApi.getProductOffersByCatalogId(this.selectedCatalogId).subscribe({
      next: (res) => {
        const offers = Array.isArray(res) ? res : [res];
        this.catalogOffers.set(offers);
      },
      error: () => this.catalogOffers.set([]),
    });
  }

  onCampaignSelect() {
    if (!this.selectedCampaignId) return;
    this.campaignOffers.set([]);
    this.basketApi.getProductOffersByCampaignId(this.selectedCampaignId).subscribe({
      next: (res) => {
        const offers = Array.isArray(res) ? res : [res];
        this.campaignOffers.set(offers);
      },
      error: () => this.campaignOffers.set([]),
    });
  }

  setTab(tab: 'catalog' | 'campaign') {
    this.activeTab.set(tab);
    this.selectedOffer.set(null);
    this.errorMsg.set(null);
  }

  selectOffer(offer: any, type: 'OFFER' | 'CAMPAIGN') {
          console.log('Clicked offer:', offer);  // 👈 burayı ekle

    this.selectedOffer.set({
      id: offer.id,
      name: offer.productOfferName,
      type,
    });
  }

  // ✅ BasketState yapısına göre güncellendi
  addToBasket() {
    const selected = this.selectedOffer();
    if (!selected || !this.billingAccountId) return;

    const request: AddBasketItemRequest = {
      id: selected.id,
      type: selected.type,
    };

    this.loading.set(true);
    this.errorMsg.set(null);

    this.basketApi.addItemToBasket(this.billingAccountId, request).subscribe({
      next: (res: CreatedBasketItemResponse) => {
        const currentBasket = this.basket();
        const newItem: BasketItem = {
          id: res.id,
          basketId: res.basketId,
          productOfferId: res.productOfferId,
          productOfferName: res.productOfferName,
          campaignProductOfferId: res.campaignProductOfferId,
          catalogProductOfferId: res.catalogProductOfferId,
          price: res.price,
          quantity: res.quantity,
          discountedPrice: res.discountedPrice,
          discountRate: res.discountRate,
        };

        const updatedBasket: BasketState = {
          ...currentBasket,
          basketItems: [...currentBasket.basketItems, newItem],
          totalPrice: currentBasket.totalPrice + (res.discountedPrice ?? res.price ?? 0),
        };

        this.basket.set(updatedBasket);
        console.log('🧺 Current basket state:', this.basket());

        this.selectedOffer.set(null);
      },
      error: () => this.errorMsg.set('Item could not be added to basket.'),
      complete: () => this.loading.set(false),
    });
  }



  // ✅ BasketState’e göre düzenlendi
  clearBasket() {
    const basketId = this.basket().id;
    if (!basketId) return;

    this.basketApi.clearBasket(basketId).subscribe({
      next: () => {
        this.basket.set({
          ...this.basket(),
          basketItems: [],
          totalPrice: 0,
        });
        this.errorMsg.set(null);
      },
      error: () => this.errorMsg.set('Basket could not be cleared.'),
    });
  }

  goNext(){
const customerId = this.customerService.state().id;

this.router.navigate(
  [`/customers/update/${customerId}/configuration-product`],

  {
    queryParams: { billingAccountId: this.billingAccountId },
  }
);
  }

  // ✅ BasketState’ten total hesaplama
  get total(): number {
    return this.basket().basketItems.reduce(
      (sum, item) => sum + (item.discountedPrice ?? item.price ?? 0),
      0
    );
  }
}
