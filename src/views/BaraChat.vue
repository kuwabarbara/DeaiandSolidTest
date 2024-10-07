<template>
    <div>
    桑原
    <button @click="startLogin">Login</button>
    <br>
    <button @click="checkLogin">Check Login</button>
    <br>

    <input type="text" v-model="NameOfThePerson" placeholder="相手の名前を入力">
    <br>
    <input type="text" v-model="MyName" placeholder="自分の名前を入力">






    <input type="text" v-model="inputText" placeholder="メッセージを書いてね">
    <button @click="handleButtonClick">Submit</button>
  
    <br>

    <input type="text" v-model="chatLanguage" placeholder="チャットの言語を入力">
    <br>

    <button @click="readTodoList">Read Todo List</button>

    <br>
    読み込んだデータはこちらです
    <br>
    {{ReadData}}
    <br>
    <br>
    <button @click="accessCheck">access check</button>
    <br>
    <button @click="getOtherUserData">get Other User Data</button>

    <div>
    Podの情報を入力してね 自分のPodの名前とメンバーの名前を入力してね
    <input v-model="myPodName" placeholder="自分のユーザー名">
    <input v-model="podMembers" placeholder="メンバー(カンマ区切り)">
    <button @click="savePodInfo">保存</button>
    </div>

    <button @click="fetchPodInfo">Pod情報を取得ボタン</button>

    <br>
    <br>

    <button @click="readChat">readChat</button>

    <br>
    <br>

    <br>
    <button @click="mbtiDiagnosis">MBTI診断</button>


    <h2>予定一覧</h2>
    <ul>
      <li v-for="(item, index) in scheduleData" :key="index">
        <p>タイトル: {{ item.title }}</p>
        <p>開始日時: {{ item.startDate }}</p>
        <p>終了日時: {{ item.endDate }}</p>
      </li>
    </ul>
    <button @click="readScheduleData">予定データを読み込む</button>

    <button @click="mbtiDiagnosis2">MBTI診断2</button>

        <!-- チャットデータのフィルタリング -->
        <div>
      <h3>チャットデータのフィルタリング</h3>
      <input type="text" v-model="filterLanguage" placeholder="言語コードを入力（例: ja, en）">
      <button @click="filterChatDataByLanguage">言語でフィルタリング</button>

      <input type="text" v-model="filterSender" placeholder="送信者の名前を入力">
      <button @click="filterChatDataBySender">送信者でフィルタリング</button>
    </div>

    <!-- 予定データのフィルタリング -->
    <div>
      <h3>予定データのフィルタリング</h3>
      <input type="number" v-model="filterDuration" placeholder="最小の予定時間（時間単位）">
      <button @click="filterScheduleDataByDuration">予定の長さでフィルタリング</button>
    </div>




    </div>
</template>
  


<script>

import {  getDefaultSession } from '@inrupt/solid-client-authn-browser'
import { fetch } from '@inrupt/solid-client-authn-browser'

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import 'firebase/compat/database';


  import {
    addUrl,
    addStringNoLocale,
    createSolidDataset,
    createThing,
    getPodUrlAll,
    getSolidDataset,
    getThingAll,
    getStringNoLocale,
    //removeThing,
    saveSolidDatasetAt,
    setThing,
    addDatetime,
    getDatetime,
  } from "@inrupt/solid-client";

  import { universalAccess } from "@inrupt/solid-client";
  
  import { SCHEMA_INRUPT, RDF, AS ,FOAF,DCTERMS} from "@inrupt/vocab-common-rdf";

  import { handleIncomingRedirect, login} from '@inrupt/solid-client-authn-browser';

  import axios from 'axios';


