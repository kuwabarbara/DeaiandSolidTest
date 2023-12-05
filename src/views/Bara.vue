<template>
    <div>
    桑原
    <button @click="startLogin">Login</button>
    <br>
    <button @click="checkLogin">Check Login</button>
    <br>

    {{loginCheck}}
    </div>
</template>
  


<script>

import {  login, getDefaultSession } from '@inrupt/solid-client-authn-browser'
import { handleIncomingRedirect } from '@inrupt/solid-client-authn-browser'
import { fetch } from '@inrupt/solid-client-authn-browser'
import { getSolidDataset, saveSolidDatasetAt } from "@inrupt/solid-client";


export default {
    name: 'Bara',

    data() {
        return {
            ReadData :null,
            SaveData :null,
            loginCheck : "not login",

        };
    },
    components: {

    },
    created() {
        this.completeLogin();
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
        async  checkLogin() {
            
            // Check if logged in. If so, show the user's WebID.
            if (getDefaultSession().info.isLoggedIn) {
                this.loginCheck = "login";
                console.log(`aaa`);
            }
            else{
                this.loginCheck = "not login";
                console.log(`bbb`);
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
            "https://storage.inrupt.com/somepod/todolist",
            { fetch: fetch }
            );

            this.ReadData = myDataset;
        },
        async updateToDoList(myChangedDataset) {

            // The user must be someone with Write access to the specified URL.
            const savedSolidDataset = await saveSolidDatasetAt(
            "https://storage.inrupt.com/somepod/todolist",
            myChangedDataset,
            { fetch: fetch }
            );

            this.SaveData = savedSolidDataset;
        }



    },
}
</script>
  