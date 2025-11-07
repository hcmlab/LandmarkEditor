import 'bootstrap';
import '../static/css/base.css';
import '../static/css/bootstrap.scss';
import '../static/css/standard.css';

import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createBootstrap } from 'bootstrap-vue-next';
import ShortKey from 'vue3-shortkey';
import App from './App.vue';

const app = createApp(App);

app.use(createPinia());
app.use(createBootstrap());
app.use(ShortKey);

app.mount('#app');

// #####################################################################################################################
// INITIAL
// #####################################################################################################################
window.onload = (_) => {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isSafari) {
    alert(
      'You are using Safari. This website may not function as expected. ' +
        'Please consider using a different browser.'
    );
  }

  $('#modalSettingsModel').on('shown.bs.modal', function (_) {
    const url = localStorage.getItem('apiUrl');
    if (url) {
      $('#modelurl').val(url);
    }
  });
};
