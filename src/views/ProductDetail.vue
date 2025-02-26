<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/tabs/catalog" />
        <ion-title>{{ translate("Product details") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main v-if="Object.keys(product).length > 0">
        <div class="product-section">
          
          <section class="product-image">
            <DxpShopifyImg :src="currentVariant.mainImageUrl" />
          </section>
  
          <section class="product-info">
            <ion-item lines="none">
              <ion-label class="ion-text-wrap">
                <p class="overline">{{ currentVariant.brandName }}</p>
                <h1>{{ getProductIdentificationValue(productIdentificationPref.primaryId, currentVariant) }}</h1>
                <h2>{{ getProductIdentificationValue(productIdentificationPref.secondaryId, currentVariant) }}</h2>
              </ion-label>
              <!-- Price is given undefined to $n funtction on first render, hence, conditional rendering with empty string -->
              <ion-note slot="end">{{ currentVariant.LIST_PRICE_PURCHASE_USD_STORE_GROUP_price ? $n(currentVariant.LIST_PRICE_PURCHASE_USD_STORE_GROUP_price, 'currency', currency ) : '' }}</ion-note>
            </ion-item>
           
        <DxpProductFeatures :productGroupId="currentProductId"  @selected_variant="receiveEmit"/> 
  
            <div> 
              <ion-segment :value="selectedSegment">
                <ion-segment-button value="inStore" @click="selectedSegment = 'inStore'">
                  <ion-label>In Store</ion-label>
                </ion-segment-button>
                <ion-segment-button value="otherLocations" @click="selectedSegment = 'otherLocations'">
                  <ion-label>Other Locations</ion-label>
                </ion-segment-button>
              </ion-segment>
  
              <ion-list v-if="selectedSegment === 'inStore'">
                <ion-item>
                  <ion-label class="ion-text-wrap">{{ translate("Quantity on hand")}}</ion-label>
                  <ion-note slot="end">{{ getProductStock(currentVariant.productId).quantityOnHandTotal ?? '0' }}</ion-note>
                </ion-item>
                <ion-item>
                  <ion-label class="ion-text-wrap">{{ translate("Safety stock")}}</ion-label>
                  <ion-note slot="end">{{ getInventoryInformation(currentVariant.productId).minimumStock ?? '0' }}</ion-note>
                </ion-item>
                <ion-item>
                  <ion-label class="ion-text-wrap">{{ translate("Order reservations")}}</ion-label>
                  <ion-note slot="end">{{ getInventoryInformation(currentVariant.productId).reservedQuantity ?? '0' }}</ion-note>
                </ion-item>
                <ion-item lines="none">
                  <ion-label class="ion-text-wrap">{{ translate("Available to promise")}}</ion-label>
                  <ion-badge color="success" slot="end">{{ getInventoryInformation(currentVariant.productId).onlineAtp ?? '0' }}</ion-badge>
                </ion-item>
              </ion-list>
  
              <ion-list v-if="selectedSegment === 'otherLocations'"> 
                <ion-item>
                  <ion-label class="ion-text-wrap">{{ translate("Other stores")}}</ion-label>
                  <ion-button @click="getOtherStoresInventoryDetails()" fill="outline">{{ translate('ATP', { count: otherStoresInventory}) }}</ion-button>
                </ion-item>
                <ion-item lines="none">
                  <ion-label class="ion-text-wrap">{{ translate("Warehouse")}}</ion-label>
                  <ion-note slot="end">{{ translate('ATP', { count: warehouseInventory}) }}</ion-note>
                </ion-item>
              </ion-list>
            </div>
          </section>
        </div>
        
        <div v-if="orders.length">
          <h3>{{ translate('order reservations at', { count: getInventoryInformation(currentVariant.productId).reservedQuantity ?? '0', store: currentFacility.facilityName }) }}</h3>
          <div class="reservation-section">
            <ion-card v-for="(order, index) in orders" :key="index"> 
              <ion-item lines="none">
                <ion-label class="ion-text-wrap">
                  <h1>{{ order.customer.name }}</h1>
                  <p>{{ order.orderName ? order.orderName : order.orderId }}</p>
                </ion-label>
                <ion-badge color="primary" slot="end">
                  {{ order.shipmentMethod.shipmentMethodTypeDesc ? order.shipmentMethod.shipmentMethodTypeDesc : order.shipmentMethod.shipmentMethodTypeId }}
                </ion-badge> 
              </ion-item>
              
              <ion-item lines="none"> 
                <ion-thumbnail slot="start">
                  <DxpShopifyImg :src="getProduct(order.currentItem.productId).mainImageUrl" size="small" />
                </ion-thumbnail>
                <ion-label class="ion-text-wrap">
                  <h2>{{ getProductIdentificationValue(productIdentificationPref.primaryId, getProduct(order.currentItem.productId)) ? getProductIdentificationValue(productIdentificationPref.primaryId, getProduct(order.currentItem.productId)) : order.currentItem.productId }}</h2>
                  <p class="ion-text-wrap">{{ getProductIdentificationValue(productIdentificationPref.secondaryId, getProduct(order.currentItem.productId)) }}</p>
                </ion-label>
                <ion-note slot="end">{{ translate(order.currentItem.quantity == 1 ? "unit" : "units", { item: order.currentItem.quantity }) }}</ion-note>
              </ion-item>
              <!-- other items -->
              <ion-list-header color="light" v-if="order.otherItems.length > 0">
                <ion-label>{{ translate("Other items")}}</ion-label>
              </ion-list-header>
              <ion-item lines="none" v-for="(item, index) in order.otherItems" :key="index" >
                <ion-thumbnail slot="start">
                  <DxpShopifyImg :src="getProduct(item.productId).mainImageUrl" size="small" />
                </ion-thumbnail>
                <ion-label class="ion-text-wrap" >
                  <h2>{{ getProductIdentificationValue(productIdentificationPref.primaryId, getProduct(item.productId)) ? getProductIdentificationValue(productIdentificationPref.primaryId, getProduct(item.productId)) : item.productId }}</h2>
                  <p class="ion-text-wrap">{{ getProductIdentificationValue(productIdentificationPref.secondaryId, getProduct(item.productId)) }}</p>
                </ion-label>
                <ion-note slot="end">{{ translate(item.quantity == 1 ? "unit" : "units", { item: item.quantity }) }}</ion-note>
              </ion-item>
            </ion-card>
          </div>
        </div>
      </main>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonCard,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonThumbnail,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { computed, defineComponent } from "vue";
import { mapGetters, useStore } from "vuex";
import { StockService } from '@/services/StockService'
import { showToast } from "@/utils";
import { hasError } from '@/adapter'
import OtherStoresInventoryModal from "./OtherStoresInventoryModal.vue";
import { DxpShopifyImg, getProductIdentificationValue, translate, useProductIdentificationStore, useUserStore,DxpProductFeatures } from "@hotwax/dxp-components";
import logger from "@/logger";

export default defineComponent({
  name: "ProductDetail",
  components: {
    IonBackButton,
    IonBadge,
    IonButton,
    IonCard,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonNote,
    IonPage,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonThumbnail,
    IonToolbar,
    DxpShopifyImg,
    DxpProductFeatures
  },
  data() {
    return {
      selectedColor: '',
      selectedSize: '',
      features: [] as any,
      currentVariant: {} as any,
      currentStoreInventory: 0,
      otherStoresInventory: 0,
      warehouseInventory: 0,
      otherStoresInventoryDetails: [] as any,
      selectedSegment: 'inStore',
      queryString: '',
      currentProductId: this.$route.params.productId
    }
  },
  computed: {
    ...mapGetters({
      product: "product/getCurrent",
      currency: 'user/getCurrency',
      getProductStock: 'stock/getProductStock',
      getInventoryInformation: 'stock/getInventoryInformation',
      orders: 'order/getOrders',
      getProduct: 'product/getProduct',
    }),
  },
  async beforeMount() {
    await this.store.dispatch('product/setCurrent', { productId: this.$route.params.productId })
    if (this.product.variants) {
      await this.updateVariantById(this.product.variants[0].productId);
    }
  },
  methods:  {
      receiveEmit(selectedVariant: string) {
      this.updateVariantById(selectedVariant);
    },

    async updateVariantById(variantId: string) {
      const variant = this.product.variants.find((variant: any) => variant.productId === variantId);
      if (variant) {
        this.currentVariant = variant;
        await this.checkInventory();
        await this.getOrderDetails();
        await this.store.dispatch('stock/fetchStock', { productId: this.currentVariant.productId });
        await this.store.dispatch('stock/fetchInventoryCount', { productId: this.currentVariant.productId });
        await this.store.dispatch('stock/fetchReservedQuantity', { productId: this.currentVariant.productId });
      } else {
        showToast(translate("Selected variant not available"));
      }
    },
    async getOrderDetails() {
      await this.store.dispatch("order/getOrderDetails", { viewSize: 200, facilityId: this.currentFacility?.facilityId, productId: this.currentVariant.productId });
    },
    async checkInventory() {
      this.currentStoreInventory = this.otherStoresInventory = this.warehouseInventory = 0
      this.otherStoresInventoryDetails = []

      try {
        const resp: any = await StockService.checkInventory({
          "filters": { 
            "productId": this.currentVariant.productId,
            "facilityTypeId_fld0_value": 'WAREHOUSE',
            "facilityTypeId_fld0_op": 'equals',
            "facilityTypeId_fld0_grp": '1',
            "facilityTypeId_fld1_value": 'RETAIL_STORE',
            "facilityTypeId_fld1_op": 'equals',
            "facilityTypeId_fld1_grp": '2'
          },
          "fieldsToSelect": ["productId", "atp", "facilityName", "facilityId", "facilityTypeId"],
        });

        if (resp.status === 200 && !hasError(resp) && resp.data.docs.length) {
          resp.data.docs.map((storeInventory: any) => {
            if(storeInventory.atp) {
              const isCurrentStore = storeInventory.facilityId === this.currentFacility?.facilityId;
              if (isCurrentStore) this.currentStoreInventory = storeInventory.atp;
              if (storeInventory.facilityTypeId === 'WAREHOUSE') {
                this.warehouseInventory += storeInventory.atp
              } else if (!isCurrentStore) {
                // Only add to list if it is not a current store
                this.otherStoresInventoryDetails.push({ facilityName: storeInventory.facilityName, stock: storeInventory.atp })
                this.otherStoresInventory += storeInventory.atp
              }
            }
          })
        }
      } catch (error) {
        logger.error(error)
        showToast(translate("Something went wrong"));
      }
    },
    async getOtherStoresInventoryDetails() {
      const otherStoresInventoryModal = await modalController.create({
        component: OtherStoresInventoryModal,
        componentProps: { otherStoresInventory: this.otherStoresInventoryDetails }
      });
      return otherStoresInventoryModal.present();
    }
  },
  setup() {
    const store = useStore();
    const userStore = useUserStore()
    const productIdentificationStore = useProductIdentificationStore();
    let productIdentificationPref = computed(() => productIdentificationStore.getProductIdentificationPref)
    let currentFacility: any = computed(() => userStore.getCurrentFacility) 

    return {
      currentFacility,
      getProductIdentificationValue,
      productIdentificationPref,
      store,
      translate
    }
  }
});
</script>

<style scoped>
.product-image {
  text-align: center;
}

.reservation-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* gap: 5px; */
}

.product-section {
  display: flex;
  flex-wrap: wrap;
  max-width: 1042px;
  margin: auto;
}

.product-image {
  flex: 1 1 300px;
}

.product-info {
  flex: 2 1 360px;
}

@media (min-width: 720px) {
  main {
    padding: var(--spacer-sm);
  }
}
</style>