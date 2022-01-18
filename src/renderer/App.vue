<!--
 * @Description: 
 * @Date: 2021-09-13 14:17:28
 * @LastEditTime: 2022-01-14 10:16:53
-->
<template>
  <div id="app" class="beauty-scrollbar">
    <a-button shape="circle"
              icon="caret-left"
              size="small"
              class="back"
              v-show="showBackButton"
              @click="back" />
    <transition name="fade-transform"
                mode="out-in">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </transition>
  </div>
</template>

<script>

export default {
  name: 'App',

  data () {
    return {}
  },

  computed: {
    showBackButton () {
      return this.$route.path === '/configuration'
    }
  },

  methods: {
    back () {
      this.$router.go(-1)
    }
  }

}
</script>

<style lang="scss" scoped>
#app {
  overflow: auto;
  position: relative;
  padding: 20px 30px;
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;

  .back {
    position: fixed;
    top: 0px;
    left: 5px;
  }
}
</style>
<style>
/* CSS */
html,
body {
  margin: 0;
  padding: 0;
  background: #fff;
  font-family: Microsoft YaHei;
}

/* fade-transform */
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.2s;
}

.fade-transform-enter {
  opacity: 0;
  /* transform: translateX(-30px); */
}

.fade-transform-leave-to {
  opacity: 0;
  /* transform: translateX(30px); */
}
</style>
