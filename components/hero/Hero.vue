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
              slidesToShow: 2, // Afficher 2 produits pour les écrans moyens
              slidesToScroll: 1,
            },
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 1, // Afficher 1 produit pour les petits écrans
              slidesToScroll: 1,
            },
          },
        ],
      },
    };
  },
  async mounted() {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID is not available in localStorage');
      }

      const response = await productService.getRecommendations(userId);
      const productIds = response.data.map(item => item.product_id);

      const productsResponse = await Promise.all(productIds.map(id => productService.getProductById(id)));
      this.products = productsResponse.map(res => res.data); // Assurez-vous que ça correspond à la structure de la réponse

      console.log('Nombre de produits recommandés récupérés :', this.products.length);
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations:', error);
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
.vue-slick-carousel {
  display: flex !important; /* Force le carrousel à utiliser flex */
  justify-content: center; /* Centrer les éléments */
  align-items: center; /* Centrer verticalement */
}

.product-carousel {
  display: flex; /* Centrer horizontalement */
  justify-content: center; /* Centrer le carrousel */
  flex-wrap: nowrap; /* Évite que les éléments passent à la ligne */
}

.carousel-item {
  display: flex; /* Utiliser flexbox pour chaque élément */
  justify-content: center; /* Centrer le contenu de chaque produit */
  align-items: center; /* Centrer verticalement */
  min-width: 200px; /* Assurez-vous que les éléments ne rétrécissent pas trop */
}

.product-card {
  flex: 0 0 auto; /* Évite que les cartes ne s'étirent */
  width: 200px; /* Ajustez la largeur selon vos besoins */
  margin: 0 10px; /* Espacement horizontal entre les cartes */
  text-align: center; /* Centrer le texte dans les cartes */
  padding: 10px; /* Espacement interne */
  background: #fff; /* Fond blanc */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Ombre légère */
  border-radius: 8px; /* Coins arrondis */
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
</style>
