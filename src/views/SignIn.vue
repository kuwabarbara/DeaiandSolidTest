<template>
  <div class="flex flex-col h-screen">
    <div v-if="showSpinner">
      <i class="fa fa-spinner fa-spin"></i> しょうしょうお待ちください…
      <br>
      <br>
      <br>
      <v-card>
        <v-row justify="center">
          <v-img src="/image/無題.png" height="300" width="400" :contain="true" />
        </v-row>
      </v-card>

    </div>
    <div v-else>
      <header class="flex justify-between p-4 border-b items-center">
        <h1 class="font-semibold text-xl leading-tight">Deai</h1>
        <button class="py-1 px-4 border-2 border-green-800 rounded">
          <router-link to="/register">Deaiをはじめる</router-link>
        </button>
      </header>
      <div class="bg-gray-100 flex-auto">
        <div class="flex justify-center mt-16">
          <div class="w-2/5 border bg-white">
            <div class="my-12 text-center">
              <h2 class="text-4xl font-bold">サインイン</h2>
              <p class="my-4">
                <span class="font-semibold">メールアドレス</span>と
                <span class="font-semibold">パスワード</span>を入力してください。
              </p>
              <form @submit.prevent="signIn">
              <div class="mb-2">
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
                  >{{ error }}</li>
                </ul>
              </div>
              <v-btn type="submit" class="text-xl w-3/5 bg-green-800 text-white py-2 rounded">サインイン</v-btn>
            </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

export default {
  data() {
    return {
      email: "",
      password: "",
      errors: [],
      showSpinner: false
    };
  },
  methods: {
    signIn() {
      this.showSpinner = true;
      firebase
        .auth()
        .signInWithEmailAndPassword(this.email, this.password)
        .then(response => {
          console.log(response);
          setTimeout(() => {
              this.showSpinner = false;
              // do something else, such as redirect to home page
              this.$router.push("/");
            }, 3000); // hide spinner after 3 seconds

        })
        .catch(() => {
          this.showSpinner = false;
          this.password = "";
          this.errors.push("メールアドレスかパスワードに誤りがあります。");
        });
    }
  }
}
</script>