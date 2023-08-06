<template>
    <div style="width: 100%; height: 100%;">
        <div class="content" ref="content">
            <slot></slot>
        </div>
        <canvas class="background" ref="canvas"></canvas>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useThreeStore } from "@/stores/three.store"

export default defineComponent({
    props: {
        show_orientation: Boolean
    },
    setup() {
        const threeStore = useThreeStore();

        return {
            content: ref<HTMLDivElement>(),
            canvas: ref<HTMLCanvasElement>(),

            // threejs store helpers
            ts: threeStore
        }
    },
    activated() {
        this.canvas!.style.opacity = "1";
    },
    async mounted() {
        if (this.canvas && this.content) {
            await this.ts.initScene(this.canvas, this.content);

            this.canvas.style.opacity = "1";
        }
    },
})
</script>

<style scoped>
.content {
    z-index: 2;
    position: absolute;
    display: block;
    background-color: transparent;
    height: 100%;
    width: 100%;
    overflow-y: scroll;
}

.background {
    display: block;
    position: absolute;
    z-index: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 1500ms ease-out;
}
</style>