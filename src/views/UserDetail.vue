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
            <form @submit.prevent="uploadImage">
                <input type="file" @change="onFileChange">
                <button type="submit">アップロード</button>
            </form>
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

    // ファイルが選択された時に呼ばれるメソッド
    onFileChange(event) {
      this.file = event.target.files[0];
    },
    // ファイルをアップロードするメソッド
    uploadImage() {
      const storageRef = firebase.storage().ref();

      // ユーザーのUIDとファイル名
      const uid = this.$route.params.id;
      const fileName = "profile.jpg";

      // Storageに画像をアップロードする
      const path = `users/${uid}/${fileName}`;
      const fileRef = storageRef.child(path);
      fileRef.put(this.file).then(() => {
        console.log("アップロードが完了しました。");
      });
    }
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
