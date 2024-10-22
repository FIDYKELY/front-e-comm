<template>
  <div :class="[openModal ? 'fixed flex' : 'hidden', 'modal']">
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
            <p><strong>ID de paiement :</strong> {{ successMessage.id }}</p>
            <p><strong>Méthode de paiement :</strong> {{ successMessage.paymentMethod }}</p>
          </div>
          <div>
            <h3 class="text-xl font-bold mb-2">Produits achetés :</h3>
            <ul>
              <li v-for="product in products" :key="product.id" class="mb-2">
                {{ product.title }} - Quantité : {{ product.quantity }} - Prix unitaire : {{ product.price }} Ar
              </li>
            </ul>
            <p><strong>Total :</strong> {{ totalAmount }} Ar</p>
          </div>
          <div class="mt-5">
            <h3 class="text-xl font-bold mb-2">Suivi de livraison :</h3>
            <p>Statut de la commande : {{ deliveryStatus }}</p>
          </div>
        </div>

        <!-- Si ce n'est pas encore le checkout, afficher le panier -->
        <div v-else-if="!isCheckoutSection">
          <div class="box" v-for="product in products" :key="product.id">
            <div>
              <p>{{ product.title }} {{ product.quantity > 0 ?  ` - Quantité : ${product.quantity}` : '' }}</p>
              <p>{{ product.price }} Ar</p>
            </div>
            <button class="rounded-xl p-3 text-white bg-red" @click="removeFromCart(product.id)">{{ removeLabel }}</button>
          </div>
          <div v-if="products.length === 0">
            <p>{{ cartEmptyLabel }}</p>
          </div>
        </div>

        <!-- Section de paiement avec Stripe, affichée uniquement si le paiement n'est pas réussi -->
        <div v-else-if="isCheckoutSection && !isPaymentSuccessful">
          <div id="card-element"></div>
          <p v-if="error" class="text-red-500">{{ error }}</p>
          <p v-if="successMessage && !isPaymentSuccessful" class="text-green-500">{{ successMessage }}</p>
        </div>
      </section>

      <div class="m-4">
        <button v-show="products.length > 0 && !isCheckoutSection" class="rounded-xl p-3 bg-blue text-white w-full" @click="onNextBtn">{{ buyLabel }}</button>

        <!-- <button v-if="!isPaymentSuccessful && isCheckoutSection && products.length > 0" class="rounded-xl p-3 bg-green text-white w-full" @click="processOrder">
          Créer la commande
        </button> -->

        <button v-if="isCheckoutSection && products.length > 0 && !isPaymentSuccessful" class="rounded-xl p-3 bg-blue text-white w-full" @click="processPayment">
          Payer maintenant
        </button>
      </div>

      <div v-if="orderCreatedMessage" class="mt-4 p-3 bg-green-100 text-green-700 rounded">
        {{ orderCreatedMessage }}
      </div>
    </div>
  </div>
</template>




<script>
import { loadStripe } from '@stripe/stripe-js';
import paymentApi from '~/api/payment.js';
import deliveryApi from '~/api/delivery.js';
import orderApi from '~/api/order.js';

