<template>
  <div>
    <TJSBackgroundVue>
      <ParagraphComponent v-for="article in articles" :key="article.heading" :heading="article.heading"
        :subheading="article.subheading" :paragraph="article.paragraph"></ParagraphComponent>
    </TJSBackgroundVue>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TJSBackgroundVue from '@/components/TJSBackground.vue';
import ParagraphComponent from '@/components/ParagraphComponent.vue';
import articles from "@/stores/data/articles.json";

export default defineComponent({
  setup() {
    return {
      articles: articles as [{ heading: string, subheading: string, paragraph: string }]
    };
  },
  components: { TJSBackgroundVue, ParagraphComponent }
})
</script>

<style scoped></style>