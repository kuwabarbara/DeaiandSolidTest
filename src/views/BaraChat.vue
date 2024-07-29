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
    removeThing,
    saveSolidDatasetAt,
    setThing,
  } from "@inrupt/solid-client";

  import { universalAccess } from "@inrupt/solid-client";
  
  import { SCHEMA_INRUPT, RDF, AS ,FOAF} from "@inrupt/vocab-common-rdf";

  import { handleIncomingRedirect, login} from '@inrupt/solid-client-authn-browser';

  import axios from 'axios';


export default {
    name: 'BaraChat',

    data() {
        return {
            inputText: '',
            PodUrl: '',

            NameOfThePerson: '',  // 相手の名前
            MyName: '',  // 自分の名前

            myPodName: '', // Podの名前を格納するためのデータプロパティ
            podMembers: '', // Podのメンバーを格納するためのデータプロパティ（文字列）

            listcontent: '', // チャットの内容を一時的に格納するためのデータプロパティ
            chatData: [], // チャットの内容を格納するためのデータプロパティ


            apiKey: "",
        

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



        //自分のPodデータのチャットを読み込む
        async readChat(){
            //まずPodのユーザー名を取得する
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    console.log('User is signed in');

                    // 現在認証されているユーザーのUIDを取得する
                    const uid = firebase.auth().currentUser.uid;

                    // users/{uid}からmyPodNameとPodMembersを取得する
                    const userRef = firebase.database().ref(`users/${uid}`);
                    userRef.once('value').then(async snapshot => {
                        const data = snapshot.val();
                        if (data) {
                            console.log("Pod情報を取得しました:");
                            console.log("自分のPod名:", data.myPodName);
                            console.log("Podメンバー:", data.PodMembers);

                            this.chatData=[];

                            for (let i = 0; i < data.PodMembers.length; i++) {
                                console.log(data.PodMembers[i]);
                                await this.getUserData(data.myPodName,data.PodMembers[i]);

                                console.log("aaaaa");
                                console.log(this.listcontent);
                                console.log("bbbbb");
                                //chatDataに読み込んだデータを格納する
                                this.chatData.push(data.PodMembers[i]+"に対しての送信履歴:"+this.listcontent);
                            }
                            for (let i = 0; i < data.PodMembers.length; i++) {
                                console.log(data.PodMembers[i]);
                                await this.getUserData(data.PodMembers[i],data.myPodName);

                                console.log("aaaaa");
                                console.log(this.listcontent);
                                console.log("bbbbb");
                                //chatDataに読み込んだデータを格納する
                                this.chatData.push(data.PodMembers[i]+"に対しての受信履歴:"+this.listcontent);
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

        //自分のPodデータを読み込む
        async readTodoList() {
            console.log(this.PodUrl);

          const myDataset = await getSolidDataset(
            this.PodUrl,
            { fetch: fetch }
            );

            let items = getThingAll(myDataset);
  
            let listcontent = "";
            for (let i = 0; i < items.length; i++) {
                let item = getStringNoLocale(items[i], SCHEMA_INRUPT.name);
                if (item !== null) {
                listcontent += item + "\n";
                }

                let item2 = getStringNoLocale(items[i], FOAF.givenname);
                if (item2 !== null) {
                listcontent += item2 + "\n";
                }


            }

            console.log(listcontent);

        },
        //指定した相手のPodデータを読み込む
        async getUserData(NameOfThePerson,MyName){
            const pods=await getPodUrlAll("https://id.inrupt.com/"+NameOfThePerson,{ fetch: fetch });

            var xxx=pods[0]+"KuwaChat/"+MyName+"/";

            // Make authenticated requests by passing `fetch` to the solid-client functions.
            // The user must have logged in as someone with the appropriate access to the specified URL.

            // For example, the user must be someone with Read access to the specified URL.
            const myDataset = await getSolidDataset(
            //"https://storage.inrupt.com/somepod/todolist",
            xxx,
            { fetch: fetch }
            );
            //console.log(myDataset);

            let items = getThingAll(myDataset);
  
            let listcontent = "";
            for (let i = 0; i < items.length; i++) {
                let item = getStringNoLocale(items[i], SCHEMA_INRUPT.name);
                if (item !== null) {
                listcontent += item + "\n";
                }

                let item2 = getStringNoLocale(items[i], FOAF.givenname);
                if (item2 !== null) {
                listcontent += item2 + "\n";
                }

            }

            console.log("akasatana");
            console.log(listcontent);
            console.log("hamayarawa");

            
            this.listcontent=listcontent;

            console.log("abcde");
            console.log(this.listcontent);
            console.log("fghij");

        },

        




        //相手のPodデータを読み込む
        async getOtherUserData(){
            this.getUserData(this.NameOfThePerson,this.MyName);
        },





        async updateToDoList(myChangedDataset) {
            const myDataset = await getSolidDataset(
            this.PodUrl,
            { fetch: fetch }
            );

            let items = getThingAll(myDataset);
  
            let listcontent = "";
            for (let i = 0; i < items.length; i++) {
                let item = getStringNoLocale(items[i], SCHEMA_INRUPT.name);
                if (item !== null) {
                listcontent += item + "\n";
                }

                let item2 = getStringNoLocale(items[i], FOAF.givenname);
                if (item2 !== null) {
                listcontent += item2 + "\n";
                }

            }

            myChangedDataset+=listcontent+"\n";


        // For simplicity and brevity, this tutorial hardcodes the  SolidDataset URL.
            // In practice, you should add in your profile a link to this resource
            // such that applications can follow to find your list.
            const readingListUrl = this.PodUrl;

            console.log("aaaaaaaaa");



            console.log(readingListUrl);

        
            let titles = myChangedDataset.split("\n");
        
            // Fetch or create a new reading list.
            let myReadingList;
        
            try {
            // Attempt to retrieve the reading list in case it already exists.
            myReadingList = await getSolidDataset(readingListUrl, { fetch: fetch });
            // Clear the list to override the whole list
            let items = getThingAll(myReadingList);


            items.forEach((item) => {
                myReadingList = removeThing(myReadingList, item);
            });



            } catch (error) {
            if (typeof error.statusCode === "number" && error.statusCode === 404) {
                // if not found, create a new SolidDataset (i.e., the reading list)
                myReadingList = createSolidDataset();
            } else {
                console.error(error.message);
            }
            }

            console.log("bbbbbbbbbb");
        
            // Add titles to the Dataset
            let i = 0;
            titles.forEach((title) => {
            if (title.trim() !== "") {
                console.log("cccccccccc");
                let item = createThing({ name: "chat" + i });
                item = addUrl(item, RDF.type, AS.Article);
                item = addStringNoLocale(item, SCHEMA_INRUPT.name, title);

                console.log("this.NameOfThePerson");
                console.log(this.NameOfThePerson);
                //受信者の名前を追加
                item = addStringNoLocale(item, FOAF.givenname, this.NameOfThePerson);




                myReadingList = setThing(myReadingList, item);
                i++;
            }
            });
        
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
  