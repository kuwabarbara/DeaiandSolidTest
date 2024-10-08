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
  apiKey: "AIzaSyBC8CTpXym4igYcrGRIGA4nzS0gI5hzQNc",
  authDomain: "voicematch-4073d.firebaseapp.com",
  databaseURL: "https://voicematch-4073d-default-rtdb.firebaseio.com",
  projectId: "voicematch-4073d",
  storageBucket: "voicematch-4073d.appspot.com",
  messagingSenderId: "491789197839",
  appId: "1:491789197839:web:17acda3822fcfbec19397a"
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