<template>
  <div v-if="product">
    <div class="rounded-2xl shadow-custom bg-white p-4">
      <div class="img-wrapper rounded-t-2xl">
        <img v-if="product.image_url" :src="getImageUrl(product.image_url)" alt="Image du produit" class="rounded-2xl" />
      </div>
      <div class="text-wrapper p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="media-content">
            <span class="text-3xl font-medium">{{ product.product_name }}</span>
          </div>
          <button
            class="button text-lg"
            :title="removeFromFavouriteLabel"
            v-show="product.isFavourite"
            @click="removeFromFavourite(product.id)"
          >
            <span class="icon">
              <i class="fas fa-heart text-red"></i>
            </span>
          </button>
          <button
            class="button text-lg"
            :title="addToFavouriteLabel"
            v-show="!product.isFavourite"
            @click="saveToFavorite(product.id)"
          >
            <span class="icon">
              <i class="far fa-heart text-red"></i>
            </span>
          </button>
        </div>
        <p class="text-2xl">{{ product.description }}</p>
        <div class="flex justify-between">
          <div class="flex items-center">
            <i v-for="index in Math.round(product.ratings)" :key="`stars-${index}`" class="fa fa-star text-gold"></i>
            <p class="ml-2 text-lg">{{ product.reviews > 0 ? `${product.reviews} Reviews` : 'No reviews' }}</p>
          </div>
          <p class="text-3xl font-medium">
            <strong>{{ product.price }} Ar</strong>
          </p>
        </div>
        <div class="mt-4">
          <p class="text-lg font-medium">Available Quantity: {{ product.quantity }}</p>
        </div>
        <div class="flex justify-between mt-5 items-center">
          <select class="p-2 border-2 rounded-2xl" @change="onSelectQuantity(product.id)" v-model="selected">
            <option v-for="quantity in quantityArray" :key="quantity" :value="quantity">
              {{ quantity }}
            </option>
          </select>
          <button class="rounded-xl p-3 bg-blue text-white" v-if="!product.isAddedToCart" @click="addToCart(product.id)">
            {{ addToCartLabel }}
          </button>
          <button class="rounded-xl p-3" v-if="product.isAddedToCart" @click="removeFromCart(product.id)">
            {{ removeFromCartLabel }}
          </button>
        </div>
        <div class="rating-container mt-4">
          <p class="text-lg font-medium">Rate this product:</p>

          <div class="rating-stars flex">
            <i
              v-for="star in 5"
              :key="star"
              class="fa"
              :class="star <= currentRating ? 'fa-star text-gold' : 'fa-star-o text-gray-400'"
              @click="rateProduct(star)"
            ></i>
          </div>

          <p class="mt-2">Current rating: {{ currentRating }}</p>
        </div>
      </div>
    </div>
    <div class="comments-section mt-4">
      <h3>Commentaires</h3>
      <div v-for="comment in comments" :key="comment.id" class="comment">
        <p>{{ comment.comment }}</p>
        <small>Posté par Utilisateur {{ comment.user_id }} le {{ new Date(comment.createdAt).toLocaleString() }}</small>
      </div>
      <form @submit.prevent="submitComment">
        <textarea v-model="newComment" placeholder="Écrire un commentaire..." required></textarea>
        <button type="submit">Poster un commentaire</button>
        <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
      </form>

    </div>
  </div>

</template>

<script>
import productService from '~/api/products';

export default {
  name: 'product_detail-id',
  data() {
    return {
      product: null,
      addToCartLabel: 'Add to cart',
      removeFromCartLabel: 'Remove from cart',
      addToFavouriteLabel: 'Add to favourite',
      removeFromFavouriteLabel: 'Remove from favourite',
      selected: 1,
      quantityArray: [],
      currentRating: 0,
      comments: [],
      newComment: '',
      errorMessage: '',
    };
  },
    async asyncData({ params, $axios }) {
      try {
        const response = await $axios.get(`/products/${params.id}`);
        return { product: response.data };
      } catch (error) {
        console.error('Error fetching product details:', error);
        return { product: null };
      }
    },
  async created() {
      const productId = this.$route.params.id;
      try {
        const response = await productService.getProductById(productId);
        this.product = response.data;
        this.currentRating = this.product.ratings || 0;

        // Charger les commentaires du produit
        const commentsResponse = await productService.getProductComments(productId);
        this.comments = commentsResponse.data; // Stocker les commentaires récupérés
      } catch (error) {
        console.error('Erreur lors de la récupération des détails du produit ou des commentaires:', error);
      }

      // Créer la liste des quantités disponibles
      for (let i = 1; i <= 20; i++) {
        this.quantityArray.push(i);
      }
  },
  methods: {
    addToCart(productId) {
    const cartItem = {
      id: this.product.id,
      name: this.product.product_name,
      price: this.product.price,
      quantity: this.selected, // Utiliser la quantité sélectionnée
      image_url: this.product.image_url
    };
    this.$store.commit('addToCart', cartItem);
    this.$store.commit('setAddedBtn', { id: productId, status: true });
  },
  removeFromCart(productId) {
    this.$store.commit('removeFromCart', productId);
    this.$store.commit('setAddedBtn', { id: productId, status: false });
  },
    saveToFavorite(id) {
      if (this.$store.state.userInfo.isLoggedIn) {
        this.$store.commit('addToFavourite', id);
      } else {
        this.$store.commit('showLoginModal', true);
      }
    },
    removeFromFavourite(id) {
      this.$store.commit('removeFromFavourite', id);
    },
    onSelectQuantity(id) {
      let data = {
        id: id,
        quantity: this.selected,
      };
      this.$store.commit('quantity', data);
    },
    async rateProduct(rating) {
    try {
        await productService.updateProductRating(this.product.id, rating);
        this.currentRating = rating;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la note du produit :', error);
    }
},
    getImageUrl(imageUrl) {
      return `http://localhost:8000/${imageUrl}`;
    },
    async submitComment() {
  const productId = this.$route.params.id;
  const token = localStorage.getItem('authToken');

  if (!token) {
    this.errorMessage = "Vous devez être connecté pour commenter.";
    return;
  }

  try {
    const response = await productService.createProductComment(productId, {
      comment: this.newComment,
    });
    this.comments.push(response.data);
    this.newComment = '';
    this.errorMessage = ''; // Réinitialiser le message d'erreur
  } catch (error) {
    this.errorMessage = "Erreur lors de l’ajout du commentaire. Veuillez réessayer.";
    console.error('Erreur lors de l’ajout du commentaire:', error);
  }
},
  },
};
</script>

<style scoped>
.rating-container {
  margin-top: 20px;
}

.rating-stars {
  font-size: 24px;
}

.rating-stars .fa-star {
  /* cursor: pointer; */
  font-size: 24px; /* Ajuste la taille des icônes pour t'assurer qu'elles sont visibles */
  color: gold; /* Assure-toi que les icônes ont une couleur visible */
}
</style>
