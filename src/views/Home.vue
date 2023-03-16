<template>
  <div>
    <v-app-bar color="primary" dark>
      <div class="w-1/5 bg-gray-800 text-white pt-3 px-4">
        <h1 class="font-semibold text-xl leading-tight">Deai</h1>
      </div>
    </v-app-bar>

    <div>ユーザー一覧</div>
    <div class="container">
      <div class="mt-2 flex items-center" v-for="useruser in users" :key="useruser.user_id">
        <div v-if="useruser.gender === user.gender">
        </div>
        <div v-else>
          <!-- <Avator :user=useruser.email /> -->
          <span class="opacity-50" @click="directMessage(useruser)">{{ useruser.name }}</span><br>
            <div>
              <div v-if="useruser.gender">
                {{useruser.gender}}
              </div>
              <div v-else>
                性別なし
              </div>
            </div> 
          <v-btn @click="goToPage('users/'+useruser.user_id)">この人の詳細画面へ</v-btn>

        </div>
      </div>
    </div>


    <hr>

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
              <v-btn
                class="bg-green-900 text-sm text-white font-bold py-1 px-2 rounded"
                @click="sendMessage"
              >送信</v-btn>
            </div>
          </div>
      </div>
    </main> 


    <div class="flex-grow overflow-y-scroll">

      <div class="mt-2 mb-4 flex">
        <Avator :user="user.email" />
        <div class="ml-2">
          <div class="font-bold">{{ user.name }}</div>
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


    <h1>ユーザー情報</h1>
    <form @submit.prevent="saveUserData">
      <label for="name">名前</label>
      <input type="text" id="name" v-model="userData.name" required>
      <label for="gender">性別</label>
      <select id="gender" v-model="userData.gender" required>
        <option value="男性">男性</option>
        <option value="女性">女性</option>
      </select>
      <label for="status">ステータスコメント</label>
      <input type="text" id="status" v-model="userData.status">
      <button type="submit">保存</button>
    </form>    

    <form @submit.prevent="uploadImage">
      <input type="file" @change="onFileChange">
      <button type="submit">アップロード</button>
    </form>

    <div>
       <button class="py-1 px-4 bg-gray-800 text-white rounded" @click="signOut">サインアウト</button>
    </div>
  </div>
</template>

<style>
  .container {
    display: flex; /* 横並びにするためにflexboxを使用 */
  }
  .item {
    width: 100px; /* アイテムの幅を指定 */
    height: 100px; /* アイテムの高さを指定 */
    background-color: gray; /* アイテムの背景色を指定 */
    margin-right: 10px; /* アイテムの間に余白を指定 */
  }
</style>


<script>
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import 'firebase/compat/database';
//import Notification from "../components/icons/Notification";
//import Search from "../components/icons/Search";
//import Star from "../components/icons/Star";
//import Cog from "../components/icons/Cog";
//import Call from "../components/icons/Call";
//import Information from "../components/icons/Information";
//import AtSymbol from "../components/icons/AtSymbol";
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
      channel_id: "",
      userData: {
        name: '',
        gender: '',
        status: '',
        email: ''
      }
    };
  },
  components: {
    //Notification,
    //Search,
    //Star,
    //Cog,
    //Call,
    //Information,
    //AtSymbol,
    Avator
  },
  created(){
    // 現在認証されているユーザーのUIDを取得する
    const uid = firebase.auth().currentUser.uid;

    // Realtime Databaseの参照を作成する
    const dbRef = firebase.database().ref(`users/${uid}`);

    // データを取得する
    dbRef.once('value').then((snapshot) => {
      const userData = snapshot.val(); // データをオブジェクト形式で取得する
      const gender = userData.gender; // genderを取得する
      const name = userData.name; // nameを取得する

      // 取得したデータを使用する
      console.log(`gender: ${gender}, name: ${name}`);
      this.user.gender=gender
      this.user.name=name


    });

  },
  methods: {
    saveUserData() {
      // Firebase Authenticationで認証されたユーザーのIDを取得する
      const user_id = firebase.auth().currentUser.uid

      // ユーザーデータにユーザーIDを追加する
      this.userData.user_id = user_id

      this.userData.email=this.user.email

      // Firebase Realtime Databaseにデータを保存する
      firebase.database().ref('users').child(user_id).set(this.userData)
        .then(() => {
          console.log('データを保存しました')
          // 保存後にフォームをリセットする
          this.userData = {
            name: '',
            gender: '',
            status: ''
          }
        })
        .catch(error => {
          console.error('データの保存に失敗しました', error)
        })
    }, 

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
        user: this.user.name,
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

      this.channel_name = user.name;
      this.placeholder = user.name + "へのメッセージ";

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