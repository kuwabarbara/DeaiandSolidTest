<template>
    <div>
    <!--
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
    -->

        <br>
        <h1>ユーザー情報</h1>
            <ul>
            <li>
                <h2>{{ user2.name }}</h2>
                <p>性別: {{ user2.gender }}</p>
                <p>ステータスコメント: {{ user2.status }}</p>
            </li>
            </ul>
        <br>
        <hr>

          <table>
            <thead style="padding: 20px;">
              <tr>
                <th></th>
                <th>Mon</th>
                <th>Tue</th>
                <th>Wed</th>
                <th>Thu</th>
                <th>Fri</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(classes, index) in timetable" :key="index">
                <td style="display: inline-block; white-space: nowrap;">{{ index + 1 }}限 </td>
                <td v-for="(classData, day) in classes" :key="day">
                  <input type="text" readonly :value="classData" @input="updateClassData(index, day, $event.target.value)">
                </td>
              </tr>
            </tbody>
          </table>

        
        <hr>
        <div>
          <v-card>
            <v-img :src="imageUrl" height="300" width="400" :contain="true" />
            <!-- <img :src="imageUrl" alt="ユーザーのプロフィール画像"> -->
            プロフィール写真
          </v-card>
        </div>
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
      imageUrl: "",
      user2: null,
      timetable: [
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" },
        { "Mon": "", "Tue": "", "Wed": "","Thu": "","Fri": "" }
      ],
    }
  },
  methods: {
  },
  created() {
    const userId = this.$route.params.id

    // Firebase Realtime Databaseから指定したIDのユーザー情報を取得する
    firebase.database().ref('users').orderByKey().equalTo(userId).once('value')
      .then(snapshot => {
        const userData = snapshot.val()

        // ユーザーデータをVueコンポーネントのデータに設定する
        this.user2 = userData[userId]
        console.log(userData[userId])
      })
      .catch(error => {
        console.error(error)
      })


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




      // Firebase Realtime Databaseからデータを取得する
      firebase.database().ref('timetables').child(uid).once('value')
        .then((snapshot) => {
          // 取得したデータをVue.jsのデータに代入する
          const data = snapshot.val();
          for (let i = 0; i < 10; i++) {
            for (let day in data[i]) {
              const index = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].indexOf(day);
              if (index >= 0) {
                this.timetable[i][index] = data[i][day];
              }
            }
          }
        })
        .catch((error) => {
          console.error(error);
        });


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
