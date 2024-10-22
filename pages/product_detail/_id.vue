<template>
  <div v-if="product">
    <div class="rounded-2xl shadow-custom bg-white p-4">
      <div class="img-wrapper rounded-t-2xl">
        <img v-if="product.image_url" :src="getImageUrl(product.image_url)" alt="Image du produit" class="w-64 h-64 object-cover rounded-2xl transition-transform duration-500 ease-in-out transform hover:scale-105" />
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
            <i
              v-for="star in 5"
              :key="star"
              class="fa"
              :class="getStarClass(star)"
              @click="rateProduct(star)"
            ></i>
            <p class="ml-2 text-lg">{{ product.reviews > 0 ? `${product.reviews} Reviews` : 'No reviews' }}</p>
          </div>
          <p class="text-3xl font-medium">
            <strong>{{ product.price }} Ar</strong>
          </p>
        </div>
        <div class="mt-4">
          <p class="text-lg font-medium">Quantité disponible : {{ product.quantity }}</p>
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
          <p class="text-lg font-medium">Évaluez ce produit :</p>
          <div class="rating-stars flex">
            <i
              v-for="star in [1, 2, 3, 4, 5]"
              :key="star"
              class="fa"
              :class="getStarClass(star)"
              @click="rateProduct(star)"
              style="font-size: 18px;"
            ></i>
          </div>


          <p class="mt-2">Note actuelle : {{ currentRating }}</p>
        </div>

      </div>
    </div>
    <div class="comments-section mt-4">
  <h3 class="text-2xl font-bold mb-4">Commentaires</h3>

  <div v-for="comment in comments" :key="comment.id" class="comment mt-2 p-4 border-b border-gray-300 transition-transform hover:shadow-lg">
    <p class="text-lg">{{ comment.comment }}</p>
    <small class="text-gray-500">
      Posté par Utilisateur {{ comment.user_id }} le {{ new Date(comment.createdAt).toLocaleString() }}
    </small>
  </div>

  <form @submit.prevent="submitComment" class="mt-4">
    <textarea
      v-model="newComment"
      placeholder="Écrire un commentaire..."
      required
      class="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      rows="4"></textarea>

    <button
      type="submit"
      class="mt-2 rounded-xl p-3 bg-blue-600 text-white font-semibold transition duration-300 ease-in-out hover:bg-blue-700 shadow-lg"
    >
      Poster un commentaire
    </button>

    <p v-if="errorMessage" class="mt-2 text-red-500">{{ errorMessage }}</p>
  </form>
</div>


  </div>

</template>

<script>
import productService from '~/api/products';
import favouriteService from '~/api/favourites';


export default {
  name: 'product_detail-id',
  data() {
    return {
      product: null,
      addToCartLabel: 'Ajouter au panier',
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

      // Vérifier si le produit est un favori
      if (this.$store.state.userInfo.isLoggedIn) {
        const userId = localStorage.getItem('userId');
        if (userId) {
          const favResponse = await favouriteService.getUserFavourites(userId);
          const favouriteProductIds = favResponse.data.map(fav => fav.product_id);

          this.product.isFavourite = favouriteProductIds.includes(this.product.id);
        }
      } else {
        this.product.isFavourite = false;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du produit ou des commentaires:', error);
    }

    // Créer la liste des quantités disponibles
    for (let i = 1; i <= 20; i++) {
      this.quantityArray.push(i);
    }
  },

  methods: {
    async saveToFavorite(productId) {
    try {
      await favouriteService.addFavourite(productId);
      const product = this.product;
      if (product && product.id === productId) {
        product.isFavourite = true; // Met à jour l'état localement
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
    }
  },

  async removeFromFavourite(productId) {
    try {
      await favouriteService.removeFavourite(productId);
      const product = this.product;
      if (product && product.id === productId) {
        product.isFavourite = false; // Met à jour l'état localement
      }
    } catch (error) {
      console.error('Erreur lors du retrait des favoris:', error);
    }
  },
    getStarClass(star) {
    if (star <= this.currentRating) {
      return 'fa fa-star text-gold'; // Étoile pleine
    } else if (star - 0.5 === this.currentRating) {
      return 'fa fa-star-half-o text-gold'; // Étoile demi
    } else {
      return 'fa fa-star-o text-gray-400'; // Étoile vide
    }
  },
    rateProduct(star) {
    this.currentRating = star; // Étoile pleine
    if (star % 1 !== 0) {
      this.currentRating = star - 0.5; // Étoile demi
    }
    // Appeler l'API pour sauvegarder la nouvelle note
  },
  addToCart(productId) {
  const cartItem = {
    id: this.product.id,
    name: this.product.product_name,
    price: this.product.price,
    quantity: this.selected, // Utiliser la quantité sélectionnée
    image_url: this.product.image_url,
  };

  // Ajouter l'article au store
  this.$store.commit('addToCart', cartItem);
  this.$store.commit('setAddedBtn', { id: productId, status: true });

  // Ajouter l'article au localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || []; // Récupérer le panier existant ou un tableau vide
  const existingItemIndex = cart.findIndex(item => item.id === cartItem.id); // Vérifier si l'item est déjà dans le panier

  if (existingItemIndex > -1) {
    // Si l'article existe déjà, mettez à jour la quantité
    cart[existingItemIndex].quantity += cartItem.quantity;
  } else {
    // Sinon, ajoutez le nouvel article
    cart.push(cartItem);
  }

  // Enregistrez le panier mis à jour dans le localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
}
,
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
.rating-stars .fa {
  width: 24px; /* Largeur pour que l'espace soit défini */
  height: 24px; /* Hauteur pour que l'espace soit défini */
  /* font-size: 24px; Taille de police */
  font-size: 18px; /* Taille des étoiles */
  color: gold; /* Couleur pour les étoiles remplies */
  margin-right: 5px; /* Espacement entre les étoiles */
  transition: color 0.3s ease;
}

.rating-stars .fa-star {
  color: gold; /* Couleur des étoiles pleines */
}

.rating-stars .fa-star-o {
  color: #888; /* Couleur des étoiles vides, plus foncé pour bien être visible */
  opacity: 0.6; /* Ajoutez un peu de transparence si nécessaire */
}


.rating-stars .fa-star:hover,
.rating-stars .fa-star-o:hover {
  color: #ffcc00; /* Jaune doré au survol */
}

.rating-stars .fa-star:active,
.rating-stars .fa-star-o:active {
  transform: scale(1.1); /* Effet visuel au clic */
}

.rating-stars .fa-star-half-o {
  color: gold; /* Demi-étoile en or */
}


</style>
