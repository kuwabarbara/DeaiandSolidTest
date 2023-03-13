<template>
  <div>

    <div class="w-1/5 bg-gray-800 text-white pt-3 px-4">
      <h1 class="font-semibold text-xl leading-tight">Slack Clone</h1>
      <Notification />
      <div>{{ user.email }}</div>
    </div>

    <p>ログイン中</p>
    <div>
       <button class="py-1 px-4 bg-gray-800 text-white rounded" @click="signOut">サインアウト</button>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import Notification from "../components/icons/Notification";

export default {
  components: {
    Notification
  },
  methods: {
    signOut() {
      firebase.auth().signOut();
      this.$router.push("/signin");
    }
  },
  mounted(){
    this.user = firebase.auth().currentUser;
  }
};
</script>