<template>
  <nav
    class="flex justify-between sticky top-0 bg-white z-10 shadow-md px-3"
    role="navigation"
    aria-label="main navigation"
  >
    <!-- <nuxt-link :to="{ name: 'index' }" class="navbar-item">
      <h1 class="site-title">MadagascarMarketplace</h1>
    </nuxt-link> -->
    <nuxt-link :to="{ name: 'index' }" class="navbar-item transition duration-500 ease-in-out transform hover:scale-105">
      <h1 class="site-title">MadaShop</h1>
    </nuxt-link>
    <nuxt-link :to="{ name: 'publish' }" class="navbar-item">
      <h1 class="publish">Catégories</h1>
    </nuxt-link>
    <nuxt-link :to="{ name: 'publish' }" class="navbar-item">
      <h1 class="publish">Publier un  article</h1>
    </nuxt-link>


    <div class="flex items-center">
      <div class="mx-2">
        <div class="cursor-pointer" @click="showCheckoutModal">
          <span :class="[numProductsAdded > 0 ? 'p-2 bg-blue text-white rounded-md' : '']">{{ numProductsAdded }}</span>
          <span class="icon">
            <i class="fa fa-shopping-cart"></i>
          </span>
        </div>
      </div>

      <div class="mx-2">
        <button v-if="!isUserLoggedIn" @click="onShowDropdown">
          <span class="icon">
            <i class="fa fa-user"></i>
          </span>
        </button>
        <button class="cursor-pointer" v-if="isUserLoggedIn" @click="onShowDropdown">
          Bienvenue {{ getUserName }}
        </button>
        <div v-if="showDropdown && isUserLoggedIn" class="dropdown w-52 h-28">
          <nuxt-link :to="{ name: 'user-wishlist' }" class="button text-center">
            <span class="text-lg">{{ wishlistLabel }}</span>
          </nuxt-link>
          <button @click="logout" class="button">
            <span class="text-lg">{{ logoutLabel }}</span>
          </button>
        </div>
        <div v-if="showDropdown && !isUserLoggedIn" class="dropdown">
          <button class="button" @click="showLoginModal">
            <span class="text-lg"><br /> {{ loginLabel }}</span>
            <i class="fa fa-sign-in"></i>
          </button>
          <button class="button" @click="showSignupModal">
            <span class="text-lg"><br /> {{ signupLabel }}</span>
            <i class="fa fa-user-plus"></i>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'VmHeader',
  transition: 'fade',

  data() {
    return {
      showDropdown: false,
      logoutLabel: 'Deconnexion',
      loginLabel: 'Se connecter',
      signupLabel: "S'inscrire",
      wishlistLabel: 'Wishlist',
    };
  },

  computed: {
    numProductsAdded() {
      const count = this.$store.getters.productsAdded.length;
      // console.log('Number of products in cart:', count);
      return count;
    },
    isUserLoggedIn() {
      return this.$store.getters.isUserLoggedIn;
    },
    getUserName() {
      let name = this.$store.getters.getUserName;

      return name || 'user';
    }
  },

  mounted() {
    window.addEventListener("blur", this.closeDropdown, true);
  },
  destroyed() {
    window.removeEventListener("blur", this.closeDropdown);
  },

  methods: {
    closeDropdown() {
      setTimeout(() => {
        this.showDropdown = false;
      }, 100);
    },
    showCheckoutModal() {
      this.$store.commit('showCheckoutModal', true);
    },
    showLoginModal() {
      this.$store.commit('showLoginModal', true);
    },
    showSignupModal() {
      this.$store.commit('showSignupModal', true);
    },
    onShowDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    logout() {
      this.$store.commit('SET_USER', {
        isLoggedIn: false,
        name: '',
      });
      localStorage.removeItem('authToken');
      localStorage.removeItem('userName');

      // redirect to homepage
      this.$router.push({ name: 'index' });
    },
  }
};
</script>

<style lang="scss" scoped>
  // .title {
  //   background: url('../../static/vuemmerce-logo.png') no-repeat;
  //   background-position: 50% 50%;
  //   background-size: 165px;
  // }
  .site-title {
    font-size: 1.5em;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0;
    color: #87CEEB;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}
.publish{
    font-size: 1.5em;
    font-weight: bold;
    // text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0;
    color: #5fb7da;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

  .dropdown {
    @apply absolute;
    @apply p-3;
    @apply bg-white;
    @apply right-0;
    @apply shadow-lg;
    @apply rounded-xl;
    @apply flex;
    @apply flex-col;
    @apply border-2;
    @apply border-grey_light;
  }
  .button {
    @apply w-full;
    @apply hover:bg-grey_light;
    @apply p-2;
    @apply rounded-lg;
  }
</style>