export default {
    name: 'BaraChat',

    data() {
        return {
            loginPodUrl: '',  //ログインしているPodのURLを格納するためのデータプロパティ

            inputText: '',
            PodUrl: '',

            NameOfThePerson: '',  // 相手の名前
            MyName: '',  // 自分の名前

            myPodName: '', // Podの名前を格納するためのデータプロパティ
            podMembers: '', // Podのメンバーを格納するためのデータプロパティ（文字列）

            listcontent: '', // チャットの内容を一時的に格納するためのデータプロパティ
            chatData: [], // チャットの内容を格納するためのデータプロパティ


            apiKey: "",

            chatLanguage: 'ja', // チャットの言語を格納

            scheduleData: [], // 予定データを格納するためのデータプロパティ

            // フィルタリング条件
            filterLanguage: '',         // チャットデータの言語フィルタリング条件
            filterSender: '',           // チャットデータの送信者フィルタリング条件
            filterDuration: 0,          // 予定データの長さフィルタリング条件（時間単位）
            // フィルタリング結果を格納する配列
            filteredChatData: [],       // フィルタリングされたチャットデータ
            filteredScheduleData: [],   // フィルタリングされた予定データ
        

        };
    },
    created() {
        console.log("created");
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                console.log('User is signed in');


                // 現在認証されているユーザーのUIDを取得する
                const uid = firebase.auth().currentUser.uid;

                console.log("uidを読み取る");

                console.log(uid);

                this.completeLogin();

                // Realtime Databaseの参照を作成する
                const dbRef = firebase.database().ref(`users/${uid}`);

                // データを取得する
                dbRef.once('value').then((snapshot) => {
                    const userData = snapshot.val(); // データをオブジェクト形式で取得する
                    const gender = userData.gender; // genderを取得する
                    const name = userData.name; // nameを取得する
                    const status = userData.status; // statusを取得する

                    console.log(gender);
                    console.log(name);
                    console.log(status);
                });
            } else {
                console.log('No user is signed in');
            }
        });    
    },
    methods: {
        // チャットデータを言語でフィルタリングし、結果をコンソールに表示
        filterChatDataByLanguage() {
      if (!this.filterLanguage) {
        console.log('言語フィルタリング条件が指定されていません。');
        return;
      }

      this.filteredChatData = this.chatData.filter((item) => {
        return item.language === this.filterLanguage;
      });

      console.log('フィルタリングされたチャットデータ（言語）:', this.filteredChatData);
    },

    // チャットデータを送信者でフィルタリングし、結果をコンソールに表示
    filterChatDataBySender() {
      if (!this.filterSender) {
        console.log('送信者フィルタリング条件が指定されていません。');
        return;
      }

      this.filteredChatData = this.chatData.filter((item) => {
        return item.sender === this.filterSender;
      });

      console.log('フィルタリングされたチャットデータ（送信者）:', this.filteredChatData);
    },

    // 予定データを予定の長さでフィルタリングし、結果をコンソールに表示
    filterScheduleDataByDuration() {
      if (!this.filterDuration) {
        console.log('予定の長さのフィルタリング条件が指定されていません。');
        return;
      }

      this.filteredScheduleData = this.scheduleData.filter((item) => {
        if (item.startDate && item.endDate) {
          const durationHours = (item.endDate - item.startDate) / (1000 * 60 * 60);
          return durationHours >= this.filterDuration;
        } else {
          return false;
        }
      });

      console.log('フィルタリングされた予定データ:', this.filteredScheduleData);
    },
        

            // 予定データを読み込むメソッドを追加
    async readScheduleData() {
      console.log("readScheduleData");

      // 予定データのPodのURLを設定
      const schedulePodUrl = this.loginPodUrl+"KuwaSchedule/";

      console.log("schedulePodUrl", schedulePodUrl);

      // Make authenticated requests by passing `fetch` to the solid-client functions.
      const myDataset = await getSolidDataset(schedulePodUrl, { fetch: fetch });

      let items = getThingAll(myDataset);

      let listcontent = [];

      for (let i = 0; i < items.length; i++) {
        console.log("Processing item", i);
        let item = items[i];

        let title = getStringNoLocale(item, SCHEMA_INRUPT.name);
        console.log("title", title);

        let startDate = getDatetime(item, SCHEMA_INRUPT.startDate);
        console.log("startDate", startDate);

        let endDate = getDatetime(item, SCHEMA_INRUPT.endDate);
        console.log("endDate", endDate);

        if (title !== null) {
          console.log("Adding item to list");
          listcontent.push({
            title: title,
            startDate: startDate,
            endDate: endDate,
          });
        } else {
          console.log("No title found for item", i);
        }
      }

      console.log(listcontent);

      // 読み込んだデータをデータプロパティに保存
      this.scheduleData = listcontent;
    },


    // MBTI診断を行う（chatDataとscheduleDataの両方を使用）
async mbtiDiagnosis2() {
  console.log('ボタンがクリックされました');

  console.log('ChatGPT APIを呼び出します...');

  console.log('チャットデータ:', this.chatData);
    console.log('予定データ:', this.scheduleData);

  // .envのAPIキーを取得する
  this.apiKey = process.env.VUE_APP_OPENAI_API_KEY;

  try {
    // チャットデータと予定データを組み合わせてプロンプトを作成
    const prompt = `以下のチャットデータと予定データに基づいて、ユーザーのMBTI性格タイプを診断してください。

チャットデータ:
${this.chatData.join("\n")}

予定データ:
${this.scheduleData
  .map(
    (item) =>
      `タイトル: ${item.title}, 開始日時: ${item.startDate}, 終了日時: ${item.endDate}`
  )
  .join("\n")}

診断結果だけをアルファベット4文字で返してください。余計なものは何も含めないでお願いします。`;

    const result = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );

    const response = result.data.choices[0].message.content.trim();

    console.log('ChatGPT APIからの応答:', response);

    // 診断結果をデータプロパティに保存（必要に応じて）
    this.mbtiResult = response;

    // ユーザーに結果を表示する場合
    alert(`診断結果: ${response}`);
  } catch (error) {
    console.error('ChatGPT API呼び出しエラー:', error);
  }
},

    //MBTI診断を行う
    async mbtiDiagnosis() {
        console.log('ボタンがクリックされました');

        console.log('ChatGPT APIを呼び出します...');

        //.envのAPIキーを取得する
        this.apiKey = process.env.VUE_APP_OPENAI_API_KEY;
        try {
            const prompt = `以下のチャットデータに基づいて、ユーザーのMBTI性格タイプを診断してください。チャットデータは次の通りです：[${this.chatData.join(", ")}]。診断結果だけをアルファベット4文字で返してください。余計なものは何も含めないでお願いします。`;

            const result = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
            },
            {
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                },
            }
            );
            var response = result.data.choices[0].message.content;

            console.log('ChatGPT APIからの応答:', response);
        } catch (error) {
            console.error('ChatGPT API呼び出しエラー:', error);
        }

    },


        async startLogin() {
            // Start the Login Process if not already logged in.
            if (!getDefaultSession().info.isLoggedIn) {
                await login({
                oidcIssuer: "https://login.inrupt.com",
                redirectUrl: new URL("/barachat", window.location.href).toString(),
                clientName: "My application"
                });
            }
        },

        //Podのユーザー名を格納する
        savePodInfo() {
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    console.log('User is signed in');


                    // 現在認証されているユーザーのUIDを取得する
                    const uid = firebase.auth().currentUser.uid;


                    // users/{uid}の下にmyPodNameとPodMembersを保存する
                    const userRef = firebase.database().ref(`users/${uid}`);
                    userRef.update({
                        myPodName: this.myPodName,
                        PodMembers: this.podMembers.split(',')
                    }).then(() => {
                        console.log("Pod情報を保存しました");
                    }).catch((error) => {
                        console.error("Pod情報の保存に失敗しました:", error);
                    });
                } else {
                    console.log('No user is signed in');
                }
            });
        },

        //Podのユーザー名を取得する
        fetchPodInfo() {
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    console.log('User is signed in');

                    // 現在認証されているユーザーのUIDを取得する
                    const uid = firebase.auth().currentUser.uid;

                    // users/{uid}からmyPodNameとPodMembersを取得する
                    const userRef = firebase.database().ref(`users/${uid}`);
                    userRef.once('value').then(snapshot => {
                        const data = snapshot.val();
                        if (data) {
                            console.log("Pod情報を取得しました:");
                            console.log("自分のPod名:", data.myPodName);
                            console.log("Podメンバー:", data.PodMembers);
                        } else {
                            console.log("Pod情報が見つかりません");
                        }
                    }).catch(error => {
                        console.error("Pod情報の取得に失敗しました:", error);
                    });
                } else {
                    console.log('No user is signed in');
                }
            });
        },


        async handleButtonClick() {
            this.updateToDoList(this.inputText);

            console.log(this.PodUrl+"のファイルを共有する");

            // アクセス権を与える
            this.accessKuwa(this.PodUrl);
        },
        // アクセス権の確認 データにアクセスできるかどうか
        async accessCheck() {
            universalAccess.getPublicAccess(
            this.PodUrl,   // Resource
            { fetch: fetch }                  // fetch function from authenticated session
            ).then((returnedAccess) => {
            if (returnedAccess === null) {
                console.log("Could not load access details for this Resource.");
            } else {
                console.log("Returned Public Access:: ", JSON.stringify(returnedAccess));
            }
            });
        },
        async  checkLogin() {
            
            // Check if logged in. If so, show the user's WebID.
            if (getDefaultSession().info.isLoggedIn) {
                console.log(`login`);
                console.log(`Logged in as ${getDefaultSession().info.webId}`);
                const pods=await getPodUrlAll(getDefaultSession().info.webId,{ fetch: fetch });
                console.log(pods);
                this.PodUrl=pods[0]+"KuwaChat/"+this.NameOfThePerson+"/";

                this.loginPodUrl=pods[0];

                console.log(this.PodUrl);
            }
            else{
                console.log(`not login`);
            }
        },




        //アクセス権を与える関数
        async accessKuwa(resourceURL){
            universalAccess.setAgentAccess(
            resourceURL,         // Resource
            "https://id.inrupt.com/"+this.NameOfThePerson,     // Agent
            { read: true, write: false, },          // Access object
            { fetch: fetch }                         // fetch function from authenticated session
            ).then((newAccess) => {
            this.logAccessInfo("https://id.inrupt.com/"+this.NameOfThePerson, newAccess, resourceURL)
            });
        },
        logAccessInfo(agent, agentAccess, resource) {
            console.log(`For resource::: ${resource}`);
            if (agentAccess === null) {
                console.log(`Could not load ${agent}'s access details.`);
            } else {
                console.log(`${agent}'s Access:: ${JSON.stringify(agentAccess)}`);
            }
        },







        async  completeLogin() {
            await handleIncomingRedirect();
        },




        async readChat(){
            firebase.auth().onAuthStateChanged(async user => {
                if (user) {
                    const uid = firebase.auth().currentUser.uid;
                    const userRef = firebase.database().ref(`users/${uid}`);

                    userRef.once('value').then(async snapshot => {
                        const data = snapshot.val();
                        if (data) {
                            console.log("Pod情報を取得しました:");
                            console.log("自分のPod名:", data.myPodName);
                            console.log("Podメンバー:", data.PodMembers);

                            // chatDataを初期化
                            this.chatData = [];

                            // メンバーとの送信・受信履歴を取得
                            for (let i = 0; i < data.PodMembers.length; i++) {
                                let member = data.PodMembers[i];

                                // 自分から相手へのメッセージを取得
                                await this.getUserData(data.myPodName, member);

                                // 相手から自分へのメッセージを取得
                                await this.getUserData(member, data.myPodName);
                            }

                            console.log("chatDataです");
                            console.log(this.chatData);

                        } else {
                            console.log("Pod情報が見つかりません");
                        }
                    }).catch(error => {
                        console.error("Pod情報の取得に失敗しました:", error);
                    });
                } else {
                    console.log('No user is signed in');
                }
            });
        },

        async readTodoList() {
            console.log(this.PodUrl);

            try {
                const myDataset = await getSolidDataset(this.PodUrl, { fetch: fetch });
                let items = getThingAll(myDataset);

                let messageArray = [];

                for (let i = 0; i < items.length; i++) {
                let thing = items[i];

                let message = getStringNoLocale(thing, SCHEMA_INRUPT.name) || '';
                let recipient = getStringNoLocale(thing, FOAF.givenname) || '';
                let timestamp = getDatetime(thing, DCTERMS.created) || null;
                let language = getStringNoLocale(thing, DCTERMS.language) || '';

                // メッセージオブジェクトを作成
                let messageObject = {
                    message: message,
                    recipient: recipient,
                    timestamp: timestamp,
                    language: language,
                    sender: this.MyName,
                    receiver: this.NameOfThePerson
                };

                messageArray.push(messageObject);
                }

                // 読み込んだデータを chatData に追加
                this.chatData = this.chatData.concat(messageArray);

                console.log("取得した自分のチャットデータ:");
                console.log(messageArray);

            } catch (error) {
                console.error("データの取得に失敗しました:", error);
            }
            },

        // 指定した相手のPodデータを読み込む
        async getUserData(NameOfThePerson, MyName){
            const pods = await getPodUrlAll("https://id.inrupt.com/" + NameOfThePerson, { fetch: fetch });
            const dataUrl = pods[0] + "KuwaChat/" + MyName + "/";

            try {
                const myDataset = await getSolidDataset(dataUrl, { fetch: fetch });
                let items = getThingAll(myDataset);

                let messageArray = [];

                for (let i = 0; i < items.length; i++) {
                    let thing = items[i];

                    let message = getStringNoLocale(thing, SCHEMA_INRUPT.name) || '';
                    let recipient = getStringNoLocale(thing, FOAF.givenname) || '';
                    let timestamp = getDatetime(thing, DCTERMS.created) || null;
                    let language = getStringNoLocale(thing, DCTERMS.language) || '';

                    // メッセージオブジェクトを作成
                    let messageObject = {
                        message: message,
                        recipient: recipient,
                        timestamp: timestamp,
                        language: language,
                        sender: NameOfThePerson,
                        receiver: MyName
                    };

                    messageArray.push(messageObject);
                }

                // 読み込んだデータを chatData に追加
                this.chatData = this.chatData.concat(messageArray);

            } catch (error) {
                console.error("データの取得に失敗しました:", error);
            }
        },




        //相手のPodデータを読み込む
        async getOtherUserData(){
            this.getUserData(this.NameOfThePerson,this.MyName);
        },





        async updateToDoList(myChangedDataset) {
            const readingListUrl = this.PodUrl;

            // Fetch or create a new reading list.
            let myReadingList;

            try {
                // Attempt to retrieve the reading list in case it already exists.
                myReadingList = await getSolidDataset(readingListUrl, { fetch: fetch });
            } catch (error) {
                if (typeof error.statusCode === "number" && error.statusCode === 404) {
                    // if not found, create a new SolidDataset (i.e., the reading list)
                    myReadingList = createSolidDataset();
                } else {
                    console.error(error.message);
                    return; // ここでエラーが発生した場合は処理を中断します
                }
            }

            // Add new titles to the Dataset
            let i = getThingAll(myReadingList).length; // 既存のアイテム数を取得
            let item = createThing({ name: "chat" + i });
            item = addUrl(item, RDF.type, AS.Article);
            item = addStringNoLocale(item, SCHEMA_INRUPT.name, myChangedDataset);

            // チャットの言語を追加
            item = addStringNoLocale(item, DCTERMS.language, this.chatLanguage);

            // 受信者の名前を追加
            item = addStringNoLocale(item, FOAF.givenname, this.NameOfThePerson);

            const timestamp = new Date();
            item = addDatetime(item, DCTERMS.created, timestamp);

            myReadingList = setThing(myReadingList, item);

            try {
                // Save the SolidDataset
                let savedReadingList = await saveSolidDatasetAt(
                    readingListUrl,
                    myReadingList,
                    { fetch: fetch }
                );

                console.log(savedReadingList);
            } catch (error) {
                console.log(error);
            }
        },



    },


}
</script>
  