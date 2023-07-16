<template>
    <div style="width: 100%; height: 100%;">
        <div class="content" ref="content">
            <slot></slot>
        </div>
        <canvas id="background"></canvas>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import * as THREE from "three";
import { useThreeStore } from "@/stores/three.store"

export default defineComponent({
    props: {
        show_orientation: Boolean
    },
    setup() {
        const threeStore = useThreeStore();

        return {
            content: ref<HTMLDivElement>(),
            mouseX: 0,
            mouseY: 0,
            scroll_top: 0,
            renderer: undefined as THREE.WebGLRenderer | undefined,
            canvas: undefined as HTMLCanvasElement | undefined,
            camera: undefined as THREE.PerspectiveCamera | undefined,
            camera_settings: {
                fov: 60,
                aspect: 2,
                near: 1,
                far: 100
            },
            scene: undefined as THREE.Scene | undefined,
            points: undefined as THREE.Points | undefined,
            points_settings: {
                psize: 0.07,
                pcolor: 0x44aa88,
                pamount: 15000
            },
            sphere_settings: {
                radius: 2,
                segments: 20,
                rings: 15,
                init_offset: [-10, 5, -5]
            },
            moon_settings: {
                radius: 5,
                segments: 100,
                rings: 100,
                init_offset: [15, -15, -10]
            },
            moon_sphere: undefined as THREE.Mesh | undefined,
            wireframe_sphere: undefined as THREE.Mesh | undefined,

            // threejs store helpers
            ts: threeStore
        }
    },
    activated() {
        document.getElementById("background")!.style.opacity = "1";
    },
    async mounted() {
        const canvas = document.getElementById("background");

        if (canvas) {
            const texture_loader = new THREE.TextureLoader();
            const star_texture = await texture_loader.loadAsync("/sparkle_star.png");
            const moon_texture = await texture_loader.loadAsync('/dis_map_moon_nasa_16_uint.png');
            const moon_dis_map = await texture_loader.loadAsync('/nasa_moon_colors.png');

            window.addEventListener("mousemove", (e: MouseEvent) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
            });

            this.content?.addEventListener("scroll", this.scrollHandler);

            // Main Scene
            this.scene = new THREE.Scene();


            // add axis helper to visualize orientiation in the scene
            if (this.show_orientation) {
                this.ts.addAxisHelper(this.scene);
            }

            // set the camera aspect to the current canvas' aspect ratio
            this.camera_settings.aspect = canvas.clientHeight / canvas.clientWidth;

            const { fov, aspect, near, far } = this.camera_settings;
            this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
            this.camera.position.z = 5;

            // light source
            this.scene.add(
                this.ts.createLightSource(
                    {
                        init_pos: [-1, 2, 4],
                        params: {
                            color: 0xffffff,
                            intensity: 1
                        }
                    }
                )
            );

            // create points
            this.points = this.ts.createPointsMesh({
                init_pos: [0, 0, 0],
                params: {
                    size: 0.07,
                    color: 0xffffff,
                    amount: 15000
                }
            }, star_texture);
            this.scene.add(this.points);

            // wireframe

            this.wireframe_sphere = this.ts.createWireframeSphere({
                init_pos: [-10, 5, -5],
                params: {
                    radius: 2,
                    segments: 20,
                    rings: 15
                },
            }, 0x9b9b9b);
            this.scene.add(this.wireframe_sphere);

            // moon
            this.moon_sphere = this.ts.createMoonObject({
                init_pos: [15, -15, -10],
                params: {
                    radius: 5,
                    segments: 100,
                    rings: 100
                }
            });
            this.scene.add(this.moon_sphere);

            // renderer and animation loop
            this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
            requestAnimationFrame(this.render);

            canvas.style.opacity = "1";
        }
    },
    methods: {
        resizeRendererToDisplaySize(renderer: THREE.Renderer) {
            const canvas = renderer.domElement;

            const width = canvas.clientWidth;
            const height = canvas.clientHeight;

            const needResize = canvas.width !== width || canvas.height !== height;

            // resize only when necessary
            if (needResize) {
                //3rd parameter `false` to change the internal canvas size
                renderer.setSize(width, height, false);
            }
            return needResize;
        },
        render(time: number) {
            time *= 0.001; // seconds

            if (this.renderer && this.camera && this.points && this.wireframe_sphere && this.moon_sphere) {
                const renderer = this.renderer;
                const camera = this.camera;
                const points = this.points;
                const ws = this.wireframe_sphere;
                const moon = this.moon_sphere;

                if (this.resizeRendererToDisplaySize(renderer)) {
                    const canvas = this.renderer.domElement;
                    camera.aspect = canvas.clientWidth / canvas.clientHeight;
                    camera.updateProjectionMatrix();
                }

                // dependend on scroll move background
                points.position.y = (this.mouseY * 0.0001) + this.scroll_top * 0.001;
                points.position.x = -this.mouseX * 0.0001;

                // dependend on scroll move globe
                ws.position.x = this.sphere_settings.init_offset[0] + (this.mouseX * 0.0001) + (this.scroll_top * 0.001);
                ws.position.y = this.sphere_settings.init_offset[1] + (this.mouseY * 0.0001) + (this.scroll_top * 0.01);

                // dependend on scroll, move moon
                moon.position.x = this.moon_settings.init_offset[0] + (-this.mouseX * 0.0005);
                moon.position.y = this.moon_settings.init_offset[1] + (this.mouseY * 0.0005) + (this.scroll_top * 0.01);

                // rotate background to simulate flying
                points.rotation.x = time * 0.01;
                points.rotation.y = time * 0.01;

                // rotate and move wireframe globe
                ws.rotation.x = (time * 0.06);
                ws.rotation.y = (time * 0.06);

                // rotate moon
                moon.rotation.x = -(time * 0.05);
                moon.rotation.y = -(time * 0.05);

                // render the scene
                renderer.render(this.scene!, camera);

                // loop
                requestAnimationFrame(this.render);
            }
        },
        scrollHandler() {
            this.scroll_top = this.content ? this.content.scrollTop : 0;
        }
    },
    beforeUnmount() {
        this.content?.removeEventListener('scroll', this.scrollHandler)
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

#background {
    display: block;
    position: absolute;
    z-index: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 1500ms ease-out;
}
</style>