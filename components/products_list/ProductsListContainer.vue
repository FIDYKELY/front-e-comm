<template>
  <div class="m-5">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="product in filteredProducts" :key="product.id">
        <Products :detail="false" :product="product" />
      </div>
    </div>
    <div class="text-center" v-if="filteredProducts.length === 0">
      <h2 class="text-2xl">{{ noProductLabel }}</h2>
    </div>
  </div>
</template>

<script>
import Products from '../Products';
import { getByTitle } from '@/assets/filters';
import apiProducts from '@/api/products'; // Assurez-vous que le chemin est correct

export default {
  name: 'productsList',

  components: {
    Products
  },

  data () {
    return {
      products: [], // Initialiser les produits ici
      noProductLabel: 'No product found',
      loading: true, // Pour gérer l'état de chargement
    };
  },

  computed: {
    filteredProducts() {
      const {
        userInfo: {
          hasSearched
        }
      } = this.$store.state;

      if (hasSearched) {
        return this.getProductByTitle();
      } else {
        return this.products; // Retourner la liste des produits récupérés
      }
    }
  },

  methods: {
    async fetchProducts() {
      try {
        const response = await apiProducts.getAllProducts(); // Appel de l'API pour récupérer tous les produits
        this.products = response.data; // Assurez-vous que la structure des données est correcte
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        this.loading = false; // Fin de l'état de chargement
      }
    },

    getProductByTitle() {
      const {
        userInfo: {
          productTitleSearched
        }
      } = this.$store.state;

      return getByTitle(this.products, productTitleSearched);
    }
  },

  mounted() {
    this.fetchProducts(); // Appel de la méthode lors du montage du composant
  }
};
</script>
