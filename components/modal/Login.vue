<template>
  <div :class="[ openModal ? 'fixed flex' : 'hidden', 'modal' ]">
    <div class="modal-background"></div>
    <div class="modal-wrapper">
      <div class="bg-grey_light flex items-center justify-between rounded-t-2xl p-5">
        <p v-if="!isUserLoggedIn" class="text-xl">{{ modalTitle }}</p>
        <p v-if="isUserLoggedIn" class="text-xl">{{ modalTitleLoggedIn }}</p>
        <button class="delete" aria-label="close" @click="closeModal">X</button>
      </div>
      <form @submit="checkForm" action="#" method="post">
        <section class="p-5 rounded-b-2xl">
          <div v-if="!isUserLoggedIn">
            <div class="m-4">
              <input
                :class="[highlightEmailWithError ? 'input border-red' : 'input']"
                type="email"
                placeholder="youremail@email.com"
                v-model="email"
                @keyup="checkEmailOnKeyUp"
              />
              <p v-if="highlightEmailWithError" class="text-red">{{ emailRequiredLabel }}</p>
            </div>
            <div class="m-4">
              <input
                :class="[highlightPasswordWithError ? 'input border-red' : 'input']"
                type="password"
                placeholder="********"
                v-model="password"
                @keyup="checkPasswordOnKeyUp"
              />
              <p v-if="highlightPasswordWithError" class="text-red">{{ passwordRequiredLabel }}</p>
            </div>
          </div>
          <div v-if="isUserLoggedIn" class="level">
            <div class="text-center">
              <p class="title">Welcome back!</p>
              <p class="heading">Now you are logged in</p>
            </div>
          </div>
          <div class="m-4">
            <button v-if="!isUserLoggedIn" type="submit" class="rounded-xl p-3 bg-blue text-white w-full">{{ loginBtnLabel }}</button>
            <button v-if="isUserLoggedIn" type="button" class="rounded-xl p-3 bg-grey_light text-grey_dark" @click="closeModal">{{ btnLoggedInLabel }}</button>
          </div>
        </section>
      </form>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/store/auth-store';
import { isValidEmail } from '@/assets/validators';

export default {
  name: 'login',

  data() {
    return {
      modalTitle: 'Log in',
      modalTitleLoggedIn: 'Welcome!',
      loginBtnLabel: 'Log in',
      emailRequiredLabel: 'Email required',
      passwordRequiredLabel: 'Password required',
      emailNotValidLabel: 'Valid email required',
      btnLoggedInLabel: 'Close',
      email: '',
      password: '',
      highlightEmailWithError: null,
      highlightPasswordWithError: null,
    };
  },

  computed: {
    isUserLoggedIn() {
      return this.authStore.isLoggedIn;
    },
    openModal() {
      return this.$store.getters.isLoginModalOpen;
    }
  },

  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },

  methods: {
    closeModal() {
      this.$store.commit('showLoginModal', false);
    },

    async checkForm(e) {
      e.preventDefault();

      // Reset error highlights
      this.highlightEmailWithError = false;
      this.highlightPasswordWithError = false;

      // Validate input
      if (!this.email) {
        this.highlightEmailWithError = true;
        this.emailRequiredLabel = 'Email required';
      } else if (!isValidEmail(this.email)) {
        this.highlightEmailWithError = true;
        this.emailRequiredLabel = 'Valid email required';
      }

      if (!this.password) {
        this.highlightPasswordWithError = true;
        this.passwordRequiredLabel = 'Password required';
      }

      // Stop if there are validation errors
      if (this.highlightEmailWithError || this.highlightPasswordWithError) {
        return;
      }

      try {
        // Attempt login using Pinia store action
        const isAuthenticated = await this.authStore.login(this.email, this.password);

        if (isAuthenticated) {
          this.$router.push('/dashboard'); // Redirect to dashboard or another page
          this.closeModal();
        } else {
          this.highlightPasswordWithError = true;
          this.passwordRequiredLabel = 'Invalid email or password';
        }
      } catch (error) {
        console.error('Login error:', error);
        this.highlightPasswordWithError = true;
        this.passwordRequiredLabel = 'An error occurred. Please try again.';
      }
    },

    checkEmailOnKeyUp() {
      if (this.email && isValidEmail(this.email)) {
        this.highlightEmailWithError = false;
      } else {
        this.highlightEmailWithError = true;
        if (!isValidEmail(this.email)) {
          this.emailRequiredLabel = 'Valid email required';
        }
      }
    },

    checkPasswordOnKeyUp() {
      if (this.password) {
        this.highlightPasswordWithError = false;
      } else {
        this.highlightPasswordWithError = true;
      }
    }
  }
};
</script>

<style lang="scss">
  .fa-exclamation-circle {
    @apply text-red;
  }
  .fa-check {
    @apply text-green;
  }
</style>
