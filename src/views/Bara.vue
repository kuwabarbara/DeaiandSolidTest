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
        <hr>
        <!-- 空いている時間帯を表示する部分 -->
        <h3>Find Available Slots</h3>
        <button @click="findAvailableSlots">Find Available Slots</button>
        <br>
        <pre>{{ AvailableSlots }}</pre>
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
            ReadData: {},
            otherUserWebId: '',
            OtherUserData: {},
            checklists: [], // 追加: checklistsリスト
            AvailableSlots: [] // 追加: AvailableSlotsリスト
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
                console.log("Available Pods:", pods);
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
            await this.readSchedulesFromPod(this.PodUrl, 'My', true); // 自分のPodの場合はtrue
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
                await this.readSchedulesFromPod(otherUserPodUrl, 'OtherUser', false); // 他のユーザーのPodの場合はfalse
            } catch (error) {
                console.error("Error fetching other user's Pod URL:", error);
            }
        },
        async readSchedulesFromPod(podUrl, dataType, isOwnPod) {
            const schedulesDirUrl = podUrl + 'schedules/';
            const titlesDirUrl = schedulesDirUrl + 'titles/';
            const datesDirUrl = schedulesDirUrl + 'dates/';

            // Reset checklists before fetching new URLs
            this.checklists = [];

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

            // マップグラフの作成
            const eventMap = {};

            for (let url of this.checklists) {
                // Determine if the URL is a title or dates file
                const isTitleFile = url.includes('/titles/');
                const isDatesFile = url.includes('/dates/');

                // Extract event ID from URL
                const eventId = this.extractEventId(url);
                if (!eventId) {
                    console.error(`Failed to extract eventId from URL: ${url}`);
                    continue;
                }

                // Initialize event entry if not exists
                if (!eventMap[eventId]) {
                    eventMap[eventId] = {
                        eventId: eventId,
                        title: null,
                        startDate: null,
                        endDate: null,
                        titleAccess: 'Not Found',
                        datesAccess: 'Not Found'
                    };
                }

                // Check access: if own Pod, assume accessible
                let accessible = isOwnPod ? true : await this.checkFileAccess(url);

                if (accessible) {
                    // Fetch and parse content
                    const content = await this.fetchAndLogContent(url, isTitleFile ? 'Title' : 'Dates');
                    const parsedData = this.parseTTLContent(content);

                    if (isTitleFile) {
                        if (parsedData && parsedData.name) {
                            eventMap[eventId].title = parsedData.name;
                            eventMap[eventId].titleAccess = 'Accessible';
                        } else {
                            console.log(`Title data missing in ${url}`);
                        }
                    }

                    if (isDatesFile) {
                        if (parsedData && parsedData.startDate && parsedData.endDate) {
                            // 修正: parsedData.startDate と parsedData.endDate を Date オブジェクトに変換
                            const startDate = new Date(parsedData.startDate);
                            const endDate = new Date(parsedData.endDate);
                            if (!isNaN(startDate) && !isNaN(endDate)) {
                                eventMap[eventId].startDate = startDate.toISOString();
                                eventMap[eventId].endDate = endDate.toISOString();
                                eventMap[eventId].datesAccess = 'Accessible';
                            } else {
                                console.log(`Invalid date format in ${url}`);
                            }
                        } else {
                            console.log(`Dates data missing in ${url}`);
                        }
                    }
                } else {
                    // Access denied
                    if (isTitleFile) {
                        eventMap[eventId].titleAccess = 'Access Denied';
                    }
                    if (isDatesFile) {
                        eventMap[eventId].datesAccess = 'Access Denied';
                    }
                }
            }

            // ログ出力
            console.log(`${dataType} User's Event Map:`, eventMap);

            // UIに表示
            if (dataType === 'My') {
                this.ReadData = eventMap;
            } else if (dataType === 'OtherUser') {
                this.OtherUserData = eventMap;
            }
        },
        extractEventId(url) {
            // URLのパスからイベントIDを抽出
            try {
                const path = new URL(url).pathname;
                const segments = path.split('/');
                const fileName = segments.pop() || segments.pop(); // Handle potential trailing slash
                const eventId = fileName.replace('.ttl', '');
                return eventId;
            } catch (error) {
                console.error(`Error extracting eventId from URL ${url}:`, error);
                return null;
            }
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
            // 改善されたTTLパーサー
            if (!content) return null;
            const lines = content.split('\n');
            const data = {};
            for (let line of lines) {
                // タイトルファイルの解析
                if (line.includes('<http://schema.org/name>')) {
                    const match = line.match(/<http:\/\/schema\.org\/name>\s+"([^"]+)"/);
                    if (match) {
                        data.name = match[1];
                    }
                }
                if (line.includes('<http://schema.org/identifier>')) {
                    const match = line.match(/<http:\/\/schema\.org\/identifier>\s+"([^"]+)"/);
                    if (match) {
                        data.identifier = match[1];
                    }
                }
                // 日付ファイルの解析
                if (line.includes('<http://schema.org/startDate>')) {
                    const match = line.match(/<http:\/\/schema\.org\/startDate>\s+"([^"]+)"/);
                    if (match) {
                        data.startDate = match[1];
                    }
                }
                if (line.includes('<http://schema.org/endDate>')) {
                    const match = line.match(/<http:\/\/schema\.org\/endDate>\s+"([^"]+)"/);
                    if (match) {
                        data.endDate = match[1];
                    }
                }
            }
            return data;
        },
        async findAvailableSlots() {
            console.log("findAvailableSlots");

            // 取得した自分と相手のイベントデータを取得
            const myEvents = Object.values(this.ReadData).filter(event => event.startDate && event.endDate);
            const otherEvents = Object.values(this.OtherUserData).filter(event => event.startDate && event.endDate);

            // イベントを統合
            const allEvents = [...myEvents, ...otherEvents];

            if (allEvents.length === 0) {
                console.log("No events found to calculate available slots.");
                this.AvailableSlots = [];
                return;
            }

            // 日程調整のための時間範囲を定義（例: 今日から1週間）
            const now = new Date();
            const startRange = new Date(now);
            const endRange = new Date(now);
            endRange.setDate(endRange.getDate() + 7); // 1週間後

            // 毎日の業務時間を定義（例: 08:00 - 20:00）
            const dailyStartHour = 0;
            const dailyEndHour = 24;

            // 各日の予定を収集
            const busySlots = {};

            for (let event of allEvents) {
                const eventStart = new Date(event.startDate);
                const eventEnd = new Date(event.endDate);

                // イベントが範囲外の場合はスキップ
                if (eventEnd < startRange || eventStart > endRange) continue;

                // イベントが開始範囲より前の場合は調整
                const actualStart = eventStart < startRange ? new Date(startRange) : eventStart;
                // イベントが終了範囲より後の場合は調整
                const actualEnd = eventEnd > endRange ? new Date(endRange) : eventEnd;

                // イベントが複数日にまたがる場合を考慮
                let current = new Date(actualStart);
                while (current < actualEnd) {
                    const day = current.toISOString().split('T')[0];
                    if (!busySlots[day]) {
                        busySlots[day] = [];
                    }

                    // 当日の業務時間の開始と終了
                    const dayStart = new Date(`${day}T${String(dailyStartHour).padStart(2, '0')}:00:00.000Z`);
                    const dayEnd = new Date(`${day}T${String(dailyEndHour).padStart(2, '0')}:00:00.000Z`);

                    // イベントの当日開始と終了
                    const slotStart = new Date(Math.max(actualStart, dayStart));
                    const slotEnd = new Date(Math.min(actualEnd, dayEnd));

                    if (slotStart < slotEnd) {
                        busySlots[day].push({ start: slotStart, end: slotEnd });
                    }

                    // 次の日へ
                    current.setUTCDate(current.getUTCDate() + 1);
                    current.setUTCHours(0, 0, 0, 0);
                }
            }

            // 各日の空き時間を計算
            const availableSlots = [];

            for (let d = new Date(startRange); d <= endRange; d.setUTCDate(d.getUTCDate() + 1)) {
                const day = d.toISOString().split('T')[0];
                const dayStart = new Date(`${day}T${String(dailyStartHour).padStart(2, '0')}:00:00.000Z`);
                const dayEnd = new Date(`${day}T${String(dailyEndHour).padStart(2, '0')}:00:00.000Z`);

                const slots = busySlots[day] || [];

                // ソート
                slots.sort((a, b) => a.start - b.start);

                // 空き時間を計算
                let lastEnd = dayStart;

                for (let slot of slots) {
                    if (lastEnd < slot.start) {
                        availableSlots.push({
                            day: day,
                            start: new Date(lastEnd),
                            end: new Date(slot.start)
                        });
                    }
                    if (slot.end > lastEnd) {
                        lastEnd = slot.end;
                    }
                }

                if (lastEnd < dayEnd) {
                    availableSlots.push({
                        day: day,
                        start: new Date(lastEnd),
                        end: new Date(dayEnd)
                    });
                }
            }

            // 空いている時間帯をコンソールに表示
            console.log("Available Slots:");
            availableSlots.forEach(slot => {
                console.log(`${slot.day}: ${slot.start.toISOString()} - ${slot.end.toISOString()}`);
            });

            // UIに表示
            this.AvailableSlots = availableSlots.map(slot => ({
                day: slot.day,
                start: slot.start.toISOString(),
                end: slot.end.toISOString()
            }));
        }
    }
}
</script>

<style scoped>
/* スタイルは必要に応じて追加してください */
table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
}

th, td {
    border: 1px solid #ddd;
    padding: 8px;
}

th {
    background-color: #f2f2f2;
    text-align: left;
}
</style>