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

    <form @submit.prevent="handleSubmit">
      <div>
        <label for="start">Start Date:</label>
        <input type="datetime-local" id="start" v-model="newStartDate">
      </div>
      <div>
        <label for="end">End Date:</label>
        <input type="datetime-local" id="end" v-model="newEndDate">
      </div>
      <button type="submit">Add Schedule</button>
    </form>

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
    //removeThing,
    saveSolidDatasetAt,
    setThing,
    addDatetime,
    getDatetime,
  } from "@inrupt/solid-client";

  import { universalAccess } from "@inrupt/solid-client";
  
  import { SCHEMA_INRUPT, RDF, AS } from "@inrupt/vocab-common-rdf";

  import { handleIncomingRedirect, login} from '@inrupt/solid-client-authn-browser';
  //import { acp_ess_2, asUrl } from "@inrupt/solid-client";

export default {
    name: 'Bara',

    data() {
        return {
            //ReadData :null,
            //SaveData :null,
            inputText: '',
            PodUrl: '',
            selectedDate: [], // 選択された日付を保持するためのデータ
            formattedSelectedDate: '',
            newStartDate: "",
            newEndDate: "",
        

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
        handleSubmit() {
            this.addSchedule(this.newStartDate, this.newEndDate);
            this.newStartDate = "";
            this.newEndDate = "";
        },
        addSchedule(startDate, endDate) {
            this.selectedData = [];
            console.log("addSchedule");
            console.log(startDate, endDate);
            this.selectedData.push({startDate, endDate });
            console.log(this.selectedData);
        },
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
                this.PodUrl=pods[0]+"KuwaSchedule/";

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

        /*//リソースへのアクセス権を与える関数（ここではkuwabarbara2にアクセスの許可を与える）
        async setupPolicyToMatchAgentsAndClients(resourceURL) {

            const agentsToMatch = [ "https://id.inrupt.com/kuwabarbara2" ];
            const clientIDsToMatch = [ "http://localhost:8080/bara" ];

            try {
                // 1. Fetch the SolidDataset with its Access Control Resource (ACR).
                let resourceWithAcr = await acp_ess_2.getSolidDatasetWithAcr(
                resourceURL,            // Resource whose ACR to set up
                { fetch: fetch }       // fetch from the authenticated session
                );

                // 2. Initialize a new Matcher.
                let appFriendsMatcher = acp_ess_2.createResourceMatcherFor(
                resourceWithAcr,
                "match-app-friends"
                );

                // 3. For the Matcher, specify the Agent(s) to match.
                agentsToMatch.forEach(agent => {
                appFriendsMatcher = acp_ess_2.addAgent(appFriendsMatcher, agent);
                })

                // 4. For the Matcher, specify the Client ID(s) to match.
                clientIDsToMatch.forEach(clientID => {
                appFriendsMatcher = acp_ess_2.addClient(appFriendsMatcher, clientID);
                })

                // 5. Add the Matcher definition to the Resource's ACR.
                resourceWithAcr = acp_ess_2.setResourceMatcher(
                resourceWithAcr,
                appFriendsMatcher
                );

                // 6. Create a Policy for the Matcher.
                let appFriendsPolicy = acp_ess_2.createResourcePolicyFor(
                resourceWithAcr,
                "app-friends-policy",
                );

                // 7. Add the appFriendsMatcher to the Policy as an allOf() expression.
                // Since using allOf() with a single Matcher, could also use anyOf() expression

                appFriendsPolicy = acp_ess_2.addAllOfMatcherUrl(
                appFriendsPolicy,
                appFriendsMatcher
                );

                // 8. Specify the access modes (e.g., allow Read and Write).
                appFriendsPolicy = acp_ess_2.setAllowModes(appFriendsPolicy,
                { read: true, write: true }
                );

                // 9. Apply the Policy to the resource.
                resourceWithAcr = acp_ess_2.addPolicyUrl(
                resourceWithAcr,
                asUrl(appFriendsPolicy)
                );

                // 10. Add the Policy definition to the resource's ACR. 
                resourceWithAcr = acp_ess_2.setResourcePolicy(
                resourceWithAcr,
                appFriendsPolicy
                );

                // 11. Save the modified ACR for the resource.
                const updatedResourceWithAcr = await acp_ess_2.saveAcrFor(
                resourceWithAcr,
                { fetch: fetch }          // fetch from the authenticated session
                );

                console.log("Updated ACR: ", updatedResourceWithAcr);

            } catch (error) {
                console.error(error.message);
            }
        },*/



        async  completeLogin() {
            await handleIncomingRedirect();
        },

        async readTodoList() {
            console.log("readTodoList");
            const titlesUrl = this.PodUrl + 'titles';
            const datesUrl = this.PodUrl + 'dates';

            // タイトルのデータセットを取得
            let titlesDataset;
            try {
                titlesDataset = await getSolidDataset(titlesUrl, { fetch: fetch });
            } catch (error) {
                if (typeof error.statusCode === "number" && error.statusCode === 404) {
                    console.error("Titles dataset not found.");
                    return;
                } else {
                    console.error(error.message);
                    return;
                }
            }

            // 日時のデータセットを取得
            let datesDataset;
            try {
                datesDataset = await getSolidDataset(datesUrl, { fetch: fetch });
            } catch (error) {
                if (typeof error.statusCode === "number" && error.statusCode === 404) {
                    console.error("Dates dataset not found.");
                    return;
                } else {
                    console.error(error.message);
                    return;
                }
            }

            // 両方のデータセットからThingを取得
            let titleThings = getThingAll(titlesDataset);
            let dateThings = getThingAll(datesDataset);

            // イベントIDをキーとしたマップを作成
            let titlesMap = {};
            titleThings.forEach((thing) => {
                let eventId = getStringNoLocale(thing, SCHEMA_INRUPT.identifier);
                let title = getStringNoLocale(thing, SCHEMA_INRUPT.name);
                if (eventId && title) {
                    titlesMap[eventId] = title;
                }
            });

            let datesMap = {};
            dateThings.forEach((thing) => {
                let eventId = getStringNoLocale(thing, SCHEMA_INRUPT.identifier);
                let startDate = getDatetime(thing, SCHEMA_INRUPT.startDate);
                let endDate = getDatetime(thing, SCHEMA_INRUPT.endDate);
                if (eventId) {
                    datesMap[eventId] = {
                        startDate: startDate,
                        endDate: endDate
                    };
                }
            });

            // イベントIDでデータを結合
            let listContent = [];

            for (let eventId in titlesMap) {
                let title = titlesMap[eventId];
                let dates = datesMap[eventId] || {};
                listContent.push({
                    eventId: eventId,
                    title: title,
                    startDate: dates.startDate,
                    endDate: dates.endDate
                });
            }

            console.log(listContent);

            // データを表示または使用
            this.ReadData = listContent;
        },

        //予定の数を数える関数
        async cntSchedule() {
            console.log("readTodoList");
            console.log(this.PodUrl);

            // Make authenticated requests by passing `fetch` to the solid-client functions.
            const myDataset = await getSolidDataset(this.PodUrl, { fetch: fetch });

            let items = getThingAll(myDataset);

            let listcontent = [];

            for (let i = 0; i < items.length; i++) {
                console.log("Processing item", i);
                let item = items[i];
                console.log(JSON.stringify(item, null, 2)); // データ構造を完全にログ出力

                let title = getStringNoLocale(item, SCHEMA_INRUPT.name);
                console.log("title", title);

                let startDate = getDatetime(item, SCHEMA_INRUPT.startDate);
                console.log("startDate", startDate);

                let endDate = getDatetime(item, SCHEMA_INRUPT.endDate);
                console.log("endDate", endDate);

                //let location = getStringNoLocale(item, SCHEMA_INRUPT.location) || "";
                //console.log("location", location);

                //let description = getStringNoLocale(item, SCHEMA_INRUPT.description) || "";
                //console.log("description", description);

                if (title !== null) {
                    console.log("Adding item to list");
                    listcontent.push({
                        title: title,
                        startDate: startDate,
                        endDate: endDate,
                        //location: location,
                        //description: description
                    });
                }
                else {
                    console.log("No title found for item", i);
                }
            }

            //listcontentの長さを返す
            return listcontent.length;
        },

        async updateToDoList(myChangedDataset) {
            let cnt = 0;

            cnt = await this.cntSchedule();
            console.log("元の予定の数");
            console.log(cnt);

            console.log("updateToDoList");
            console.log(this.selectedDate);

            // タイトルと日時を別々のファイルに保存するためのURLを定義
            const titlesUrl = this.PodUrl + 'titles';
            const datesUrl = this.PodUrl + 'dates';

            console.log(titlesUrl);
            console.log(datesUrl);

            let titles = myChangedDataset.split("\n");

            // タイトルと日時のデータセットを取得または作成
            let titlesDataset;
            let datesDataset;

            try {
                titlesDataset = await getSolidDataset(titlesUrl, { fetch: fetch });
            } catch (error) {
                if (typeof error.statusCode === "number" && error.statusCode === 404) {
                    titlesDataset = createSolidDataset();
                } else {
                    console.error(error.message);
                    return;
                }
            }

            try {
                datesDataset = await getSolidDataset(datesUrl, { fetch: fetch });
            } catch (error) {
                if (typeof error.statusCode === "number" && error.statusCode === 404) {
                    datesDataset = createSolidDataset();
                } else {
                    console.error(error.message);
                    return;
                }
            }

            // イベントごとに処理
            let i = 0;
            titles.forEach((title) => {
                if (title.trim() !== "") {
                    let eventId = "schedule" + (i + cnt);

                    // タイトルのThingを作成し、イベントIDを追加
                    let titleThing = createThing({ name: eventId });
                    titleThing = addUrl(titleThing, RDF.type, AS.Article);
                    titleThing = addStringNoLocale(titleThing, SCHEMA_INRUPT.name, title);
                    titleThing = addStringNoLocale(titleThing, SCHEMA_INRUPT.identifier, eventId);

                    // タイトルのデータセットに追加
                    titlesDataset = setThing(titlesDataset, titleThing);

                    // 日時のThingを作成し、イベントIDを追加
                    if (this.selectedData && this.selectedData[i]) {
                        let datesThing = createThing({ name: eventId });
                        datesThing = addUrl(datesThing, RDF.type, AS.Article);
                        datesThing = addStringNoLocale(datesThing, SCHEMA_INRUPT.identifier, eventId);

                        let startDate = new Date(this.selectedData[i].startDate);
                        let endDate = new Date(this.selectedData[i].endDate);

                        datesThing = addDatetime(datesThing, SCHEMA_INRUPT.startDate, startDate);
                        datesThing = addDatetime(datesThing, SCHEMA_INRUPT.endDate, endDate);

                        // 日時のデータセットに追加
                        datesDataset = setThing(datesDataset, datesThing);
                    } else {
                        console.warn(`No date provided for item ${i}`);
                    }

                    i++;
                }
            });

            try {
                // タイトルのデータセットを保存
                let savedTitlesDataset = await saveSolidDatasetAt(
                    titlesUrl,
                    titlesDataset,
                    { fetch: fetch }
                );

                // 日時のデータセットを保存
                let savedDatesDataset = await saveSolidDatasetAt(
                    datesUrl,
                    datesDataset,
                    { fetch: fetch }
                );

                console.log('Saved titles dataset:', savedTitlesDataset);
                console.log('Saved dates dataset:', savedDatesDataset);

            } catch (error) {
                console.log(error);
            }
        }

        
    }
}
</script>
  