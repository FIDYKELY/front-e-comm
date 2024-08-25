<template>
  <Product :detail="true" :product="product"/>
</template>

<script>
import Product from '@/components/Products.vue';
import productService from '~/api/products';

export default {
  name: 'product_detail-id',

  components: {
    Product
  },

  validate ({ params }) {
    return /^\d+$/.test(params.id)
  },

  data () {
    return {
      product: {},
      selected: 1,
      quantityArray: []
    };
  },

  mounted() {
  let productId = this.$route.params.id;
  this.product = this.$store.getters.getProductById(productId);

  if (!this.product) {
    // Fetch product details from the API if not in store
    productService.getProductById(productId).then(response => {
      this.product = response.data;
    }).catch(error => {
      console.error('Erreur lors de la récupération des détails du produit :', error);
    });
  }

  // Initialiser la quantité sélectionnée
  this.selected = this.product ? this.product.quantity : 1;

  // Créer le tableau des quantités disponibles
  for (let i = 1; i <= 20; i++) {
    this.quantityArray.push(i);
  }
}
,

  computed: {
    isAddedBtn () {
      return this.product.isAddedBtn;
    }
  },

  methods: {
    addToCart (id) {
      let data = {
        id: id,
        status: true
      }
      this.$store.commit('addToCart', id);
      this.$store.commit('setAddedBtn', data);
    },
    removeFromCart (id) {
      let data = {
        id: id,
        status: false
      }
      this.$store.commit('removeFromCart', id);
      this.$store.commit('setAddedBtn', data);
    },
    onSelectQuantity (id) {
      let data = {
        id: id,
        quantity: this.selected
      }
      this.$store.commit('quantity', data);
    },
    saveToFavorite (id) {
      let isUserLogged = this.$store.state.userInfo.isLoggedIn;

      if (isUserLogged) {
        this.$store.commit('addToFavourite', id);
      } else {
        this.$store.commit('showLoginModal', true);
      }
    },
    removeFromFavourite (id) {
      this.$store.commit('removeFromFavourite', id);
    }
  }
};
</script>

