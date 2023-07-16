<template>
  <div class="main-content">
    <nav>
      <div>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </div>
    </nav>

    <RouterView class="router-content"></RouterView>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {


    return {}
  }
})
</script>

<style scoped>
nav {
  width: 100%;
  height: 5vh;
  margin: 0;
}

nav>div {
  display: flex;
  gap: 1em;
  height: 100%;
  justify-content: center;
  align-items: center;
}

nav>div>*{
  text-decoration: none;
  text-align: center;
  color: white;
  height: 100%;
}

.router-content {
  height: 95vh;
  width: 100%;
}
</style>