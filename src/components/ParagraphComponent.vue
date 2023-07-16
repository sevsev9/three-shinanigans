<template>
    <div class="paragraph">
        <div>
            <!-- Heading and Subheading -->
            <p>{{ heading }}</p>
            <p>{{ subheading }}</p>
        </div>
        <!-- Text -->
        <p>
            {{ paragraph }}
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props: {
        heading: String,
        subheading: String,
        paragraph: String,
    }
})
</script>

<style scoped>
.paragraph {
    font-family: 'Kanit', sans-serif;
    font-size: 1.2em;
    width: 60%;
    padding: 1em;
    margin: 5em auto;
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
    padding: 0.5em;
}
</style>