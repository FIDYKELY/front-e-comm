<template>
  <div>
    <div
      v-for="product in products"
      :key="product.id"
      :class="[detail ? 'detail' : '']"
      class="rounded-2xl shadow-custom bg-white p-4"
    >
      <div class="img-wrapper rounded-t-2xl">
        <nuxt-link :to="{ name: 'product_detail-id', params: { id: product.id } }">
          <img v-if="product.image_url" :src="getImageUrl(product.image_url)" alt="Image du produit" class="rounded-2xl" />
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
            <select class="p-2 border-2 rounded-2xl" @change="onSelectQuantity(product.id)" v-model="selected">
              <option v-bind:key="quantity" v-for="quantity in quantityArray" :value="quantity">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import productService from '~/api/products';

export default {
  name: 'products',
  props: ['detail'],
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
    } catch (error) {
      console.error('Erreur lors de la récupération des produits :', error);
    }

    for (let i = 1; i <= 20; i++) {
      this.quantityArray.push(i);
    }
  },
  methods: {
    addToCart(productId) {
    console.log('Add to cart clicked for product ID:', productId); // Log product ID
    const product = this.products.find(p => p.id === productId);
    console.log('Product found:', product); // Log product details
    if (product) {
      const cartItem = {
        id: product.id,
        name: product.product_name,
        price: product.price,
        quantity: this.selected, // Utiliser la quantité sélectionnée
        image_url: product.image_url
      };
      console.log('Cart item:', cartItem); // Log cart item
      // Commiter l'ajout au panier
      this.$store.commit('addToCart', cartItem);
      product.isAddedToCart = true; // Mettre à jour le statut
    } else {
      console.error('Product not found'); // Log error if product is not found
    }
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
    getImageUrl(imageUrl) {
      return `http://localhost:8000/${imageUrl}`;
    }
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
