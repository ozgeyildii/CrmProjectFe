import { Component, signal } from '@angular/core';
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
  searchedCampaignOffers = signal<GetCampaignProductOfferResponse[]>([]);

  selectedCatalogId: number | null = null;
  selectedCampaignId: number | null = null;

  billingAccountId: number | null = null;

  // TEKLİ SEÇİM — sadece bir offer tutuyoruz
  selectedOffer = signal<{
    sendId: number;   // backend’e gidecek ID
    uniqueId: number; // UI highlight için
    name: string;
    type: 'OFFER' | 'CAMPAIGN';
  } | null>(null);

  campaignIdFilter = signal('');
  campaignNameFilter = signal('');

  basket = signal<BasketState>({
    id: '',
    billingAccountId: 0,
    totalPrice: 0,
    basketItems: [],
  });

  loading = signal(false);
  errorMsg = signal<string | null>(null);

  constructor(
    private basketApi: BasketService,
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCatalogs();
    this.loadCampaigns();

    this.route.queryParams.subscribe(p => {
      this.billingAccountId = +p['billingAccountId'];
    });

    if (this.billingAccountId) {
      this.basketApi.getBasket(this.billingAccountId).subscribe({
        next: res => this.basket.set(res),
        error: () => {} // basket yoksa sıfırdan başlayacak
      });
    }
  }

  loadCatalogs() {
    this.basketApi.getAllCatalogs().subscribe({
      next: res => this.catalogs.set(res),
      error: () => this.catalogs.set([])
    });
  }

  loadCampaigns() {
    this.basketApi.getAllCampaigns().subscribe({
      next: res => this.campaigns.set(res),
      error: () => this.campaigns.set([])
    });
  }

  onCatalogSelect() {
    if (!this.selectedCatalogId) return;

    this.basketApi.getProductOffersByCatalogId(this.selectedCatalogId).subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : [res];
        this.catalogOffers.set(list);
      },
      error: () => this.catalogOffers.set([])
    });
  }

  onCampaignSelect() {
    if (!this.selectedCampaignId) return;

    this.basketApi.getProductOffersByCampaignId(this.selectedCampaignId).subscribe({
      next: res => {
        const list = Array.isArray(res) ? res : [res];
        this.campaignOffers.set(list);
        this.searchedCampaignOffers.set(list);
      },
      error: () => this.campaignOffers.set([])
    });
  }

  searchCampaignOffers() {
    const idF = this.campaignIdFilter().trim().toLowerCase();
    const nameF = this.campaignNameFilter().trim().toLowerCase();

    const filtered = this.campaignOffers().filter(o => {
      const matchId = idF ? o.campaignId.toString().includes(idF) : true;
      const matchName = nameF ? o.productOfferName.toLowerCase().includes(nameF) : true;
      return matchId && matchName;
    });

    this.searchedCampaignOffers.set(filtered);
  }

  // TEKLİ SEÇİM
  selectOffer(offer: any, type: 'OFFER' | 'CAMPAIGN') {

    const uniqueId = type === 'CAMPAIGN'
      ? offer.productOfferId
      : offer.id;

    const sendId = type === 'CAMPAIGN'
      ? offer.campaignId
      : offer.id;

    const name = offer.productOfferName || offer.name;

    this.selectedOffer.set({
      uniqueId,
      sendId,
      name,
      type
    });
  }

  isCatalogActive(o: any) {
    return this.selectedOffer()?.uniqueId === o.id && this.selectedOffer()?.type === 'OFFER';
  }

  isCampaignActive(o: any) {
    return this.selectedOffer()?.uniqueId === o.productOfferId && this.selectedOffer()?.type === 'CAMPAIGN';
  }

  addToBasket() {
    const sel = this.selectedOffer();
    if (!sel || !this.billingAccountId) return;

    this.loading.set(true);

    const req: AddBasketItemRequest = {
      id: sel.sendId,
      type: sel.type
    };

    this.basketApi.addItemToBasket(this.billingAccountId, req).subscribe({
      next: (res: CreatedBasketItemResponse) => {

        const cur = this.basket();

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

        this.basket.set({
          ...cur,
          id: res.basketId,
          basketItems: [...cur.basketItems, newItem],
          totalPrice: cur.totalPrice + (res.discountedPrice ?? res.price ?? 0),
        });

        this.selectedOffer.set(null);
      },
      error: () => this.errorMsg.set("Item could not be added."),
      complete: () => this.loading.set(false)
    });
  }

  clearBasket() {
    if (!this.basket().id) return;

    this.basketApi.clearBasket(this.basket().id).subscribe({
      next: () => {
        this.basket.set({
          ...this.basket(),
          basketItems: [],
          totalPrice: 0
        });
      }
    });
  }

  goNext() {
    const cid = this.customerService.state().id;

    this.router.navigate(
      [`/customers/update/${cid}/configuration-product`],
      { queryParams: { billingAccountId: this.billingAccountId } }
    );
  }

  get total() {
    return this.basket().basketItems.reduce(
      (sum, item) => sum + (item.discountedPrice ?? item.price ?? 0),
      0
    );
  }
}
