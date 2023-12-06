<template>
    <div>
    桑原
    <button @click="startLogin">Login</button>
    <br>
    <button @click="checkLogin">Check Login</button>
    <br>

    <input type="text" v-model="inputText">
    <button @click="handleButtonClick">Submit</button>
  
    <br>

    <button @click="readTodoList">Read Todo List</button>

    <br>
    読み込んだデータはこちら
    <br>
    {{ReadData}}

    </div>
</template>
  


<script>

import {  login, getDefaultSession } from '@inrupt/solid-client-authn-browser'
import { handleIncomingRedirect } from '@inrupt/solid-client-authn-browser'
import { fetch } from '@inrupt/solid-client-authn-browser'
//import { getSolidDataset, saveSolidDatasetAt } from "@inrupt/solid-client";
//import { getPodUrlAll } from "@inrupt/solid-client";
//import { getThingAll, getStringNoLocale } from "@inrupt/solid-client";
//import { SCHEMA_INRUPT} from "@inrupt/vocab-common-rdf";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import 'firebase/compat/database';

  // Import from "@inrupt/solid-client"
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
    setThing
  } from "@inrupt/solid-client";
  
  import { SCHEMA_INRUPT, RDF, AS } from "@inrupt/vocab-common-rdf";

export default {
    name: 'Bara',

    data() {
        return {
            //ReadData :null,
            //SaveData :null,
            inputText: '',
            PodUrl: '',

        };
    },
    components: {

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
                redirectUrl: new URL("/bara", window.location.href).toString(),
                clientName: "My application"
                });
            }
        },
        async handleButtonClick() {
            this.updateToDoList(this.inputText);
        },
        async  checkLogin() {
            
            // Check if logged in. If so, show the user's WebID.
            if (getDefaultSession().info.isLoggedIn) {
                console.log(`login`);
                console.log(`Logged in as ${getDefaultSession().info.webId}`);
                const pods=await getPodUrlAll(getDefaultSession().info.webId,{ fetch: fetch });
                console.log(pods);
                this.PodUrl=pods[0];
            }
            else{
                console.log(`not login`);
            }
        },
        async  completeLogin() {
            await handleIncomingRedirect();
        },
        async readTodoList() {

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






            /*console.log(myChangedDataset);
            console.log(this.PodUrl);




            const readingListUrl = this.PodUrl;
  
            let titles = myChangedDataset.value.split("\n");

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







            //const URL=this.PodUrl+ "todolist";

            // The user must be someone with Write access to the specified URL.
            const savedSolidDataset = await saveSolidDatasetAt(
            //"https://storage.inrupt.com/somepod/todolist",
            this.PodUrl,
            //myChangedDataset,
            myReadingList,
            { fetch: fetch }
            );
            console.log(savedSolidDataset);

            //this.SaveData = savedSolidDataset;*/
        }



    },
}
</script>
  