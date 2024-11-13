<template>
    <div>
        <button @click="startLogin">Login</button>
        <br>
        <button @click="checkLogin">Check Login</button>
        <br>

        <input type="text" v-model="inputText" placeholder="Enter event title">
        <br>

        <form @submit.prevent="handleSubmit">
            <div>
                <label for="start">Start Date:</label>
                <input type="datetime-local" id="start" v-model="newStartDate">
            </div>
            <div>
                <label for="end">End Date:</label>
                <input type="datetime-local" id="end" v-model="newEndDate">
            </div>
            <div>
                <label for="titleAccess">Title Access:</label>
                <select v-model="newTitleAccess">
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                </select>
            </div>
            <div>
                <label for="datesAccess">Dates Access:</label>
                <select v-model="newDatesAccess">
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                </select>
            </div>
            <button type="submit">Add Schedule</button>
        </form>

        <br>
        <button @click="readTodoList">Read My Todo List</button>
        <br>
        <br>
        Read Data:
        <br>
        <pre>{{ ReadData }}</pre>
        <br>
        <hr>
        <!-- 他のユーザーのPodからデータを取得する部分 -->
        <h3>Read Other User's Schedules</h3>
        <input type="text" v-model="otherUserWebId" placeholder="Enter other user's WebID">
        <br>
        <button @click="readOtherUserSchedules">Read Other User's Schedules</button>
        <br>
        <br>
        Other User's Data:
        <br>
        <pre>{{ OtherUserData }}</pre>
        <br>
    </div>
</template>

<script>
import { getDefaultSession, handleIncomingRedirect, login } from '@inrupt/solid-client-authn-browser';
import { fetch } from '@inrupt/solid-client-authn-browser';

import {
    addUrl,
    addStringNoLocale,
    createSolidDataset,
    createThing,
    getPodUrlAll,
    getSolidDataset,
    saveSolidDatasetAt,
    setThing,
    addDatetime,
    createContainerAt,
    getContainedResourceUrlAll,
} from "@inrupt/solid-client";

import { universalAccess } from "@inrupt/solid-client";

import { SCHEMA_INRUPT, RDF } from "@inrupt/vocab-common-rdf";

