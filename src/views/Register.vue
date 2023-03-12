<template>
  <div>
    <header class="flex justify-between p-4 border-b items-center">
      <h1 class="font-semibold text-xl leading-tight">Slack Clone</h1>
      <button class="py-1 px-4 border-2 border-green-800 rounded">
        <router-link to="/signin">サインイン</router-link>
      </button>
    </header>
    <div class="bg-gray-100">ユーザ登録部</div>
    
    <h2 class="text-4xl font-bold">ユーザの登録</h2>
    <p class="my-4">
    <span class="font-semibold">メールアドレス</span>と
    <span class="font-semibold">パスワード</span>を入力してください。
    </p>

    <form @submit.prevent="registerUser"><div class="mb-2">
        <input
        type="email"
        v-model="email"
        placeholder="you@example.com"
        class="text-xl w-3/5 p-3 border rounded"
        />
    </div>
    <div class="mb-2">
        <input
        type="password"
        v-model="password"
        class="text-xl w-3/5 p-3 border rounded"
        placeholder="パスワード"
        />
    </div>
    <button type="submit" class="text-xl w-3/5 bg-green-800 text-white py-2 rounded">ユーザの登録</button>
    </form>
    


  </div>



</template>

<script>
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

export default {
  data() {
    return {
      email: "",
      password: ""
    };
  },
  methods: {
    registerUser() {
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.email, this.password)
        .then(response => {
          console.log(response);
        })
        .catch(e => {
          console.log(e);
        });
    }
  }
};
</script>