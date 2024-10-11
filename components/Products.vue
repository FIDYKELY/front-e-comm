<template>
  <div>
    <div
      v-for="product in products"
      :key="product.id"
       @click="handleProductClick(product.id)"
      :class="[detail ? 'detail' : '']"
      class="rounded-2xl shadow-custom bg-white p-4"
    >
      <div class="img-wrapper rounded-t-2xl">
        <!-- <nuxt-link :to="{ name: 'product_detail-id', params: { id: product.id } }">
          <img v-if="product.image_url" :src="getImageUrl(product.image_url)" alt="Image du produit" class="rounded-2xl" />
        </nuxt-link> -->
        <nuxt-link :to="{ name: 'product_detail-id', params: { id: product.id } }">
          <img v-if="product.image_url" :src="getImageUrl(product.image_url)" alt="Image du produit" class="rounded-2xl transition-transform duration-500 ease-in-out transform hover:scale-105" />
        </nuxt-link>

      </div>
      <div class="text-wrapper p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="media-content">
            <nuxt-link
              :to="{
                name: 'product_detail-id',
                params: {
                  id: product.id,
                }
              }"
            >
              <span :class="[detail ? 'text-3xl' : 'text-lg']" class="font-medium">{{ product.product_name }}</span>
            </nuxt-link>
          </div>

          <button
            class="button text-lg"
            :title="removeFromFavouriteLabel"
            v-if="product.isFavourite"
            @click="removeFromFavourite(product.id)"
          >
            <span class="icon">
              <i class="fas fa-heart text-red"></i>
            </span>
          </button>

          <button
            class="button text-lg"
            :title="addToFavouriteLabel"
            v-if="!product.isFavourite"
            @click="addToFavourites(product.id)"
          >
            <span class="icon">
              <i class="far fa-heart text-red"></i>
            </span>
          </button>



        </div>

        <div class="content is-clearfix">
          <p :class="[detail ? 'text-2xl' : 'text-base']">{{ product.description }}</p>
          <div class="flex justify-between">
            <div class="flex items-center">
              <i v-for="n in Math.round(product.ratings)" :key="`stars-${n}`" class="fa fa-star text-gold"></i>
              <p class="ml-2 text-lg">{{ product.reviews > 0 ? `${product.reviews} Reviews` : 'No reviews' }}</p>
            </div>
            <p class="text-3xl font-medium">
              <strong>{{ product.price }} Ar</strong>
            </p>
          </div>
          <div class="flex justify-between mt-5 items-center">
            <select
              class="p-2 border-2 rounded-2xl"
              @change="onSelectQuantity(product.id, product.selectedQuantity)"
              v-model="product.selectedQuantity"
            >
              <option v-for="quantity in quantityArray" :key="quantity" :value="quantity">{{ quantity }}</option>
            </select>


            <button class="rounded-xl p-3 bg-blue text-white" v-if="!product.isAddedToCart" @click="addToCart(product.id); handleProductClick(product.id)">
              {{ addToCartLabel }}
            </button>

            <button class="rounded-xl p-3" v-if="product.isAddedToCart" @click="removeFromCart(product.id)">
              {{ removeFromCartLabel }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script>
import productService from '~/api/products';
import favouriteService from '~/api/favourites';

export default {
  name: 'products',
  props: ['detail'],
  transition: 'fade',
  data() {
    return {
      products: [],
      addToCartLabel: 'Add to cart',
      removeFromCartLabel: 'Remove from cart',
      addToFavouriteLabel: 'Add to favourite',
      removeFromFavouriteLabel: 'Remove from favourite',
      selected: 1,
      quantityArray: [],
    };
  },
  async mounted() {
  try {
    const response = await productService.getAllProducts();
    this.products = response.data;

    if (this.$store.state.userInfo.isLoggedIn) {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const favResponse = await favouriteService.getUserFavourites(userId);
        console.log('Favoris récupérés :', favResponse.data); // Ajoutez ce log pour vérifier

        const favouriteProductIds = favResponse.data.map(fav => fav.product_id);

        this.products.forEach(product => {
          product.selectedQuantity = 1;
          product.isFavourite = favouriteProductIds.includes(product.id);
          console.log(`Produit ${product.id} : isFavourite = ${product.isFavourite}`);
        });
      }
    } else {
      this.products.forEach(product => {
        product.isFavourite = false;
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des produits ou des favoris :', error);
  }

  this.quantityArray = Array.from({ length: 20 }, (_, i) => i + 1);
}

,

  methods: {
    async addToCart(productId) {
      console.log('Add to cart clicked for product ID:', productId);
      const product = this.products.find(p => p.id === productId);
      console.log('Product found:', product);
      if (product) {
        const cartItem = {
          id: product.id,
          name: product.product_name,
          price: product.price,
          quantity: product.selectedQuantity,
          image_url: product.image_url
        };
        console.log('Cart item:', cartItem);
        this.$store.commit('addToCart', cartItem);
        product.isAddedToCart = true;
      } else {
        console.error('Product not found');
      }
    },
    removeFromCart(productId) {
      this.$store.commit('removeFromCart', productId);
      this.$store.commit('setAddedBtn', { id: productId, status: false });
    },
    async addToFavourites(productId) {
  try {
    await favouriteService.addFavourite(productId);
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.$set(product, 'isFavourite', true); // Mise à jour de l'état
      this.$forceUpdate(); // Forcer le re-rendu
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout aux favoris:', error);
  }
},

async removeFromFavourite(productId) {
  try {
    await favouriteService.removeFavourite(productId);
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.$set(product, 'isFavourite', false); // Mise à jour de l'état
      this.$forceUpdate(); // Forcer le re-rendu
    }
  } catch (error) {
    console.error('Erreur lors du retrait des favoris:', error);
  }
}


,
async loadProducts() {
  try {
    const response = await productService.getAllProducts();
    this.products = response.data;
    // Ajoutez le code pour gérer les favoris ici, comme dans mounted()
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
  }
},
onSelectQuantity(id, quantity) {
    const product = this.products.find(p => p.id === id);
    if (product) {
      product.selectedQuantity = quantity;
    }
  },
    getImageUrl(imageUrl) {
      return `http://localhost:8000/${imageUrl}`;
    },
    async handleProductClick(productId) {
      // Appelle la méthode pour enregistrer le clic sur le produit
      await this.registerProductClick(productId);

      // Vous pouvez également effectuer d'autres actions, comme rediriger vers une page de détails du produit
      // this.$router.push({ name: 'ProductDetails', params: { id: productId } });
    },
    async registerProductClick(productId) {
      try {
        // Enregistre le clic sur le produit en appelant le service
        await productService.registerProductClick(productId);
        console.log(`Product click registered for product ID: ${productId}`);
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du clic sur le produit:', error);
      }
    },
  },
};
</script>


<style lang="scss" scoped>
.detail {
  @apply flex flex-col lg:flex-row m-5 shadow-2xl;

  .img-wrapper {
    flex: 1;

    img {
      @apply lg:rounded-none lg:rounded-tl-2xl lg:rounded-bl-2xl;
    }
  }

  .text-wrapper {
    flex: 2;
  }
}
</style>
