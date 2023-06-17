<template>
  <div class="tabs">

    <v-app-bar color="primary" dark>
      <div class="w-1/5 bg-gray-800 text-white pt-3 px-4">
        <h1 class="font-semibold text-xl leading-tight">Deai</h1>
      </div>
    </v-app-bar>

    <b>{{ user.name }}がログイン中</b>

    <div class="tab-header">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        class="tab"
        :class="{ active: activeTab === index }"
        @click="activeTab = index"
      >
        <span>{{ tab }}</span>
      </div>
    </div>

    <div class="container">
      <v-spacer/>
      <v-spacer/>

      <div>
        <b>私について</b><br>
        <v-img 
            width="120"
            height="80"
            :src=user.img_url
            :contain="true"></v-img> <br>
        <span class="opacity-50" @click="directMessage(user)">名前：{{ user.name }}</span><br>
        <span>性別：{{user.gender}}</span><br>
        <span>メールアドレス：{{user.email}}</span><br>
        <span>ステータスコメント：{{user.status}}</span><br>

        <span> {{univName}} 学生です </span>
      </div>
      <v-spacer/>
        <v-row justify="center">
          <v-img class="rounded-circle" src="/image/無題.png" height="300" width="300" :contain="true" />
        </v-row>
      <v-spacer/>
    </div>

    <div class="tab-content">
      <template v-if="activeTab === 0">
        <h1>  {{univName}}コミュニティのユーザー一覧</h1>
        <div class="container">
          <div class="mt-2 flex items-center" v-for="useruser in users" :key="useruser.user_id">
            <div v-if="useruser.gender === user.gender">
            </div>
            <div v-else-if="mailDomain==extractDomain(useruser.email)">
              <v-img 
                  width="120"
                  height="80"
                  :src=useruser.img_url
                  :contain="true"></v-img> <br>
              <!-- <Avator :user=useruser.email /> -->
              <span class="opacity-50" @click="directMessage(useruser)">名前：{{ useruser.name }}</span><br>
                <div>
                  <div v-if="useruser.gender">
                    性別：{{useruser.gender}}
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
        <p>メッセージの送信をしたいユーザーの名前を上でクリックしてね</p>
        <hr>
        <b>チャット</b>

        <div>

          <div>
            <span style="font-weight: bold">ここにメッセージを書く: </span>
            <!-- <input type="text" v-model="receiverId" title="Input the ID from receive.html"> -->
            <textarea autofocus
                rows="5" cols="50"
                class="w-full pt-4 pl-8 outline-none"
                :placeholder="placeholder"
                v-model="inputMessage"
              ></textarea>
            <v-btn @click="connect">送信</v-btn>
          </div>

          <div class="text-left">
            <v-container class="conversation-container">
              <v-card class="conversation-card">
                <div class="ml-2">
                  <v-label :style="{ backgroundColor: 'blue', color: 'white' }">{{ p2pmsg }}</v-label>
                </div>
              </v-card>
            </v-container>
          </div>


          <h2>Receiver</h2>
          <div id="status">{{ statusMessage }}</div>
        </div>




