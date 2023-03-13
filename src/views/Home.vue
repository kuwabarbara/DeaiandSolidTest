<template>
  <div>

    <div class="w-1/5 bg-gray-800 text-white pt-3 px-4">
      <h1 class="font-semibold text-xl leading-tight">Slack Clone</h1>
      <Notification />
      <div>{{ user.email }}</div>
    </div>

    <div>ダイレクトメッセージ</div>
    <div v-for="user in users" :key="user.user_id">
          <span> {{ user.email }} </span>
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
  name: 'MyComponent', // コンポーネントの名前を指定する
  data() {
    return {
      user: '',
      users: [
        {
          user_id: 11,
          email: 'john@example.com'
        },
        {
          user_id: 12,
          email: 'kevin@test.com'
        },
        {
          user_id: 13,
          email: 'susan@test.com'
        }
      ]
    };
  },
  components: {
    Notification
  },
  methods: {
    signOut() {
      firebase.auth().signOut();
      this.$router.push('/signin');
    }
  },
  mounted() {
    this.user = firebase.auth().currentUser;
  }
};

</script>