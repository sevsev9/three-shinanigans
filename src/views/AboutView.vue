<template>
  <div>
    
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TJSBackgroundVue from '@/components/TJSBackground.vue';

export default defineComponent({
  setup() {
    return {};
  },
  components: { TJSBackgroundVue }
})
</script>

<style scoped>
.paragraph {
  font-family: 'Kanit', sans-serif;
  font-size: 1.2em;
  width: 60%;
  padding: 1em;
  margin: auto;
}

.paragraph>div {
  width: 50%;
  margin: auto;
  text-align: center;
  border-radius: 2em;
  border-bottom: 2px dotted white;
  margin-bottom: 2em;
}

.paragraph>div>p:first-child {
  font-size: 2.5em;
  font-weight: 600;
}

.paragraph>div>p:last-child {
  font-size: 1.4em;
  font-weight: 400;
}
</style>