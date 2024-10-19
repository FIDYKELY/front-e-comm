<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
      <h1 class="text-3xl font-bold text-center text-blue-600 mb-6">Publier un Nouvel Article</h1>
      <form @submit.prevent="submitForm" class="space-y-6">
        <div>
          <label class="block text-gray-700 text-sm font-semibold mb-2">Nom</label>
          <input
            type="text"
            v-model="article.name"
            class="input-field"
            required
            placeholder="Entrez le nom de l'article"
          />
        </div>
        <div>
          <label class="block text-gray-700 text-sm font-semibold mb-2">Description</label>
          <textarea
            v-model="article.description"
            class="input-field resize-none h-32"
            required
            placeholder="Entrez la description de l'article"
          ></textarea>
        </div>
        <div>
          <label class="block text-gray-700 text-sm font-semibold mb-2">Prix</label>
          <input
            type="number"
            v-model="article.price"
            class="input-field"
            required
            placeholder="Entrez le prix"
            min="0"
          />
        </div>
        <div>
          <label class="block text-gray-700 text-sm font-semibold mb-2">Catégorie</label>
          <select v-model="article.category" class="input-field" required>
            <option value="" disabled>Choisissez une catégorie</option>
            <option value="category1">Catégorie 1</option>
            <option value="category2">Catégorie 2</option>
            <!-- Ajoutez d'autres catégories ici -->
          </select>
        </div>
        <div>
          <label class="block text-gray-700 text-sm font-semibold mb-2">Image</label>
          <input
            type="file"
            @change="onFileChange"
            class="input-field cursor-pointer"
          />
        </div>
        <div>
          <button
            type="submit"
            class="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
          >
            Publier
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      article: {
        name: '',
        description: '',
        price: null,
        category: '',
        image: null,
      },
    };
  },
  methods: {
    onFileChange(event) {
      this.article.image = event.target.files[0];
    },
    submitForm() {
      const formData = new FormData();
      formData.append('name', this.article.name);
      formData.append('description', this.article.description);
      formData.append('price', this.article.price);
      formData.append('category', this.article.category);
      formData.append('image', this.article.image);

      axios
        .post('/api/articles', formData)
        .then((response) => {
          console.log('Article publié avec succès:', response.data);
          // Redirigez ou réinitialisez le formulaire si nécessaire
        })
        .catch((error) => {
          console.error('Erreur lors de la publication de l\'article:', error);
        });
    },
  },
};
</script>

<style scoped>
.input-field {
  border: 1px solid #d1d5db; /* gray-300 */
  border-radius: 0.375rem; /* rounded */
  padding: 0.5rem; /* p-2 */
  width: 100%;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus {
  border-color: #2563eb; /* blue-600 */
  outline: none;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.5); /* blue-600 */
}

.input-field:hover {
  border-color: #2563eb; /* blue-600 on hover */
}
</style>
