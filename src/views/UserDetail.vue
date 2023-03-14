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
        
        <hr>
        <div>
            <img :src="imageUrl" alt="ユーザーのプロフィール画像">
        </div>
        <br>
        このひとのプロフィール写真です！
        <br>
        <hr>
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
      id :"",
      imageUrl: ""
    }
  },
  methods: {
  },
  created() {    
    const userId = this.$route.params.id
    this.id=userId

    const storageRef = firebase.storage().ref();

    // ユーザーのUIDとファイル名
    const uid = this.id;
    const fileName = "profile.jpg";

    // Storageから画像のURLを取得する
    const path = `users/${uid}/${fileName}`;
    storageRef.child(path).getDownloadURL().then(url => {
      this.imageUrl = url;
    });



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
