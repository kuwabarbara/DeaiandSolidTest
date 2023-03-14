<template>
    <div>
        <hr>
        {{ id }}
        <hr>
        <div>
            <ul>
            <li v-for="(user, index) in users" :key="index">
                {{ user.email }}
                このuserのuidは{{user.user_id}}
            </li>
            </ul>
        </div>
    </div>
</template>

<script>
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/storage";


export default {
  data() {
    return {
      users :[],
      file: null,
      id :""
    }
  },
  methods: {
  },
  created() {    
    const userId = this.$route.params.id
    this.id=userId

    firebase
      .database()
      .ref("users")
      .on("value", snapshot => {
        this.users = Object.values(snapshot.val());
      }
      );
    },
  mounted() {
        firebase
        .database()
        .ref("users")
        .on("child_added", snapshot => {
            this.users.push(snapshot.val());
        });
  }
}
</script>
