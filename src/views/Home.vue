<template>
  <div>

    <div class="w-1/5 bg-gray-800 text-white pt-3 px-4">
      <h1 class="font-semibold text-xl leading-tight">Slack Clone</h1>
      <Notification />
      <div class="font-bold text-lg">{{ channel_name }}</div>
      <Call />
      <Information />
      <Cog />
      <Search />
      <AtSymbol />
      <Star />
    </div>

    <div>ダイレクトめっせーじ</div>
    <div v-for="user in users" :key="user.user_id">
      <span class="opacity-50" @click="directMessage(user.email)">{{ user.email }}</span>
    </div>

    <main class="overflow-y-scroll flex-grow">
      <div class="flex flex-col ml-6 h-full">
        <div class="flex-grow overflow-y-scroll">
          <p>メッセージ一覧</p>
        </div>
        <div class="border border-gray-900 rounded mb-4">
          <textarea
            class="w-full pt-4 pl-8 outline-none"
            :placeholder="placeholder"
            v-model="message"
          ></textarea>
            <div class="bg-gray-100 p-2">
              <button
                class="bg-green-900 text-sm text-white font-bold py-1 px-2 rounded"
                @click="sendMessage"
              >送信</button>
            </div>
          </div>
      </div>
    </main> 


    <div class="flex-grow overflow-y-scroll">

      <div class="mt-2 mb-4 flex">
        <Avator :user="user.email" />
        <div class="ml-2">
          <div class="font-bold">{{ user.email }}</div>
          <div>{{ message }}</div>
        </div>
      </div>

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
import 'firebase/compat/database';
import Notification from "../components/icons/Notification";
import Search from "../components/icons/Search";
import Star from "../components/icons/Star";
import Cog from "../components/icons/Cog";
import Call from "../components/icons/Call";
import Information from "../components/icons/Information";
import AtSymbol from "../components/icons/AtSymbol";
import Avator from "../components/Avator";


export default {
  name: 'MyComponent', // コンポーネントの名前を指定する
  data() {
    return {
      user: '',
      users: [],
      channel_name: '',
      message: "",
      placeholder: "",
      channels: []
    };
  },
  components: {
    Notification,
    Search,
    Star,
    Cog,
    Call,
    Information,
    AtSymbol,
    Avator
  },
  methods: {
    signOut() {
      firebase.auth().signOut();
      this.$router.push('/signin');
    },
    sendMessage() {
      console.log(this.message);
    },
    directMessage(email) {
      this.channel_name = email;
      this.placeholder = email + "へのメッセージ";
    }
  },
  mounted() {
    this.user = firebase.auth().currentUser;

    firebase
      .database()
      .ref("users")
      .on("child_added", snapshot => {
        this.users.push(snapshot.val());
      });

  },
  beforeDestroy() {
  firebase
    .database()
    .ref("users")
    .off();
  }
};

</script>