export default {
    name: 'Bara',

    data() {
        return {
            inputText: '',
            PodUrl: '',
            selectedData: [],
            newStartDate: "",
            newEndDate: "",
            newTitleAccess: "public",
            newDatesAccess: "private",
            ReadData: [],
            otherUserWebId: '',
            OtherUserData: [],
            checklists: [] // 追加: checklistsリスト
        };
    },
    created() {
        this.completeLogin();
    },
    methods: {
        async startLogin() {
            if (!getDefaultSession().info.isLoggedIn) {
                await login({
                    oidcIssuer: "https://login.inrupt.com",
                    redirectUrl: new URL("/bara", window.location.href).toString(),
                    clientName: "My application"
                });
            }
        },
        async checkLogin() {
            if (getDefaultSession().info.isLoggedIn) {
                console.log(`Logged in as ${getDefaultSession().info.webId}`);
                const pods = await getPodUrlAll(getDefaultSession().info.webId, { fetch: fetch });
                console.log(pods);
                if (pods.length === 0) {
                    console.error("No Pods found for this WebID.");
                    return;
                }
                this.PodUrl = pods[0] + "KuwaSchedule/";
                console.log(`Pod URL set to: ${this.PodUrl}`);
            } else {
                console.log(`Not logged in`);
            }
        },
        async completeLogin() {
            await handleIncomingRedirect();
        },
        handleSubmit() {
            this.addSchedule(this.newStartDate, this.newEndDate, this.newTitleAccess, this.newDatesAccess);
            this.newStartDate = "";
            this.newEndDate = "";
            this.newTitleAccess = "public";
            this.newDatesAccess = "private";
            this.inputText = '';
        },
        addSchedule(startDate, endDate, titleAccess, datesAccess) {
            this.selectedData.push({
                title: this.inputText,
                startDate,
                endDate,
                titleAccess,
                datesAccess
            });
            this.updateToDoList();
        },
        async updateToDoList() {
            console.log("updateToDoList");
            const schedulesDirUrl = this.PodUrl + 'schedules/';
            const titlesDirUrl = schedulesDirUrl + 'titles/';
            const datesDirUrl = schedulesDirUrl + 'dates/';

            // Ensure schedules directory exists and set to public
            await this.ensureContainerExists(schedulesDirUrl);

            // Ensure titles directory exists and set to public
            await this.ensureContainerExists(titlesDirUrl);

            // Ensure dates directory exists and set to public
            await this.ensureContainerExists(datesDirUrl);

            // Process each event
            for (let i = 0; i < this.selectedData.length; i++) {
                const event = this.selectedData[i];
                if (event.title.trim() !== "") {
                    let eventId = 'event-' + Date.now() + '-' + i;

                    const titleFileUrl = titlesDirUrl + eventId + '.ttl';
                    const datesFileUrl = datesDirUrl + eventId + '.ttl';

                    // Create and save title dataset
                    let titleDataset = createSolidDataset();
                    let titleThing = createThing({ name: eventId });
                    titleThing = addUrl(titleThing, RDF.type, SCHEMA_INRUPT.Event);
                    titleThing = addStringNoLocale(titleThing, SCHEMA_INRUPT.name, event.title);
                    titleThing = addStringNoLocale(titleThing, SCHEMA_INRUPT.identifier, eventId);
                    titleDataset = setThing(titleDataset, titleThing);

                    try {
                        await saveSolidDatasetAt(titleFileUrl, titleDataset, { fetch: fetch });
                        console.log(`Saved title: ${titleFileUrl}`);
                    } catch (error) {
                        console.error(`Error saving title for ${eventId}:`, error);
                    }

                    // Set access for title file
                    await this.setAccess(titleFileUrl, event.titleAccess);

                    // Create and save dates dataset
                    let datesDataset = createSolidDataset();
                    let datesThing = createThing({ name: eventId });
                    datesThing = addUrl(datesThing, RDF.type, SCHEMA_INRUPT.Event);
                    datesThing = addStringNoLocale(datesThing, SCHEMA_INRUPT.identifier, eventId);
                    datesThing = addDatetime(datesThing, SCHEMA_INRUPT.startDate, new Date(event.startDate));
                    datesThing = addDatetime(datesThing, SCHEMA_INRUPT.endDate, new Date(event.endDate));
                    datesDataset = setThing(datesDataset, datesThing);

                    try {
                        await saveSolidDatasetAt(datesFileUrl, datesDataset, { fetch: fetch });
                        console.log(`Saved dates: ${datesFileUrl}`);
                    } catch (error) {
                        console.error(`Error saving dates for ${eventId}:`, error);
                    }

                    // Set access for dates file
                    await this.setAccess(datesFileUrl, event.datesAccess);
                }
            }

            // Clear selectedData after processing
            this.selectedData = [];
        },
        async ensureContainerExists(containerUrl) {
            try {
                await getSolidDataset(containerUrl, { fetch: fetch });
                console.log(`Container already exists: ${containerUrl}`);
            } catch (error) {
                if (error.statusCode === 404) {
                    try {
                        await createContainerAt(containerUrl, { fetch: fetch });
                        console.log(`Created container: ${containerUrl}`);
                        // Set access on the container to public
                        await this.setAccess(containerUrl, 'public');
                    } catch (createError) {
                        console.error(`Error creating container ${containerUrl}:`, createError);
                    }
                } else {
                    console.error(`Error accessing container ${containerUrl}:`, error);
                }
            }
        },
        async setAccess(resourceUrl, accessLevel) {
            try {
                if (accessLevel === 'public') {
                    await universalAccess.setPublicAccess(
                        resourceUrl,
                        { read: true, write: false },
                        { fetch: fetch }
                    );
                } else if (accessLevel === 'private') {
                    await universalAccess.setPublicAccess(
                        resourceUrl,
                        { read: false, write: false },
                        { fetch: fetch }
                    );
                }
                console.log(`Set ${accessLevel} access for ${resourceUrl}`);
            } catch (error) {
                console.error(`Error setting access for ${resourceUrl}:`, error);
            }
        },
        async readTodoList() {
            console.log("readTodoList");
            await this.readSchedulesFromPod(this.PodUrl, 'My');
        },
        async readOtherUserSchedules() {
            console.log("readOtherUserSchedules");
            if (!this.otherUserWebId) {
                console.error("Please enter the other user's WebID.");
                return;
            }
            try {
                const otherUserPods = await getPodUrlAll(this.otherUserWebId, { fetch: fetch });
                if (otherUserPods.length === 0) {
                    console.error("Could not find any Pods for the given WebID.");
                    return;
                }
                const otherUserPodUrl = otherUserPods[0] + "KuwaSchedule/";
                console.log(`Other user's Pod URL: ${otherUserPodUrl}`);
                await this.readSchedulesFromPod(otherUserPodUrl, 'OtherUser');
            } catch (error) {
                console.error("Error fetching other user's Pod URL:", error);
            }
        },
        async readSchedulesFromPod(podUrl, dataType) {
            const schedulesDirUrl = podUrl + 'schedules/';
            const titlesDirUrl = schedulesDirUrl + 'titles/';
            const datesDirUrl = schedulesDirUrl + 'dates/';

            // titles ディレクトリのコンテンツを取得
            let titlesDataset;
            try {
                titlesDataset = await getSolidDataset(titlesDirUrl, { fetch: fetch });
                console.log(`${dataType} user's Titles directory accessed successfully.`);
            } catch (error) {
                if (error.statusCode === 403) {
                    console.error(`${dataType} user has not granted access to titles directory.`);
                } else if (error.statusCode === 404) {
                    console.error(`${dataType} user's Titles directory not found.`);
                } else {
                    console.error(`Error accessing titles directory: ${error.message}`);
                }
                // Continue processing dates even if titles directory is inaccessible
            }

            // dates ディレクトリのコンテンツを取得
            let datesDataset;
            try {
                datesDataset = await getSolidDataset(datesDirUrl, { fetch: fetch });
                console.log(`${dataType} user's Dates directory accessed successfully.`);
            } catch (error) {
                if (error.statusCode === 403) {
                    console.error(`${dataType} user has not granted access to dates directory.`);
                } else if (error.statusCode === 404) {
                    console.error(`${dataType} user's Dates directory not found.`);
                } else {
                    console.error(`Error accessing dates directory: ${error.message}`);
                }
                // Continue processing titles even if dates directory is inaccessible
            }

            // titles と dates のファイルURLを取得し、.ttlファイルのみをフィルタリング
            let titleResourceUrls = [];
            if (titlesDataset) {
                titleResourceUrls = getContainedResourceUrlAll(titlesDataset).filter(url => url.endsWith('.ttl'));
            }

            let datesResourceUrls = [];
            if (datesDataset) {
                datesResourceUrls = getContainedResourceUrlAll(datesDataset).filter(url => url.endsWith('.ttl'));
            }

            // titles と dates の .ttlファイルのURLを checklists に格納
            this.checklists = [...titleResourceUrls, ...datesResourceUrls];

            // checklists をコンソールに表示
            console.log(`${dataType} user's Checklists:`);
            this.checklists.forEach(url => console.log(url));
        },
        async checkFileAccess(url) {
            try {
                const response = await fetch(url, { method: 'GET' });
                if (response.ok) {
                    console.log(`Accessible: ${url}`);
                    return true;
                } else if (response.status === 403) {
                    console.log(`Access Denied (403): ${url}`);
                    return false;
                } else {
                    console.log(`Access Failed (${response.status}): ${url}`);
                    return false;
                }
            } catch (error) {
                console.log(`Error accessing ${url}:`, error);
                return false;
            }
        },
        async fetchAndLogContent(url, type) {
            try {
                const response = await fetch(url, { method: 'GET' });
                if (response.ok) {
                    const content = await response.text();
                    console.log(`${type} TTL File Content (${url}):\n`, content);
                    return content;
                } else {
                    console.log(`Failed to fetch content for ${type} TTL File (${url}): ${response.status}`);
                    return null;
                }
            } catch (error) {
                console.log(`Error fetching content for ${type} TTL File (${url}):`, error);
                return null;
            }
        },
        parseTTLContent(content) {
            // 簡単なTTLパーサー。実際にはRDFパーサーを使用することを推奨します。
            if (!content) return null;
            const lines = content.split('\n');
            const data = {};
            for (let line of lines) {
                if (line.includes(SCHEMA_INRUPT.name)) {
                    const match = line.match(/schema:name\s+"([^"]+)"/);
                    if (match) {
                        data.name = match[1];
                    }
                }
                if (line.includes(SCHEMA_INRUPT.identifier)) {
                    const match = line.match(/schema:identifier\s+"([^"]+)"/);
                    if (match) {
                        data.identifier = match[1];
                    }
                }
                if (line.includes(SCHEMA_INRUPT.startDate)) {
                    const match = line.match(/schema:startDate\s+<([^>]+)>/);
                    if (match) {
                        data.startDate = new Date(match[1]);
                    }
                }
                if (line.includes(SCHEMA_INRUPT.endDate)) {
                    const match = line.match(/schema:endDate\s+<([^>]+)>/);
                    if (match) {
                        data.endDate = new Date(match[1]);
                    }
                }
            }
            return data;
        },
    }
}
</script>

<style scoped>
/* スタイルは必要に応じて追加してください */
</style>