export default {
  name: 'checkout',
  data() {
    return {
      orderDetails: {
        cartItems: [],
        user_id: null,
        total_amount: 0,
        delivery_address: '',
        latitude: null,
        longitude: null,
      },
      orderCreatedMessage: '',
      totalAmount: 0,
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
      deliveryStatus: 'En attente de livraison',
    };
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
      return `Achetez ${totalProducts} produit${totalProducts > 1 ? 's' : ''} pour ${finalPrice} Ar`;
    },
    isUserLoggedIn() {
      return this.$store.getters.isUserLoggedIn;
    }
  },
  created() {
    if (process.client) {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            this.orderDetails.user_id = parseInt(storedUserId);
        } else {
            console.error('Aucun user_id trouvé dans le localStorage');
        }

        // Charger le panier depuis localStorage
        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        cartItems.forEach(item => {
            this.$store.commit('addToCart', item);
        });
    }
},

  methods: {
    getCartItems() {
        // Récupérez le panier depuis le localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Assurez-vous que c'est un tableau
        if (!Array.isArray(cart)) {
            console.error('Le panier n\'est pas un tableau, vérifiez le format de stockage.');
            return [];
        }

        return cart; // Retourne le tableau des articles
    },

    closeModal(reloadPage) {
      this.$store.commit('showCheckoutModal', false);
      if (reloadPage) {
        window.location.reload();
      } else if (this.isPaymentSuccessful) {
        this.clearCart();
        this.resetCheckout();
      }
    },
    clearCart() {
      this.$store.commit('clearCart');
    },
    resetCheckout() {
      this.isCheckoutSection = false;
      this.successMessage = null;
      this.isPaymentSuccessful = false;
      this.error = null;
      this.deliveryStatus = 'En attente de livraison';
      if (this.cardElement) {
        this.cardElement.clear();
      }
    },
    removeFromCart(id) {
      this.$store.commit('removeFromCart', id);
    },
    async onNextBtn() {
      if (this.isUserLoggedIn) {
        await this.processOrder(); // Créer la commande
        this.isCheckoutSection = true; // Passer à la section de paiement
        await this.initializeStripe(); // Initialiser Stripe après la création de la commande
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
    async processOrder() {
    try {
        const userId = localStorage.getItem('userId');
        const cartItems = this.getCartItems();

        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            console.error('Le panier est vide ou n\'est pas un tableau.');
            return;
        }

        const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
        const user = await orderApi.getUserData(userId);
        const userData = user.data;

        if (!userData || !userData.id || !userData.address || !userData.city || !userData.country) {
            console.error('Données utilisateur manquantes ou invalides.');
            return;
        }

        const { latitude, longitude } = await this.getCoordinates(userData.address, userData.city, userData.country);

        const orderData = {
            user_id: userData.id,
            total_amount: totalAmount,
            status: 'pending',
            delivery_address: userData.address,
            latitude,
            longitude
        };

        const response = await orderApi.createOrder(orderData);
        console.log('Commande créée avec succès:', response.data);

        // Assignez l'ID de la commande ici
        this.currentOrderId = response.data.id;

        // Vider le panier après la validation du paiement
        localStorage.removeItem('cart'); // Supprime l'élément 'cart' du localStorage
        // ou utilisez la méthode suivante pour le vider :
        // localStorage.setItem('cart', JSON.stringify([])); // Réinitialise le panier à un tableau vide

        // this.showPaymentInterface(this.currentOrderId);
    } catch (error) {
        console.error('Erreur lors de la création de la commande:', error.response ? error.response.data : error.message);
    }
},


async getCoordinates(address, city, country) {
    const formattedAddress = `${address}, ${city}, ${country}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formattedAddress)}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'YourAppName/1.0' // Remplacez par le nom de votre application
            }
        });
        const data = await response.json();

        if (data.length > 0) {
            const { lat, lon } = data[0]; // Obtenir la latitude et la longitude
            return { latitude: lat, longitude: lon };
        } else {
            console.error('Erreur lors de la récupération des coordonnées: Adresse introuvable.');
            throw new Error('Impossible d\'obtenir les coordonnées pour l\'adresse fournie.');
        }
    } catch (error) {
        console.error('Erreur lors de la requête à l\'API Nominatim:', error);
        throw error; // Rejeter l'erreur pour le bloc catch de processOrder
    }
},


async processPayment() {
    try {
        // Calculer le montant total
        const amount = this.calculateTotalAmount();

        // Créer le PaymentIntent avec l'API de paiement
        const response = await paymentApi.createPaymentIntent(amount);
        const clientSecret = response.data.clientSecret;

        // Récupérer l'ID utilisateur depuis localStorage
        const userId = localStorage.getItem('userId');
        if (!userId) {
            throw new Error("User ID not found in localStorage");
        }

        // Confirmer le paiement avec Stripe
        const { paymentIntent, error } = await this.stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: this.cardElement,
                billing_details: {}, // Tu peux ajouter les détails de facturation ici
            },
        });

        // Vérifier s'il y a eu une erreur lors de la confirmation du paiement
        if (error) {
            console.error("Erreur lors de la confirmation du paiement :", error);
            this.error = "Le paiement a échoué. Veuillez réessayer.";
            return;
        }

        // Préparer les données de paiement à stocker
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

        // Stocker les détails de paiement dans la base de données
        await paymentApi.storePaymentDetails(paymentData);

        // Vérifiez si currentOrderId est défini
        if (!this.currentOrderId) {
            console.error('Order ID is not defined. Cannot assign delivery.');
            this.error = "L'ID de la commande n'est pas défini. Veuillez réessayer.";
            return;
        }

        // Assigner la livraison
        const deliveryResponse = await deliveryApi.assignDelivery(this.currentOrderId);
        if (deliveryResponse.status !== 200) {
            throw new Error("Erreur lors de l'assignation du livreur");
        }

        // Afficher le récapitulatif du paiement
        this.showPaymentSummary(paymentIntent);

        // Mettre à jour l'état pour cacher l'input de la carte
        this.isPaymentSuccessful = true;

    } catch (error) {
        console.error('Erreur lors du traitement du paiement ou de la livraison:', error);
        this.error = "Erreur lors du paiement ou de l'assignation de la livraison. Veuillez réessayer.";
    }
},

showPaymentSummary(paymentIntent) {
    this.successMessage = {
        id: paymentIntent.id,
        amount: (paymentIntent.amount / 100).toFixed(2), // Convertir en unités monétaires
        paymentMethod: paymentIntent.payment_method,
    };
},

calculateTotalAmount() {
    let pricesArray = this.products.map(product => product.price * (product.quantity || 1));
    let finalPrice = pricesArray.reduce((a, b) => a + b, 0);
    this.totalAmount = finalPrice; // Mettez à jour totalAmount
    return finalPrice * 100; // Stripe attend les montants en centimes
},


  },
};
</script>
