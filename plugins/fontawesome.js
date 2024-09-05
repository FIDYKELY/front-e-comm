import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faStar, faStarHalfAlt, faStarOfDavid } from '@fortawesome/free-solid-svg-icons';

library.add(faStar, faStarHalfAlt, faStarOfDavid);

Vue.component('font-awesome-icon', FontAwesomeIcon);
