<template>
  <div>

    <div class="w-1/5 bg-gray-800 text-white pt-3 px-4">
      <h1 class="font-semibold text-xl leading-tight">Slack Clone</h1>
      <Notification />
      <div>{{ user.email }}</div>
      <Call />
      <Information />
      <Cog />
      <Search />
      <AtSymbol />
      <Star />
    </div>

    <div>ダイレクトめっせーじ</div>
    <div v-for="user in users" :key="user.user_id">
          <span> {{ user.email }} </span>
    </div>

    <main class="overflow-y-scroll flex-grow">
      <div class="flex flex-col ml-6 h-full">
        <div class="flex-grow overflow-y-scroll">
          <p>メッセージ一覧</p>
        </div>
        <div class="border border-gray-900 rounded mb-4">
          <textarea class="w-full pt-4 pl-8 outline-none" placeholder="XXXXへのメッセージ"></textarea>
          <div class="bg-gray-100 p-2">
            <button class="bg-green-900 text-sm text-white font-bold py-1 px-2 rounded">送信</button>
          </div>
        </div>
      </div>
    </main> 


    <div class="flex-grow overflow-y-scroll">
      <div class="mt-2 mb-4 flex">
        <Avator :user="user.email" />
        <div class="ml-2">
          <div class="font-bold">{{ user.email }}</div>
          <div>初めてのメッセージ</div>
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
    }
  },
  mounted() {
    this.user = firebase.auth().currentUser;
  }
};

</script>