<template>
	<div :class="[ openModal ? 'fixed flex' : 'hidden', 'modal' ]">
	  <div class="modal-background"></div>
	  <div class="modal-wrapper">
		<div class="bg-grey_light flex items-center justify-between rounded-t-2xl p-5">
		  <p class="text-xl">{{ modalTitle }}</p>
		  <button class="delete" aria-label="close" @click="closeModal(false)">X</button>
		</div>
		<section class="p-5 rounded-b-2xl">
		  <div v-if="!isCheckoutSection">
			<!-- Product List -->
			<div class="box" v-for="product in products" :key="product.id">
			  <div>
				<p>{{ product.title }} {{ product.quantity > 0 ?  ` - Quantity: ${product.quantity}` : '' }}</p>
				<p>{{ product.price }} &euro;</p>
			  </div>
			  <button class="rounded-xl p-3 text-white bg-red" @click="removeFromCart(product.id)">{{ removeLabel }}</button>
			</div>
			<div v-if="products.length === 0">
			  <p>{{ cartEmptyLabel }}</p>
			</div>
		  </div>
		  <!-- Checkout Section with Stripe Card Element -->
		  <div v-if="isCheckoutSection">
			<div id="card-element">
			  <!-- Stripe Card Input Field -->
			</div>
			<p v-if="error" class="text-red-500">{{ error }}</p>
			<p v-if="successMessage">{{ successMessage }}</p>
		  </div>
		</section>
		<div class="m-4">
		  <button v-show="products.length > 0 && !isCheckoutSection" class="rounded-xl p-3 bg-blue text-white w-full" @click="onNextBtn">{{ buyLabel }}</button>
		  <button v-if="isCheckoutSection" class="rounded-xl p-3 bg-blue text-white w-full" @click="processPayment">{{ closeLabel }}</button>
		</div>
	  </div>
	</div>
  </template>

  <script>
  import { loadStripe } from '@stripe/stripe-js';

  export default {
	name: 'checkout',
	data () {
	  return {
		modalTitle: 'Checkout',
		removeLabel: 'Remove from cart',
		cartEmptyLabel: 'Your cart is empty',
		closeLabel: 'Close',
		isCheckoutSection: false,
		stripe: null,
		cardElement: null,
		error: null,
		successMessage: null,
		paymentLoading: false,
	  };
	},
	computed: {
	  products () {
		return this.$store.getters.productsAdded;
	  },
	  openModal () {
		return this.$store.getters.isCheckoutModalOpen;
	  },
	  buyLabel () {
		let totalProducts = this.products.length;
		let pricesArray = this.products.map(product => product.price * (product.quantity || 1));
		let finalPrice = pricesArray.reduce((a, b) => a + b, 0);
		return `Buy ${totalProducts} product${totalProducts > 1 ? 's' : ''} at ${finalPrice}€`;
	  },
	  isUserLoggedIn () {
		return this.$store.getters.isUserLoggedIn;
	  }
	},
	methods: {
	  closeModal (reloadPage) {
		this.$store.commit('showCheckoutModal', false);
		if (reloadPage) {
		  window.location.reload();
		}
	  },
	  removeFromCart (id) {
		let data = {
		  id: id,
		  status: false
		};
		this.$store.commit('removeFromCart', id);
		this.$store.commit('setAddedBtn', data);
	  },
	  onNextBtn () {
		if (this.isUserLoggedIn) {
		  this.isCheckoutSection = true;
		  this.initializeStripe();
		} else {
		  this.$store.commit('showCheckoutModal', false);
		  this.$store.commit('showLoginModal', true);
		}
	  },
	  async initializeStripe() {
		// Load Stripe.js and initialize the card element
		this.stripe = await loadStripe('pk_test_51NzK6iARIo3qbRy8csc4mnZYnZ8apnF5HP3UyIJOcAXKScUeP5qSQcTuvZ3vYE2FKxrVnQE9zqsZo9SsvpIVQqB700LAwbcyQb'); // Replace with your Stripe publishable key

		const elements = this.stripe.elements();
		this.cardElement = elements.create('card');
		this.cardElement.mount('#card-element');
	  },
	  async processPayment() {
		this.paymentLoading = true;

		try {
		  const { error, paymentMethod } = await this.stripe.createPaymentMethod({
			type: 'card',
			card: this.cardElement,
		  });

		  if (error) {
			this.error = error.message;
			this.paymentLoading = false;
			return;
		  }

		  const response = await this.$axios.post('http://localhost:8000/api/create-payment-intent', {
			amount: this.calculateTotalAmount(),
		  });

		  const clientSecret = response.data.clientSecret;

		  const { error: confirmError, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
			payment_method: paymentMethod.id,
		  });

		  if (confirmError) {
			this.error = confirmError.message;
		  } else if (paymentIntent.status === 'succeeded') {
			this.successMessage = 'Payment succeeded!';
		  }

		  this.paymentLoading = false;
		} catch (err) {
		  this.error = 'Payment failed, please try again.';
		  this.paymentLoading = false;
		}
	  },
	  calculateTotalAmount() {
		let pricesArray = this.products.map(product => product.price * (product.quantity || 1));
		let finalPrice = pricesArray.reduce((a, b) => a + b, 0);
		return finalPrice * 100;
	  }
	}
  };
  </script>

  <style lang="scss" scoped>
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
