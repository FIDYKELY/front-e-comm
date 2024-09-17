export const state = () => ({
  products: [
    {
      id: 1,
      title: 'Product 1',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      price: 50,
      ratings: 3,
      reviews: 5,
      isAddedToCart: false,
      isAddedBtn: false,
      isFavourite: false,
      quantity: 1
    },
    // ... autres produits
  ],
  cart: [],
  userInfo: {
    isLoggedIn: false, // Default value
    name: '' // Default value
  },
  systemInfo: {
    openLoginModal: false,
    openSignupModal: false,
    openCheckoutModal: false
  }
});

export const getters = {
  productsAdded(state) {
    return state.cart;
  },
  productsAddedToFavourite: state => state.products.filter(el => el.isFavourite),
  cartItems: state => state.cart, // Récupère tous les articles dans le panier
  cartItemCount: state => state.cart.length, // Nombre d'articles dans le panier
  getProductById: state => id => state.products.find(product => product.id == id),
  isUserLoggedIn: state => state.userInfo.isLoggedIn,
  getUserName: state => state.userInfo.name,
  isLoginModalOpen: state => state.systemInfo.openLoginModal,
  isSignupModalOpen: state => state.systemInfo.openSignupModal,
  isCheckoutModalOpen: state => state.systemInfo.openCheckoutModal,
};

export const mutations = {
  addToCart(state, product) {
    const existingProduct = state.cart.find(item => item.id === product.id);
    if (existingProduct) {
      existingProduct.quantity += product.quantity;
    } else {
      state.cart.push({ ...product });
    }
  },
  removeFromCart(state, productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
  },
  setAddedBtn(state, { id, status }) {
    state.addedButtons = { ...state.addedButtons, [id]: status };
  },
  // removeFromCart(state, productId) {
  //   state.cart = state.cart.filter((item) => item.id !== productId);
  // },
  addToFavourite: (state, id) => {
    state.products.forEach(el => {
      if (id === el.id) {
        el.isFavourite = true;
      }
    });
  },
  removeFromFavourite: (state, id) => {
    state.products.forEach(el => {
      if (id === el.id) {
        el.isFavourite = false;
      }
    });
  },
  quantity(state, { id, quantity }) {
    const cartItem = state.cart.find((item) => item.id === id);
    if (cartItem) {
      cartItem.quantity = quantity;
    }
  },
  SET_USER(state, authUser) {
    state.userInfo = authUser;
  },
  showLoginModal(state, payload) {
    state.systemInfo.openLoginModal = payload;
  },
  showSignupModal(state, payload) {
    state.systemInfo.openSignupModal = payload;
  },
    showCheckoutModal(state, payload) {
      state.systemInfo.openCheckoutModal = payload;
      // Remettre à faux le succès de paiement si le modal est fermé
      if (!payload) {
        state.isPaymentSuccessful = false;
      }
    },
    resetCart(state) {
      state.cart = []; // Vide la liste des produits dans le panier
    }
  ,
  resetCart(state) {
    state.cart = []; // Vide la liste des produits dans le panier
  }
};

// Actions to handle side-effects or async logic
export const actions = {
  addProductToCart({ commit }, product) {
    commit('addToCart', product);
  },
  nuxtServerInit({ commit }) {
    // Only run on client-side (browser)
    if (process.client) {
      const authToken = localStorage.getItem('authToken');
      const userName = localStorage.getItem('userName');

      commit('SET_USER', {
        isLoggedIn: !!authToken,
        name: userName || ''
      });
    }
  }
};
