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

    <div>ユーザー一覧</div>
    <div class="mt-2 flex items-center" v-for="user in users" :key="user.user_id">
      <Avator :user=user.email />
      <span class="opacity-50" @click="directMessage(user)">{{ user.email }}</span><br> 
      <button @click="goToPage('users/'+user.user_id)">この人の詳細画面へ</button>
    </div>
    <div>ーーーーーーーーーー</div>


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

    <hr>
        <div class="mt-2 mb-4 flex" v-for="message in messages" :key="message.key">
          <Avator :user="message.user" />
          <div class="ml-2">
            <div class="font-bold">{{ message.user }}</div>
            <div>{{ message.content }}</div>
          </div>
        </div>
    <hr>

    <p>ログイン中</p>

    <form @submit.prevent="uploadImage">
      <input type="file" @change="onFileChange">
      <button type="submit">アップロード</button>
    </form>

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
      messages: [],
      placeholder: "",
      channels: [],
      channel_id: ""
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
    goToPage(pageName) {
      this.$router.push({ path: '/' + pageName })
    },
    
    // ファイルが選択された時に呼ばれるメソッド
    onFileChange(event) {
      this.file = event.target.files[0];
    },
    // ファイルをアップロードするメソッド
    uploadImage() {
      const storageRef = firebase.storage().ref();

      // ユーザーのUIDとファイル名
      const uid = this.user.uid;
      const fileName = "profile.jpg";

      // Storageに画像をアップロードする
      const path = `users/${uid}/${fileName}`;
      const fileRef = storageRef.child(path);
      fileRef.put(this.file).then(() => {
        console.log("アップロードが完了しました。");
      });
    },

    signOut() {
      firebase.auth().signOut();
      this.$router.push('/signin');
    },
    sendMessage() {
      const newMessage = firebase
        .database()
        .ref("messages")
        .child(this.channel_id)
        .push();

      const key_id = newMessage.key;

      newMessage.set({
        key: key_id,
        content: this.message,
        user: this.user.email,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });

      this.message = "";
    },
    directMessage(user) {
      this.messages = [];

      this.user.uid > user.user_id
        ? (this.channel_id = this.user.uid + "-" + user.user_id)
        : (this.channel_id = user.user_id + "-" + this.user.uid);

      if (this.channel_id != "") {
        firebase
          .database()
          .ref("messages")
          .child(this.channel_id)
          .off();
      }

      this.channel_name = user.email;
      this.placeholder = user.email + "へのメッセージ";

      firebase
        .database()
        .ref("messages")
        .child(this.channel_id)
        .on("child_added", snapshot => {
          this.messages.push(snapshot.val());
        });
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

    firebase
      .database()
      .ref("messages")
      .child(this.channel_id)
      .off();
  }
};

</script>