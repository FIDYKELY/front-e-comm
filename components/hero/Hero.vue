<template>
  <div class="bg-blue p-4 lg:p-8">
    <h1 class="text-white text-4xl mb-5">Recommandations</h1>
    <h2 class="text-white text-2xl mb-8">Les produits recommandés</h2>

    <vue-slick-carousel
      v-if="products.length"
      :settings="slickOptions"
      class="product-carousel"
    >
      <div v-for="product in products" :key="product.id" class="carousel-item">
        <div class="product-card">
          <img :src="getImageUrl(product.image_url)" alt="Product image" class="product-image" />
          <h3 class="product-name">{{ product.product_name }}</h3>
          <p class="product-price">{{ product.price }} Ar</p>
          <button @click="handleProductClick(product.id)" class="add-to-cart-btn">
            Ajouter au panier
          </button>
        </div>
      </div>
    </vue-slick-carousel>
  </div>
</template>

<script>
import VueSlickCarousel from 'vue-slick-carousel';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import productService from '~/api/products';

export default {
  name: 'ProductsCarousel',
  components: {
    VueSlickCarousel,
  },
  data() {
    return {
      products: [],
      slickOptions: {
        dots: true,
        infinite: true,
        speed: 300,
        slidesToShow: 3,  // Afficher 3 produits en même temps
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 1,
            },
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 1,
            },
          },
        ],
      },
    };
  },
  async mounted() {
    try {
      const response = await productService.getAllProducts();
      this.products = response.data;
      console.log('Nombre de produits récupérés :', this.products.length);
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
    }
  },
  methods: {
    getImageUrl(imageUrl) {
      return `http://localhost:8000/${imageUrl}`;
    },
    async handleProductClick(productId) {
      await this.registerProductClick(productId);
    },
    async registerProductClick(productId) {
      try {
        await productService.registerProductClick(productId);
        console.log(`Product click registered for product ID: ${productId}`);
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du clic sur le produit:', error);
      }
    },
  },
};
</script>

<style scoped>
.product-card {
  text-align: center;
  padding: 10px;
}

.product-image {
  width: 100%; /* Remplissage de la largeur du conteneur */
  height: 150px; /* Hauteur fixe pour uniformiser la taille */
  object-fit: cover; /* Conserve le ratio d'aspect de l'image */
  border-radius: 8px;
}

.product-name {
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
}

.product-price {
  font-size: 16px;
  color: #333;
  margin-top: 5px;
}

.add-to-cart-btn {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #ff6600;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.add-to-cart-btn:hover {
  background-color: #ff4500;
}

.product-carousel {
  margin-top: 20px; /* Ajout d'un peu d'espace au-dessus du carrousel */
}
</style>
