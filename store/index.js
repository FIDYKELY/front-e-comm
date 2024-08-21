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
  userInfo: {
    isLoggedIn: false,
    isSignedUp: false,
    name: '',
  },
  systemInfo: {
    openLoginModal: false,
    openSignupModal: false,
    openCheckoutModal: false
  }
});

export const getters = {
  productsAdded: state => state.products.filter(el => el.isAddedToCart),
  productsAddedToFavourite: state => state.products.filter(el => el.isFavourite),
  getProductById: state => id => state.products.find(product => product.id == id),
  isUserLoggedIn: state => state.userInfo.isLoggedIn,
  getUserName: state => state.userInfo.name,
  isLoginModalOpen: state => state.systemInfo.openLoginModal,
  isSignupModalOpen: state => state.systemInfo.openSignupModal,
  isCheckoutModalOpen: state => state.systemInfo.openCheckoutModal,
};

export const mutations = {
  addToCart: (state, id) => {
    state.products.forEach(el => {
      if (id === el.id) {
        el.isAddedToCart = true;
      }
    });
  },
  setAddedBtn: (state, data) => {
    state.products.forEach(el => {
      if (data.id === el.id) {
        el.isAddedBtn = data.status;
      }
    });
  },
  removeFromCart: (state, id) => {
    state.products.forEach(el => {
      if (id === el.id) {
        el.isAddedToCart = false;
      }
    });
  },
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
  quantity: (state, data) => {
    state.products.forEach(el => {
      if (data.id === el.id) {
        el.quantity = data.quantity;
      }
    });
  },
  SET_USER(state, authUser) {
    state.userInfo = authUser;
  }
};
