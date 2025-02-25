<!-- this componenent is used to dynamically display the feature types and the available options for each feature type.
this componenent takes the productId as a prop and fetches the product details from the API.
the component then extracts the feature types and options from the product details and displays them in a list.
the component also allows the user to select a feature option and displays the selected product details.
the selected feature will be emitted to parent component,
the parent component will then use the selected feature to update the product details or perform other actions. -->

<template>
  <div>
    <ion-spinner v-if="isLoading" name="crescent"/>
    <div v-else>
      <ion-list v-for="(featureOptions, featureType) in productFeatures" :key="featureType">
        <ion-list-header>{{ featureType }}</ion-list-header>
        <ion-item lines="none">
          <ion-row>
            <ion-chip
              v-for="option in featureOptions"
              :key="option"
              :outline="selectedFeatures[featureType] !== option"
              @click="handleFeatureSelection(option, featureType)"
            >
              <ion-label class="ion-text-wrap">{{ option }}</ion-label>
            </ion-chip>
          </ion-row>
        </ion-item>
      </ion-list>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { 
  IonList, 
  IonListHeader, 
  IonItem, 
  IonRow, 
  IonChip, 
  IonLabel,
  IonSpinner
} from '@ionic/vue';
import { api } from '@/adapter';
import { sortSizes } from '@/apparel-sorter';

export default defineComponent({
  name: 'ProductFeatures2',
  components: {
    IonList, 
    IonListHeader, 
    IonItem, 
    IonRow, 
    IonChip, 
    IonLabel,
    IonSpinner
  },
  props: {
    productGroupId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      products: [] as any[],
      isLoading: false,
      productFeatures: {} as Record<string, string[]>,
      selectedFeatures: {} as Record<string, string>,
      selectedProductId: ''
    };
  },
  watch: {
    productGroupId: {
      immediate: true,
      handler(newVal) {
        this.fetchProductsByGroupId();
      }
    }
  },
  methods: {
    async fetchProductsByGroupId() {
      this.isLoading = true;
      try {
        const response = await api({
          url: "searchProducts",
          method: "post",
          data: JSON.stringify({
            "filters": [
              `groupId: ${this.productGroupId} OR productId: ${this.productGroupId}`
            ],
            "viewSize": 50
          }),
          cache: true
        });

        if (response?.data?.response?.docs && response.data.response.docs.length > 0) {
          this.products = response.data.response.docs;
          this.extractProductFeatures();
        } else {
          // console.warn('No products found or error in response');
        }
      } catch (error) {
        // console.error('Error fetching products:', error);
      } finally {
        this.isLoading = false;
      }
    },
    extractProductFeatures() {
      const features: Record<string, string[]> = {};
      const mainProduct = this.products.find(product => product.productId === this.productGroupId);

      if (mainProduct && mainProduct.productFeatures) {
        mainProduct.productFeatures.forEach((feature: string) => {
          const [type, value] = feature.split('/');
          if (!features[type]) {
            features[type] = [];
          }
          if (!features[type].includes(value)) {
            features[type].push(value);
          }
        });
      }

      // Sort feature types with a custom order
      const featureOrder = ['COLOR', 'SIZE'];
      const sortedFeatureTypes = Object.keys(features)
        .sort((a, b) => {
          const aIndex = featureOrder.indexOf(a.toUpperCase());
          const bIndex = featureOrder.indexOf(b.toUpperCase());
          
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }
          
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          
          return a.localeCompare(b);
        });

      // Create a new sorted features object
      const sortedFeatures: Record<string, string[]> = {};
      sortedFeatureTypes.forEach(featureType => {
        sortedFeatures[featureType] = featureType.toUpperCase() === 'SIZE' 
          ? sortSizes(features[featureType]) 
          : features[featureType].sort();
      });

      this.productFeatures = sortedFeatures;

      // Set initial selection to first option of each feature
      Object.keys(sortedFeatures).forEach(featureType => {
        this.selectedFeatures[featureType] = sortedFeatures[featureType][0];
      });

      // Set initial selected product ID
      const selectedVariant = this.findMatchingVariant();
      if (selectedVariant) {
        this.selectedProductId = selectedVariant.productId;
      }
    },
    handleFeatureSelection(option: string, featureType: string) {
      this.selectedFeatures[featureType] = option;
      const selectedVariant = this.findMatchingVariant();
      if (selectedVariant) {
        this.selectedProductId = selectedVariant.productId;
      }
       this.$emit('selected_variant',selectedVariant.productId);
    },
    findMatchingVariant() {
      return this.products.find((product: any) => {
        const matches = Object.entries(this.selectedFeatures).every(([featureType, featureValue]) => 
          product.productFeatures.includes(`${featureType}/${featureValue}`)
        );
        return matches && product.isVariant === "true";
      });
    }
  }
});
</script>
