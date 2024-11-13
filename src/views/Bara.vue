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
        <button @click="readTodoList">Read Todo List</button>
        <br>
        <br>
        Read Data:
        <br>
        {{ ReadData }}
        <br>
    </div>
</template>

<script>
import { getDefaultSession } from '@inrupt/solid-client-authn-browser'
import { fetch } from '@inrupt/solid-client-authn-browser'

import {
    addUrl,
    addStringNoLocale,
    createSolidDataset,
    createThing,
    getPodUrlAll,
    getSolidDataset,
    getThingAll,
    getStringNoLocale,
    saveSolidDatasetAt,
    setThing,
    addDatetime,
    getDatetime,
    createContainerAt,
    getContainedResourceUrlAll,
} from "@inrupt/solid-client";

import { universalAccess } from "@inrupt/solid-client";

import { SCHEMA_INRUPT, RDF } from "@inrupt/vocab-common-rdf";

import { handleIncomingRedirect, login } from '@inrupt/solid-client-authn-browser';

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
            ReadData: []
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
                this.PodUrl = pods[0] + "KuwaSchedule/";
                console.log(this.PodUrl);
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

            // Ensure directories exist
            try {
                await getSolidDataset(titlesDirUrl, { fetch: fetch });
            } catch (error) {
                if (error.statusCode === 404) {
                    await createContainerAt(titlesDirUrl, { fetch: fetch });
                } else {
                    console.error(error.message);
                    return;
                }
            }

            try {
                await getSolidDataset(datesDirUrl, { fetch: fetch });
            } catch (error) {
                if (error.statusCode === 404) {
                    await createContainerAt(datesDirUrl, { fetch: fetch });
                } else {
                    console.error(error.message);
                    return;
                }
            }

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
        async setAccess(fileUrl, accessLevel) {
            const isPublic = accessLevel === 'public';
            try {
                await universalAccess.setPublicAccess(
                    fileUrl,
                    { read: isPublic, write: false },
                    { fetch: fetch }
                );
                console.log(`Set ${accessLevel} access for ${fileUrl}`);
            } catch (error) {
                console.error(`Error setting access for ${fileUrl}:`, error);
            }
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
                if (error.statusCode === 404) {
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
                if (error.statusCode === 404) {
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
                    let titleThing = getThingAll(titleDataset)[0];

                    let eventId = getStringNoLocale(titleThing, SCHEMA_INRUPT.identifier);
                    let title = getStringNoLocale(titleThing, SCHEMA_INRUPT.name);

                    // Get access permissions
                    let titleAccess = await this.getAccessPermissions(resourceUrl);

                    if (eventId && title) {
                        titlesMap[eventId] = { title, titleAccess };
                    }
                } catch (error) {
                    console.error(`Error reading title from ${resourceUrl}:`, error);
                }
            }

            let datesMap = {};
            for (let resourceUrl of datesResourceUrls) {
                try {
                    let datesDataset = await getSolidDataset(resourceUrl, { fetch: fetch });
                    let datesThing = getThingAll(datesDataset)[0];

                    let eventId = getStringNoLocale(datesThing, SCHEMA_INRUPT.identifier);
                    let startDate = getDatetime(datesThing, SCHEMA_INRUPT.startDate);
                    let endDate = getDatetime(datesThing, SCHEMA_INRUPT.endDate);

                    // Get access permissions
                    let datesAccess = await this.getAccessPermissions(resourceUrl);

                    if (eventId) {
                        datesMap[eventId] = {
                            startDate,
                            endDate,
                            datesAccess
                        };
                    }
                } catch (error) {
                    console.error(`Error reading dates from ${resourceUrl}:`, error);
                }
            }

            // イベントIDでデータを結合
            let listContent = [];

            for (let eventId in titlesMap) {
                let titleInfo = titlesMap[eventId];
                let dates = datesMap[eventId] || {};
                listContent.push({
                    eventId: eventId,
                    title: titleInfo.title,
                    startDate: dates.startDate,
                    endDate: dates.endDate,
                    titleAccess: titleInfo.titleAccess,
                    datesAccess: dates.datesAccess
                });

                // Log access permissions
                console.log(`Title File Access for ${eventId}: ${titleInfo.titleAccess}`);
                console.log(`Dates File Access for ${eventId}: ${dates.datesAccess}`);
            }

            console.log(listContent);

            // データを表示または使用
            this.ReadData = listContent;
        },
        async getAccessPermissions(resourceUrl) {
            let access = await universalAccess.getPublicAccess(
                resourceUrl,
                { fetch: fetch }
            );

            if (access === null) {
                console.log(`Could not load access details for ${resourceUrl}.`);
                return 'unknown';
            } else {
                if (access.read === true) {
                    return 'public';
                } else {
                    return 'private';
                }
            }
        },
    }
}
</script>