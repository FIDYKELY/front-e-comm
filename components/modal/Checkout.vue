<template>
    <div :class="[ openModal ? 'fixed flex' : 'hidden', 'modal' ]">
      <div class="modal-background"></div>
      <div class="modal-wrapper">
        <div class="bg-grey_light flex items-center justify-between rounded-t-2xl p-5">
          <p class="text-xl">{{ modalTitle }}</p>
          <button class="delete" aria-label="close" @click="closeModal(false)">X</button>
        </div>
        <section class="p-5 rounded-b-2xl">
          <!-- Si le paiement a réussi, afficher le récapitulatif -->
          <div v-if="isPaymentSuccessful">
            <h2 class="text-2xl font-bold mb-4">Récapitulatif du paiement</h2>
            <div class="mb-4">
              <p><strong>Montant payé :</strong> {{ successMessage.amount }} €</p>
              <p><strong>ID de paiement :</strong> {{ successMessage.id }}</p>
              <p><strong>Méthode de paiement :</strong> {{ successMessage.paymentMethod }}</p>
            </div>

            <!-- Liste des produits achetés -->
            <div>
              <h3 class="text-xl font-bold mb-2">Produits achetés :</h3>
              <ul>
                <li v-for="product in products" :key="product.id" class="mb-2">
                  {{ product.title }} - Quantité : {{ product.quantity }} - Prix unitaire : {{ product.price }} €
                </li>
              </ul>
              <p><strong>Total :</strong> {{ calculateTotalAmount() / 100 }} €</p>
            </div>
          </div>

          <!-- Si ce n'est pas encore le checkout, afficher le panier -->
          <div v-else-if="!isCheckoutSection">
            <!-- Liste des produits dans le panier -->
            <div class="box" v-for="product in products" :key="product.id">
              <div>
                <p>{{ product.title }} {{ product.quantity > 0 ?  ` - Quantité : ${product.quantity}` : '' }}</p>
                <p>{{ product.price }} &euro;</p>
              </div>
              <button class="rounded-xl p-3 text-white bg-red" @click="removeFromCart(product.id)">{{ removeLabel }}</button>
            </div>
            <div v-if="products.length === 0">
              <p>{{ cartEmptyLabel }}</p>
            </div>
          </div>

          <!-- Section de paiement avec Stripe -->
          <div v-else>
            <div id="card-element"></div>
            <p v-if="error" class="text-red-500">{{ error }}</p>
            <p v-if="successMessage">{{ successMessage }}</p>
          </div>
        </section>

        <div class="m-4">
          <button v-show="products.length > 0 && !isCheckoutSection" class="rounded-xl p-3 bg-blue text-white w-full" @click="onNextBtn">{{ buyLabel }}</button>
          <button v-if="isCheckoutSection && products.length > 0 && !isPaymentSuccessful" class="rounded-xl p-3 bg-blue text-white w-full" @click="processPayment">
            Pay Now
          </button>
        </div>
      </div>
    </div>
  </template>

<script>
import { loadStripe } from '@stripe/stripe-js';
import paymentApi from '~/api/payment.js';

