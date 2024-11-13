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
    createContainerAt, 
    getContainedResourceUrlAll,
  } from "@inrupt/solid-client";

  import { universalAccess } from "@inrupt/solid-client";
  
  import { SCHEMA_INRUPT, RDF} from "@inrupt/vocab-common-rdf";

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
            const schedulesDirUrl = this.PodUrl + 'schedules/';
            const titlesDirUrl = schedulesDirUrl + 'titles/';
            const datesDirUrl = schedulesDirUrl + 'dates/';

            // titles ディレクトリのコンテンツを取得
            let titlesDataset;
            try {
                titlesDataset = await getSolidDataset(titlesDirUrl, { fetch: fetch });
            } catch (error) {
                if (typeof error.statusCode === "number" && error.statusCode === 404) {
                    console.error("Titles directory not found.");
                    return;
                } else {
                    console.error(error.message);
                    return;
                }
            }

            // dates ディレクトリのコンテンツを取得
            let datesDataset;
            try {
                datesDataset = await getSolidDataset(datesDirUrl, { fetch: fetch });
            } catch (error) {
                if (typeof error.statusCode === "number" && error.statusCode === 404) {
                    console.error("Dates directory not found.");
                    return;
                } else {
                    console.error(error.message);
                    return;
                }
            }

            // titles と dates のファイルURLを取得
            const titleResourceUrls = getContainedResourceUrlAll(titlesDataset);
            const datesResourceUrls = getContainedResourceUrlAll(datesDataset);

            // タイトルと日時のマップを作成
            let titlesMap = {};
            for (let resourceUrl of titleResourceUrls) {
                try {
                    let titleDataset = await getSolidDataset(resourceUrl, { fetch: fetch });
                    let titleThing = getThingAll(titleDataset)[0]; // データセット内の最初のThingを取得

                    let eventId = getStringNoLocale(titleThing, SCHEMA_INRUPT.identifier);
                    let title = getStringNoLocale(titleThing, SCHEMA_INRUPT.name);
                    if (eventId && title) {
                        titlesMap[eventId] = title;
                    }
                } catch (error) {
                    console.error(`Error reading title from ${resourceUrl}:`, error);
                }
            }

            let datesMap = {};
            for (let resourceUrl of datesResourceUrls) {
                try {
                    let datesDataset = await getSolidDataset(resourceUrl, { fetch: fetch });
                    let datesThing = getThingAll(datesDataset)[0]; // データセット内の最初のThingを取得

                    let eventId = getStringNoLocale(datesThing, SCHEMA_INRUPT.identifier);
                    let startDate = getDatetime(datesThing, SCHEMA_INRUPT.startDate);
                    let endDate = getDatetime(datesThing, SCHEMA_INRUPT.endDate);
                    if (eventId) {
                        datesMap[eventId] = {
                            startDate: startDate,
                            endDate: endDate
                        };
                    }
                } catch (error) {
                    console.error(`Error reading dates from ${resourceUrl}:`, error);
                }
            }

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

        // タイトルファイルにアクセス権を設定
        async accessTitleFile(eventId) {
            const titlesDirUrl = this.PodUrl + 'schedules/titles/';
            const titleFileUrl = titlesDirUrl + eventId + '.ttl';

            await universalAccess.setAgentAccess(
                titleFileUrl,
                "https://id.inrupt.com/kuwabarbara2", // 例: 特定のエージェント
                { read: true, write: false },        // 読み取りのみ許可
                { fetch: fetch }
            ).then((newAccess) => {
                if (newAccess === null) {
                    console.log("Could not load access details for the Title Resource.");
                } else {
                    console.log("Returned Title Access:: ", JSON.stringify(newAccess));
                }
            });
        },

        // 日時ファイルにアクセス権を設定
        async accessDatesFile(eventId) {
            const datesDirUrl = this.PodUrl + 'schedules/dates/';
            const datesFileUrl = datesDirUrl + eventId + '.ttl';

            await universalAccess.setAgentAccess(
                datesFileUrl,
                "https://id.inrupt.com/kuwabarbara2", // 例: 別のエージェント
                { read: true, write: true },         // 読み取りと書き込みを許可
                { fetch: fetch }
            ).then((newAccess) => {
                if (newAccess === null) {
                    console.log("Could not load access details for the Dates Resource.");
                } else {
                    console.log("Returned Dates Access:: ", JSON.stringify(newAccess));
                }
            });
        },

        //予定の数を数える関数
        async cntSchedule() {
            console.log("cntSchedule");
            const schedulesDirUrl = this.PodUrl + 'schedules/';
            const titlesDirUrl = schedulesDirUrl + 'titles/';

            // titles ディレクトリのコンテンツを取得
            let titlesDataset;
            try {
                titlesDataset = await getSolidDataset(titlesDirUrl, { fetch: fetch });
            } catch (error) {
                if (typeof error.statusCode === "number" && error.statusCode === 404) {
                    console.error("Titles directory not found.");
                    return 0;
                } else {
                    console.error(error.message);
                    return 0;
                }
            }

            // titles ディレクトリ内の全てのファイルURLを取得
            const titleResourceUrls = titlesDataset.containedResources;

            // ファイル数を返す
            return titleResourceUrls.length;
        },
        async updateToDoList(myChangedDataset) {
            console.log("updateToDoList");
            console.log(this.selectedDate);

            // 予定を保存するディレクトリのURLを定義
            const schedulesDirUrl = this.PodUrl + 'schedules/';

            // titles と dates のサブディレクトリのURLを定義
            const titlesDirUrl = schedulesDirUrl + 'titles/';
            const datesDirUrl = schedulesDirUrl + 'dates/';

            // titles ディレクトリが存在しない場合は作成
            try {
                await getSolidDataset(titlesDirUrl, { fetch: fetch });
            } catch (error) {
                if (typeof error.statusCode === "number" && error.statusCode === 404) {
                    await createContainerAt(
                        titlesDirUrl,
                        { fetch: fetch }
                    );
                    console.log(`Created directory: ${titlesDirUrl}`);
                } else {
                    console.error(error.message);
                    return;
                }
            }

            // dates ディレクトリが存在しない場合は作成
            try {
                await getSolidDataset(datesDirUrl, { fetch: fetch });
            } catch (error) {
                if (typeof error.statusCode === "number" && error.statusCode === 404) {
                    await createContainerAt(
                        datesDirUrl,
                        { fetch: fetch }
                    );
                    console.log(`Created directory: ${datesDirUrl}`);
                } else {
                    console.error(error.message);
                    return;
                }
            }

            let titles = myChangedDataset.split("\n");

            // イベントごとに処理
            for (let i = 0; i < titles.length; i++) {
                let title = titles[i];
                if (title.trim() !== "") {
                    // イベントIDとしてユニークな文字列を生成（例：タイムスタンプとインデックスの組み合わせ）
                    let eventId = 'event-' + Date.now() + '-' + i;

                    // タイトルと日時のファイルのURLを定義
                    const titleFileUrl = titlesDirUrl + eventId + '.ttl';
                    const datesFileUrl = datesDirUrl + eventId + '.ttl';

                    // タイトルのデータセットを作成
                    let titleDataset = createSolidDataset();
                    let titleThing = createThing({ name: eventId });
                    titleThing = addUrl(titleThing, RDF.type, SCHEMA_INRUPT.Event);
                    titleThing = addStringNoLocale(titleThing, SCHEMA_INRUPT.name, title);
                    titleThing = addStringNoLocale(titleThing, SCHEMA_INRUPT.identifier, eventId);
                    titleDataset = setThing(titleDataset, titleThing);

                    // タイトルのデータセットを保存
                    try {
                        await saveSolidDatasetAt(
                            titleFileUrl,
                            titleDataset,
                            { fetch: fetch }
                        );
                        console.log(`Saved title: ${titleFileUrl}`);
                    } catch (error) {
                        console.error(`Error saving title for ${eventId}:`, error);
                    }

                    // 日時のデータセットを作成
                    let datesDataset = createSolidDataset();
                    let datesThing = createThing({ name: eventId });
                    datesThing = addUrl(datesThing, RDF.type, SCHEMA_INRUPT.Event);
                    datesThing = addStringNoLocale(datesThing, SCHEMA_INRUPT.identifier, eventId);

                    if (this.selectedData && this.selectedData[i]) {
                        let startDate = new Date(this.selectedData[i].startDate);
                        let endDate = new Date(this.selectedData[i].endDate);

                        datesThing = addDatetime(datesThing, SCHEMA_INRUPT.startDate, startDate);
                        datesThing = addDatetime(datesThing, SCHEMA_INRUPT.endDate, endDate);
                    } else {
                        console.warn(`No date provided for item ${i}`);
                    }

                    datesDataset = setThing(datesDataset, datesThing);

                    // 日時のデータセットを保存
                    try {
                        await saveSolidDatasetAt(
                            datesFileUrl,
                            datesDataset,
                            { fetch: fetch }
                        );
                        console.log(`Saved dates: ${datesFileUrl}`);
                    } catch (error) {
                        console.error(`Error saving dates for ${eventId}:`, error);
                    }
                }
            }
        }

        
    }
}
</script>
  