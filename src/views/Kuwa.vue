<template>
  <div v-html="htmlContent"></div>
</template>

<script>

//import '../kuwasolid.js';

export default {
    
  data() {
    return {
      htmlContent: ''
    };
  },
  mounted() {
    fetch('mypage.html')
      .then(response => response.text())
      .then(html => {
        this.htmlContent = html;
      });
  }
};
</script>