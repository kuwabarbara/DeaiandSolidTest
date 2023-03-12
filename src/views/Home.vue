<template>
  <div>
    <h1>Slack Clone</h1>
    <p>ログイン中</p>
    <div>
       <button class="py-1 px-4 bg-gray-800 text-white rounded" @click="signOut">サインアウト</button>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

export default {
  methods: {
    signOut() {
      firebase.auth().signOut();
      this.$router.push("/signin");
    }
  }
};
</script>