<!--        
        <hr>
            <div class="mt-2 mb-4 flex" v-for="message in messages" :key="message.key">
              <div v-if="message.user===user.name">
                <div class="text-left">
                  <v-container class="conversation-container">
                  <v-card class="conversation-card">
                    <div class="ml-2">
                      <div class="font-bold">{{ message.user }}</div>
                      <v-label :style="{ backgroundColor: 'blue', color: 'white' }">{{ message.content }}</v-label>
                    </div>
                  </v-card>
                  </v-container>
                </div>
              </div>
              <div v-else>
                  <div class="text-right">
                    <v-container class="conversation-container">
                      <v-card class="conversation-card right-align">
                        <div class="ml-2">
                          <v-card-text>
                            <div class="font-bold">{{ message.user }}</div>
                            <v-label :style="{ backgroundColor: 'blue', color: 'white' }">{{ message.content }}</v-label>
                          </v-card-text>
                        </div>
                        </v-card>
                    </v-container>
                  </div>
              </div>
            </div>
        <hr>
      -->
      <!--
        <main class="overflow-y-scroll flex-grow">
          <div class="flex flex-col ml-6 h-full">
            <div class="flex-grow overflow-y-scroll">              
            </div>
            <div class="border border-gray-900 rounded mb-4">
              <textarea autofocus
                rows="5" cols="50"
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
      -->


        <div class="flex-grow overflow-y-scroll">

          <div class="mt-2 mb-4 flex">
            <div class="ml-2">
              <div>{{ message }}</div>
            </div>
          </div>

        </div>

        <div>
          <v-btn v-on:click="generateMessage">返信考えてくれるボタン</v-btn>
            <v-container class="conversation-container">
              <v-card class="conversation-card">
                <div class="ml-2">
                  候補5 {{kaiwa}}
                </div>
              </v-card>
              <v-card class="conversation-card">
                <div class="ml-2">
                  候補4 {{kaiwa2}}
                </div>
              </v-card>

              <v-card class="conversation-card">
                <div class="ml-2">
                  候補3 {{kaiwa3}}
                </div>
              </v-card>
              <v-card class="conversation-card">
                <div class="ml-2">
                  候補2 {{kaiwa4}}
                </div>
              </v-card>
              <v-card class="conversation-card">
                <div class="ml-2">
                  候補1 {{kaiwa5}}
                </div>
              </v-card>

            </v-container>
        </div>

        <br>

        <div>
          <v-btn class="py-1 px-4 bg-gray-800 text-white rounded" @click="signOut">サインアウト</v-btn>
        </div>

      </template>

      <template v-if="activeTab === 1">
        <h1>情報登録（名前は後から変更不可）</h1>
        <form @submit.prevent="saveUserData">
          <v-label for="name">名前：</v-label>
          <input type="text" id="name" v-model="userData.name" required>
          <br>
          <v-label for="gender">性別：</v-label>
          <select id="gender" v-model="userData.gender" required>
            <option value="男性">男性</option>
            <option value="女性">女性</option>
          </select>
          <br>
          <v-label for="status">ステータスコメント：</v-label>
          <input type="text" id="status" v-model="userData.status">
          <br>
          <v-btn type="submit">保存</v-btn>
        </form>    

        <hr>

        <div>
          <h2>時間割を入力してね</h2>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Mon</th>
                <th>Tue</th>
                <th>Wed</th>
                <th>Thu</th>
                <th>Fri</th>                
                <th>Sat</th>
                <th>Sun</th>

              </tr>
            </thead>
            <tbody>
              <tr v-for="(classes, index) in timetable" :key="index">
                <td style="display: inline-block; white-space: nowrap;">{{ index + 1 }}限 </td>
                <td v-for="(classData, day) in classes" :key="day">
                  <input type="text" :value="classData" @input="updateClassData(index, day, $event.target.value)">
                </td>
              </tr>
            </tbody>
          </table>
          <v-btn @click="saveTimetable">Save</v-btn>
        </div>


        <hr>

        <div>
          <v-btn class="py-1 px-4 bg-gray-800 text-white rounded" @click="signOut">サインアウト</v-btn>
        </div>

      </template>

      <template v-if="activeTab === 2">
        <form @submit.prevent="uploadImage">
          <input type="file" @change="onFileChange">
          <v-btn type="submit">プロフィール写真をアップロード</v-btn>
        </form>

        <div>
          <v-btn class="py-1 px-4 bg-gray-800 text-white rounded" @click="signOut">サインアウト</v-btn>
        </div>
      </template>
    </div>
  </div>
</template>

<style>
  .tab span {
    display: inline-block;
    padding: 5px 10px;
    background-color: #ccc;
    border-radius: 5px;
  }
  .tab-header {
    display: flex;
    justify-content: space-between;
  }

  .tab {
    flex: 1;
    text-align: center;
  }
  .conversation-container {
    display: flex;
    flex-direction: column-reverse;
    padding: 20px;
  }

  .conversation-card {
    background-color: #fff;
    border-radius: 20px;
    box-shadow: 0px 0px 10px #ccc;
    margin-bottom: 10px;
    padding: 10px;
    width: fit-content;
  }

  .conversation-card.right-align {
    align-self: flex-end;
  }

  .conversation-card .v-card-title {
    padding: 0;
  }

  .conversation-card .v-icon {
    font-size: 18px;
    margin-right: 5px;
  }
  .container {
    display: flex; /* 横並びにするためにflexboxを使用 */
  }
  .item {
    width: 100px; /* アイテムの幅を指定 */
    height: 100px; /* アイテムの高さを指定 */
    background-color: gray; /* アイテムの背景色を指定 */
    margin-right: 10px; /* アイテムの間に余白を指定 */
  }
  .rounded-circle {
  border-radius: 100%;
  }
</style>


<script>
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import 'firebase/compat/database';

import Peer from 'peerjs';
//import Notification from "../components/icons/Notification";
//import Search from "../components/icons/Search";
//import Star from "../components/icons/Star";
//import Cog from "../components/icons/Cog";
//import Call from "../components/icons/Call";
//import Information from "../components/icons/Information";
//import AtSymbol from "../components/icons/AtSymbol";
//import Avator from "../components/Avator";


