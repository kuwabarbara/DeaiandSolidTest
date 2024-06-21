<template>
  <div>
  <div class="my-12 text-center">
    <header class="flex justify-between p-4 border-b items-center">
      <h1 class="font-semibold text-xl leading-tight">Deai</h1>
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
    <div v-if="errors.length">
      <ul class="my-4">
        <li
          v-for="(error, index) in errors"
          :key="index"
          class="font-semibold text-red-700"
        >
          {{ error }}
        </li>
      </ul>
    </div>
    <v-btn
      type="submit"
      class="text-xl w-3/5 bg-green-800 text-white py-2 rounded"
    >
      ユーザの登録
    </v-btn>
    </form>    

  </div>
  </div>



</template>

<script>
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";

export default {
  data() {
    return {
      email: "",
      password: "",
      errors: []
    };
  },
  methods: {
      registerUser() {
        firebase
          .auth()
          .createUserWithEmailAndPassword(this.email, this.password)
          .then(response => {
            const user = response.user;
            firebase
              .database()
              .ref("users")      
              .child(user.uid)
              .set({
                user_id: user.uid,
                email: user.email
              })
              .then(() => {
                this.$router.push("/");
              })
              .catch(e => {
                console.log(e);
              });
          })
          .catch(e => {
            console.log(e);
            if (e.code == "auth/email-already-in-use") {
              this.errors.push("入力したメールアドレスは登録済みです。");
            } else {
              this.errors.push(
                "入力したメールアドレスかパスワードに問題があります。"
              );
            }
          });
      }
  }
};
</script>