export default {
  name: 'checkout',
  data() {
    return {
      modalTitle: 'Checkout',
      removeLabel: 'Supprimer du panier',
      cartEmptyLabel: 'Panier vide',
      isCheckoutSection: false,
      stripe: null,
      cardElement: null,
      error: null,
      successMessage: null,
      paymentLoading: false,
      isPaymentSuccessful: false,
    };
  },
  getters: {
  productsAdded(state) {
    return state.products; // Assurez-vous que cette propriété existe dans l'état du store
  },
  // autres getters...
},

  computed: {
    products() {
      return this.$store.getters.productsAdded;
    },
    openModal() {
      return this.$store.getters.isCheckoutModalOpen;
    },
    buyLabel() {
      let totalProducts = this.products.length;
      let pricesArray = this.products.map(product => product.price * (product.quantity || 1));
      let finalPrice = pricesArray.reduce((a, b) => a + b, 0);
      return `Buy ${totalProducts} product${totalProducts > 1 ? 's' : ''} at ${finalPrice}€`;
    },
    isUserLoggedIn() {
      return this.$store.getters.isUserLoggedIn;
    }
  },
  methods: {
    closeModal(reloadPage) {
      this.$store.commit('showCheckoutModal', false);
      if (reloadPage) {
        window.location.reload();
      } else if (this.isPaymentSuccessful) {
        this.clearCart(); // Vider le panier si le paiement est réussi
        this.resetCheckout(); // Réinitialiser le checkout
      }
    },
    clearCart() {
      this.$store.commit('clearCart'); // Mutation Vuex pour vider le panier
    },
    resetCheckout() {
      // Réinitialiser toutes les variables du checkout
      this.isCheckoutSection = false;
      this.successMessage = null;
      this.isPaymentSuccessful = false;
      this.error = null;
      if (this.cardElement) {
        this.cardElement.clear(); // Réinitialiser les éléments de paiement
      }
    },
    removeFromCart(id) {
      this.$store.commit('removeFromCart', id);
    },
    async onNextBtn() {
      if (this.isUserLoggedIn) {
        this.isCheckoutSection = true;
        await this.initializeStripe(); // Attendre que Stripe soit initialisé
      } else {
        this.$store.commit('showCheckoutModal', false);
        this.$store.commit('showLoginModal', true);
      }
    },
    async initializeStripe() {
      this.stripe = await loadStripe('pk_test_51NzK6iARIo3qbRy8csc4mnZYnZ8apnF5HP3UyIJOcAXKScUeP5qSQcTuvZ3vYE2FKxrVnQE9zqsZo9SsvpIVQqB700LAwbcyQb');
      const elements = this.stripe.elements();
      this.cardElement = elements.create('card');
      this.cardElement.mount('#card-element');
    },
    async processPayment() {
    try {
      const amount = this.calculateTotalAmount();

      // Crée l'intention de paiement via l'API
      const response = await paymentApi.createPaymentIntent(amount);
      const clientSecret = response.data.clientSecret;

      const userId = localStorage.getItem('userId'); // Vérifie si l'utilisateur est connecté
      if (!userId) {
        throw new Error("User ID not found in localStorage");
      }

      // Confirme le paiement avec Stripe
      const { paymentIntent, error } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            // Ajoute les informations de facturation si nécessaire
          },
        },
      });

      if (error) {
        console.error("Erreur lors de la confirmation du paiement :", error);
        this.error = "Le paiement a échoué. Veuillez réessayer.";
        return;
      }

      // Prépare les données de paiement
      const paymentData = {
        paymentId: paymentIntent.id,
        userId: userId,
        totalAmount: amount,
        paymentMethod: paymentIntent.payment_method,
        products: this.products.map(product => ({
          productId: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
      };

      // Sauvegarde les détails du paiement dans le backend
      await paymentApi.storePaymentDetails(paymentData);

      // Affiche un résumé du paiement après succès
      this.showPaymentSummary(paymentIntent);
      this.isPaymentSuccessful = true;

    } catch (error) {
      console.error('Erreur lors du traitement du paiement:', error);
      this.error = "Erreur lors du paiement. Veuillez vérifier vos informations et réessayer.";
    }
  },

  showPaymentSummary(paymentIntent) {
    this.successMessage = {
      id: paymentIntent.id,
      amount: (paymentIntent.amount / 100).toFixed(2), // Convertir en euros
      paymentMethod: paymentIntent.payment_method,
    };
  },

    calculateTotalAmount() {
      let pricesArray = this.products.map(product => product.price * (product.quantity || 1));
      let finalPrice = pricesArray.reduce((a, b) => a + b, 0);
      return finalPrice * 100; // Stripe attend les montants en centimes
    },
    // showPaymentSummary(paymentIntent) {
    //   this.successMessage = {
    //     id: paymentIntent.id,
    //     amount: (paymentIntent.amount / 100).toFixed(2), // Convertir en euros
    //     paymentMethod: paymentIntent.payment_method,
    //   };
    // },
  }
};
</script>



  <style scoped>
    .box {
      @apply flex justify-between mb-3;
    }
    #card-element {
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 15px;
    }
  </style>