export default {
  name: 'MyComponent', // コンポーネントの名前を指定する
  data() {
    return {
      receiverId: '',
      statusMessage: 'Waiting for connection...',
      lastPeerId: null,
      peer: null,
      conn: null,
      msgContent: 'kuwaxkuwax',
      inputMessage: '',

      timetable: [
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" }
      ],
      kaiwa: "",
      kaiwa2: "",
      kaiwa3: "",
      kaiwa4: "",
      kaiwa5: "",

      p2pmsg: "",

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
        email: '',
        img_url : ''
      },
      dialog: false,
      tabs: ['チャットルーム', '情報登録', 'プロフィール写真'],
      activeTab: 0,
      mailDomain: "",
      univName: "",
      univWebPage: ""
      
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
    //Avator
  },
  created(){
    this.timetable = [
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" }
      ]
    // 現在認証されているユーザーのUIDを取得する
    const uid = firebase.auth().currentUser.uid;

    // Realtime Databaseの参照を作成する
    const dbRef = firebase.database().ref(`users/${uid}`);

    // データを取得する
    dbRef.once('value').then((snapshot) => {
      const userData = snapshot.val(); // データをオブジェクト形式で取得する
      const gender = userData.gender; // genderを取得する
      const name = userData.name; // nameを取得する
      const status = userData.status; // statusを取得する


      // 取得したデータを使用する
      console.log(`gender: ${gender}, name: ${name}`);
      this.user.gender=gender
      this.user.name=name
      this.user.img_url=userData.img_url
      this.user.status=status
      this.mailDomain=this.extractDomain(userData.email)

      const domain = this.mailDomain; // 取得したい大学のドメイン名
      this.getUniversityInfo(domain)
        .then((result) => {
          const universityName = result.universityName;
          const universityWeb = result.universityWeb;
          console.log("ううううう"+universityName)
          console.log("ええ"+universityWeb+"けけ");
          this.univName=universityName;
          this.univWebPage=universityWeb
        })
        .catch((error) => {
          console.error(error);
        });


        // Firebase Realtime Databaseからデータを取得する
        firebase.database().ref('timetables').child(uid).once('value')
          .then((snapshot) => {
            // 取得したデータをVue.jsのデータに代入する
            const data = snapshot.val();
            for (let i = 0; i < 10; i++) {
              for (let day in data[i]) {
                const index = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].indexOf(day);
                if (index >= 0) {
                  this.timetable[i][index] = data[i][day];
                }
              }
            }
          })
          .catch((error) => {
            console.error(error);
          });


    });

  },
  methods: {
    initialize() {
      this.peer = new Peer(null, { debug: 2 });

      this.peer.on('open', (id) => {
        if (this.peer.id === null) {
          console.log('Received null id from peer open');
          this.peer.id = this.lastPeerId;
        } else {
          this.lastPeerId = this.peer.id;
        }
        console.log('ID: ' + this.peer.id);
        console.log('aaa: ' + id);


        var uid = firebase.auth().currentUser.uid;
        var peerid = this.peer.id;

        // ユーザーのデータへの参照を取得
        var userRef = firebase.database().ref('users/' + uid);

        // 既存のデータを読み取る
        userRef.once('value', function(snapshot) {
            var userData = snapshot.val();

            // 新しいデータを追加
            userData.peerid = peerid;

            // 更新したデータを書き込む
            userRef.set(userData);
        });

      });

      this.peer.on('connection', (c) => {
        if (this.conn && this.conn.open) {
          c.on('open', () => {
            c.send('Already connected to another client');
            setTimeout(() => c.close(), 500);
          });
          return;
        }

        this.conn = c;
        console.log('Connected to: ' + this.conn.peer);
        this.statusMessage = 'Connected';

        this.receiverId=this.conn.peer;

        this.ready();
      });

      this.peer.on('disconnected', () => {
        this.statusMessage = 'Connection lost. Please reconnect';
        console.log('Connection lost. Please reconnect');
        this.peer.id = this.lastPeerId;
        this.peer._lastServerId = this.lastPeerId;
        //this.peer.reconnect();
      });

      this.peer.on('close', () => {
        this.conn = null;
        this.statusMessage = 'Connection destroyed. Please refresh';
        console.log('Connection destroyed');
      });

      this.peer.on('error', (err) => {
        console.log(err);
        alert('' + err);
      });
    },

    ready() {
      this.conn.on('data', (data) => {
        console.log('Data received:');
        console.log(data);
        this.p2pmsg=data;
      });

      this.conn.on('close', () => {
        this.conn = null;
      });
    },

    join() {
      if (this.conn) {
        this.conn.close();
      }

      

      this.conn = this.peer.connect(this.receiverId, { reliable: true });

      this.conn.on('open', () => {
        
        console.log('Connected to: ' + this.conn.peer);
        this.statusMessage = 'Connected';
        //this.conn.send(this.msgContent);
        this.conn.send(this.user.name+"さんからのメッセージ： "+ this.inputMessage); // テキストボックスの内容を送信する
      });
    },

    connect() {
      this.join();
    },
    updateClassData(index, day, value) {
      this.timetable[index][day] = value;
    },
    saveTimetable() {
      const user_id = firebase.auth().currentUser.uid
      const db = firebase.database()

      // Firebase Realtime Databaseに時間割データを保存する
      db.ref(`timetables/${user_id}`).set(this.timetable)
        .then(() => console.log('Timetable saved!'))
        .catch(error => console.error('Error saving timetable:', error));


      
    },
    async getUniversityInfo(domain) {
      const url = `http://universities.hipolabs.com/search?domain=${domain}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.length > 0) {
        const universityName = data[0].name;
        const universityWeb = data[0].web_pages[0];

        
        return { universityName, universityWeb };
      } else {
        throw new Error("No university found for the given domain");
      }
    },
    async blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result.split(",")[1];
          resolve(base64data);
        };
        reader.onerror = () => {
          reject(new Error("Failed to convert blob to base64"));
        };
      });
    },
    getStringAfterColon(str) {
      const index = str.indexOf(':');
      if (index === -1) {
        return str;
      }
      return str.substring(index + 1);
    },

    generateMessage(){
      var kaiwa=""
      for(var i=0; i<this.messages.length; i++){
        kaiwa+=this.messages[i].user+": "+this.messages[i].content+"\n"
      }

      var apiKey=process.env.openAI

      // GPT-3による返信の生成
      fetch("https://api.openai.com/v1/engines/davinci/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          prompt: kaiwa,
          max_tokens: 50,
          n: 5, // 生成される返信の数
          temperature: 0.7 // 返信の多様性
        })
      })
      .then(response => response.json())
      .then(data => {
        const choices = data.choices;
        const replies = [];
        for(let i=0; i<choices.length; i++){
          const reply = choices[i].text.trim();
          replies.push(reply.split("\n")[0]);
        }
        console.log(replies); // 複数の候補を表示
        this.kaiwa = this.getStringAfterColon(replies[0]); // 1番目の候補を使用する
        this.kaiwa2 = this.getStringAfterColon(replies[1]); // 1番目の候補を使用する
        this.kaiwa3 = this.getStringAfterColon(replies[2]); // 1番目の候補を使用する
        this.kaiwa4 = this.getStringAfterColon(replies[3]); // 1番目の候補を使用する
        this.kaiwa5 = this.getStringAfterColon(replies[4]); // 1番目の候補を使用する

      })
      .catch(error => {
        console.error(error);
      });
    },
    extractDomain(email) {
      // '@'の位置を探す
      const atIndex = email.indexOf('@');
      
      // ドメインを含まない場合はnullを返す
      if (atIndex === -1) {
        return null;
      }
      
      // '@'以降の文字列を抽出する
      const domain = email.slice(atIndex + 1);
      
      // ドメインを返す
      return domain;
    },    
    getUserImage(userId) {
      const storage = firebase.storage()
      const userImageRef = storage.ref().child(`users/${userId}/profile.jpg`)
      const url = userImageRef.getDownloadURL()
      console.log("あ"+url+"あ")
      return url
    },
    saveUserData() {
      // Firebase Authenticationで認証されたユーザーのIDを取得する
      const user_id = firebase.auth().currentUser.uid

      // ユーザーデータにユーザーIDを追加する

      //名前の変更を不可能にする
      if(this.user.name!=null){
        this.userData.name=this.user.name
      }

      var x = ""
      if(this.user.img_url!=null){
        x=this.user.img_url
      }

      this.userData.img_url=x

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
    async uploadImage() {
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

      const db = firebase.database()
      const usersRef = db.ref('users')
      const userId = uid // ユーザーID

      const storage = firebase.storage()
      const userImageRef = storage.ref().child(path)
      const url = await userImageRef.getDownloadURL()
      console.log(url)
      const img_url = url // 追加するimg_urlの値

      // ユーザーの情報を取得して更新する
      usersRef.child(userId).once('value', snapshot => {
        const userData2 = snapshot.val()
        if (userData2) {
          userData2.img_url = img_url // img_urlを追加
          usersRef.child(userId).set(userData2) // 更新したユーザー情報をデータベースに保存
          this.user.img_url=img_url
        }
      })


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
      console.log("directmessageをクリック"+user.peerid)
      this.receiverId= user.peerid;


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
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/peerjs@1.3.1/dist/peerjs.min.js';
    //script.onload = () => {
      //this.connectButton.disabled = false;
    //};
    document.head.appendChild(script);

    this.user = firebase.auth().currentUser;

    
    this.initialize();

    firebase
      .database()
      .ref("users")
      .on("child_added", snapshot => {
        this.users.push(snapshot.val());
      });


      console.log(this.users);



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