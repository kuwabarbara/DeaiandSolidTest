<template>
    <div>
    桑原
    <button @click="startLogin">Login</button>
    <br>
    <button @click="checkLogin">Check Login</button>
    <br>

    <input type="text" v-model="NameOfThePerson" placeholder="相手の名前を入力">





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
    <button @click="accessButton">access button</button>
    <br>
    <button @click="accessDeprivationButton">access deprivation button</button>
    <br>
    <button @click="publicAccessButton">public access button</button>
    <br>
    <button @click="publicAccessDeprivationButton">public access deprivation button</button>
    <br>


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
  
  import { SCHEMA_INRUPT, RDF, AS } from "@inrupt/vocab-common-rdf";

  import { handleIncomingRedirect, login} from '@inrupt/solid-client-authn-browser';

export default {
    name: 'BaraChat',

    data() {
        return {
            inputText: '',
            PodUrl: '',

            NameOfThePerson: '',  // 相手の名前
        

        };
    },
    created() {
        this.completeLogin();



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

            console.log(gender);
            console.log(name);
            console.log(status);
        });


        
    },
    methods: {
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
        async handleButtonClick() {
            this.updateToDoList(this.inputText);
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



        //アクセス権を与えるボタン
        async accessButton() {
            //this.setupPolicyToMatchAgentsAndClients(this.PodUrl);
            this.accessKuwa(this.PodUrl);
            console.log(this.PodUrl);
        },

        async accessDeprivationButton() {
            //this.setupPolicyToMatchAgentsAndClients(this.PodUrl);
            this.accessDeprivationKuwa(this.PodUrl);
            console.log(this.PodUrl);
        },

        //パブリックアクセス権を与えるボタン
        async publicAccessButton() {
            this.publicAccess(this.PodUrl);
            console.log(this.PodUrl);
        },

        //パブリックアクセス権をはく奪するボタン
        async publicAccessDeprivationButton() {
            this.publicAccessDeprivation(this.PodUrl);
            console.log(this.PodUrl);
        },


        //アクセス権を与える関数
        async accessKuwa(resourceURL){
            universalAccess.setAgentAccess(
            resourceURL,         // Resource
            "https://id.inrupt.com/kuwabarbara2",     // Agent
            { read: true, write: false, },          // Access object
            { fetch: fetch }                         // fetch function from authenticated session
            ).then((newAccess) => {
            this.logAccessInfo("https://id.inrupt.com/kuwabarbara2", newAccess, resourceURL)
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

        //アクセス権をはく奪する関数
        async accessDeprivationKuwa(resourceURL){
            universalAccess.setAgentAccess(
            resourceURL,         // Resource
            "https://id.inrupt.com/kuwabarbara2",     // Agent
            { read: false, write: false, },          // Access object
            { fetch: fetch }                         // fetch function from authenticated session
            ).then((newAccess) => {
                console.log(`アクセス権をはく奪しました ${JSON.stringify(newAccess)}`);
            });
        },

        //パブリックアクセス権を与える関数
        async publicAccess(resourceURL){
            universalAccess.setPublicAccess(
                resourceURL,  // Resource
                { read: true, write: false },    // Access object
                { fetch: fetch }                 // fetch function from authenticated session
                ).then((newAccess) => {
                if (newAccess === null) {
                    console.log("Could not load access details for this Resource.");
                } else {
                    console.log("Returned Public Access:: ", JSON.stringify(newAccess));
                }
                });
        },

        //パブリックアクセス権をはく奪する関数
        async publicAccessDeprivation(resourceURL){
            universalAccess.setPublicAccess(
                resourceURL,  // Resource
                { read: false, write: false },    // Access object
                { fetch: fetch }                 // fetch function from authenticated session
                ).then((newAccess) => {
                if (newAccess === null) {
                    console.log("Could not load access details for this Resource.");
                } else {
                    console.log("Returned Public Access:: ", JSON.stringify(newAccess));
                }
                });
        },



        async  completeLogin() {
            await handleIncomingRedirect();
        },
        async readTodoList() {
            console.log(this.PodUrl);

            // Make authenticated requests by passing `fetch` to the solid-client functions.
            // The user must have logged in as someone with the appropriate access to the specified URL.

            // For example, the user must be someone with Read access to the specified URL.
            const myDataset = await getSolidDataset(
            //"https://storage.inrupt.com/somepod/todolist",
            this.PodUrl,
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
            }

            console.log(listcontent);

            //this.ReadData = myDataset;
        },
        async updateToDoList(myChangedDataset) {
        // For simplicity and brevity, this tutorial hardcodes the  SolidDataset URL.
            // In practice, you should add in your profile a link to this resource
            // such that applications can follow to find your list.
            const readingListUrl = this.PodUrl;

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
        
            // Add titles to the Dataset
            let i = 0;
            titles.forEach((title) => {
            if (title.trim() !== "") {
                let item = createThing({ name: "title" + i });
                item = addUrl(item, RDF.type, AS.Article);
                item = addStringNoLocale(item, SCHEMA_INRUPT.name, title);
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

        }



    },
}
</script>
  