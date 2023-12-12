import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import firebase from "firebase/compat/app";
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false;
 
/// .envから環境変数取り込み

//console.log(process.env.openAI)

/*const firebaseConfig = {
  apiKey: "AIzaSyCjOJEsaPMolxkOKBBp6oOEBxAgthuR4qY",
  authDomain: "vuesc-ce12f.firebaseapp.com",
  databaseURL: "https://vuesc-ce12f-default-rtdb.firebaseio.com",
  projectId: "vuesc-ce12f",
  storageBucket: "vuesc-ce12f.appspot.com",
  messagingSenderId: "339647178957",
  appId: "1:339647178957:web:68f233f8a5079879c2e184"
};*/
const firebaseConfig = {
  apiKey: "AIzaSyCNOvwEzB9RdIhPvF4rz4XaUWS4hrlzDI8",
  authDomain: "vuedeai.firebaseapp.com",
  databaseURL: "https://vuedeai-default-rtdb.firebaseio.com",
  projectId: "vuedeai",
  storageBucket: "vuedeai.appspot.com",
  messagingSenderId: "1005449856509",
  appId: "1:1005449856509:web:8e79aca4ee90e0b437c594"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

window.firebase = firebase;

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");