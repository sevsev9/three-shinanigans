import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as THREE from "three";

export interface Settings<T> {
  /**
   * The initial offset (Array of 3 numbers, where [0] = x, [1] = y, [2] = z)
   */
  init_pos: number[],
  params: T
}

export interface SphereParams {
  radius: number,
  segments: number,
  rings: number
}

export interface PointParams {
  /**
   * The size of the individual points
   * @example 0.05
   */
  size: number,

  /**
   * The point color
   * @example 0x44aa88
   */
  color?: number,

  /**
   * The amount of points in the point material
   * @example 1500
   */
  amount: number

  /**
   * The size of the point object
   */
  cube_size: [x: number, y: number, z: number]
}

export interface LightSourceParams {
  color: number,
  intensity: number
}

export interface CameraSettings {
  fov: number,
  aspect: number,
  near: number,
  far: number
}

/**
 * This object defines an animation in relation to the mouse, scoll position and/or time.
 */
export interface AnimatedObject {
  mesh: THREE.Mesh | THREE.Points,

  /**
   * The function that is called on each frame.
   * 
   * @param mouse The current mouse position
   * @param scroll_pos The scroll position
   * @param time The time
   * @param mesh The mesh that is animated
   */
  animate: (mouse: { x: number, y: number }, scroll_pos: number, time: number, mesh: THREE.Mesh | THREE.Points) => void
}


const defaults = {
  view_size: [10, 10, 10],
  light: {
    init_pos: [-1, 2, 4],
    params: {
      color: 0xffffff,
      intensity: 1
    }
  } as Settings<LightSourceParams>,
  points: {
    init_pos: [0, 0, 0],
    params: {
      size: 0.07,
      color: 0xffffff,
      amount: 15000,
      cube_size: [20, 40, 10]
    }
  } as Settings<PointParams>,
  wire_sphere: {
    init_pos: [-20, 0, -25],
    params: {
      radius: 5,
      segments: 20,
      rings: 15
    },
  } as Settings<SphereParams>,
  moon: {
    init_pos: [100, -150, -100],
    params: {
      radius: 25,
      segments: 100,
      rings: 100
    }
  } as Settings<SphereParams>
}

export const useThreeStore = defineStore('three', {
  state: () => {
    return {
      canvas: ref<HTMLCanvasElement>(),


      /**
       * This object contains the mouse position at all times.
       */
      mouse: {
        x: 0,
        y: 0
      },

      /**
       * This contains the scroll position at all times.
       */
      scroll_pos: 0,
    }
  },
  actions: {
    getPositions() {
      return {
        mouse: this.mouse,
        scroll: this.scroll_pos
      }
    },

    /**
     * This function constructs a moon object and returns it.
     * 
     * @param moon_settings A moon settings object
     * @param moon_texture The moons graphical texture
     * @param moon_dis_map The displacement map for the given texture
     */
    createMoonObject(moon_settings: Settings<SphereParams>, moon_texture?: THREE.Texture, moon_dis_map?: THREE.Texture): THREE.Mesh {
      const { radius, segments, rings } = moon_settings.params;
      const moon_geom = new THREE.SphereGeometry(radius, segments, rings);
      const texture_loader = new THREE.TextureLoader();

      if (!moon_texture) { moon_texture = texture_loader.load('/dis_map_moon_nasa_16_uint.png') }
      if (!moon_dis_map) { moon_dis_map = texture_loader.load('/nasa_moon_colors.png') }

      const moon_mat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: moon_texture,
        displacementMap: moon_dis_map,
        displacementScale: 1,
        bumpMap: moon_dis_map,
        bumpScale: 0.5,
        reflectivity: 0,
        shininess: 0,
      });

      return this.transformMesh(new THREE.Mesh(moon_geom, moon_mat), moon_settings)
    },

    /**
     * This function creates a wireframe sphere and returns it.
     * 
     * @param sphere_settings The wireframe sphere settings
     * @param color The wire color
     */
    createWireframeSphere(sphere_settings: Settings<SphereParams>, color: number = 0x9B9B9B): THREE.Mesh {
      const { radius, segments, rings } = sphere_settings.params;
      const wireframe_geometry = new THREE.SphereGeometry(radius, segments, rings);
      const wireframe_material = new THREE.MeshBasicMaterial({ color: 0x9B9B9B, wireframe: true });

      return this.transformMesh(new THREE.Mesh(wireframe_geometry, wireframe_material), sphere_settings);
    },

    /**
     * Creates a light source
     */
    createLightSource(light_settings: Settings<LightSourceParams>): THREE.DirectionalLight {
      const { color, intensity } = light_settings.params;
      const light = new THREE.DirectionalLight(color, intensity);
      const [x, y, z] = light_settings.init_pos;
      light.position.set(x, y, z);

      return light;
    },

    /**
     * Creates a PointMesh
     * 
     * @param points_settings The points material settings
     * @returns A points mesh
     */
    createPointsMesh(
      points_settings: Settings<PointParams>,
      texture?: THREE.Texture
    ): THREE.Points {

      // if a texture is not given, load the default texture
      if (!texture) {
        texture = new THREE.TextureLoader().load("/sparkle_star.png");
      }

      const { size, color, amount } = points_settings.params;

      const points_geometry = new THREE.BufferGeometry();
      points_geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
          this.getRandomParticlePos(amount, points_settings.params.cube_size),
          3 // vector length in flat array
        )
      );

      const points_material = new THREE.PointsMaterial({
        color: color || 0xffffff,
        size: size,
        transparent: true,
        map: texture
      });

      return new THREE.Points(points_geometry, points_material);
    },


    /**
     * Generates positions for a given amount of particles within a given rectangular area.
     * @param particleCount The amount of particles to generate positions for.
     * @param size The size of the area to generate point positions for
     * @returns A float32 array of xyz positions.
     */
    getRandomParticlePos(particleCount: number, size: [x: number, y: number, z: number] = [10, 10, 10]) {
      const arr = new Float32Array(particleCount * 3);

      const [x, y, z] = size;

      for (let i = 0; i < particleCount; i += 3) {
        arr[i] = (Math.random() - 0.5) * x; //x (this context: left, right)
        arr[i + 1] = (Math.random() - 0.5) * y; //y (this context: top, bottom)
        arr[i + 2] = (Math.random() - 0.5) * z; //z (this context: front, back)
      }

      return arr;
    },


    /**
     * This function takes a mesh and applies a transform to it.
     * @param mesh The mesh to transform
     * @param settings The settings object
     * @returns The transformed mesh
     */
    transformMesh(mesh: THREE.Mesh, settings: Settings<any>): THREE.Mesh {
      const [x, y, z] = settings.init_pos;

      mesh.translateX(x);
      mesh.translateY(y);
      mesh.translateZ(z);

      return mesh;
    },

    /**
     * Adds an axis helper to the a given scene.
     */
    addAxisHelper(scene: THREE.Scene) {
      const axisHelper = new THREE.AxesHelper(5);
      axisHelper.setColors(
        new THREE.Color("rgb(255,0,0)"),  // x = red
        new THREE.Color("rgb(0,255,0)"),  // y = green
        new THREE.Color("rgb(0,0,255)")   // z = blue
      )
      scene.add(axisHelper);
    },

    // keeps track of the mouse position
    mouseHandler(e: MouseEvent) {
      this.$state.mouse.x = e.clientX;
      this.$state.mouse.y = e.clientY;
    },

    // keeps track of the scroll position
    scrollHandler() {

    },


    /**
     * Given a canvas, this object initializes the threejs scene.
     * @param canvas The canvas element
     * @param content_dom The dom to use the relative scroll from for animation
     * @param camera_settings The camera settings
     */
    async initScene(
      canvas: HTMLCanvasElement,
      content_dom: HTMLElement,
      show_axis_helper: boolean = false,
      camera_settings: {
        fov: number,
        near: number,
        far: number,
        z_pos: number
      } = {
          fov: 60,
          near: 0.1,
          far: 1000,
          z_pos: 10
        }
    ) {
      const texture_loader = new THREE.TextureLoader();
      const star_texture = await texture_loader.loadAsync("/sparkle_star.png");
      const moon_texture = await texture_loader.loadAsync('/dis_map_moon_nasa_16_uint.png');
      const moon_dis_map = await texture_loader.loadAsync('/nasa_moon_colors.png');

      // add event listeners
      content_dom.addEventListener('scroll', () => {
        this.scroll_pos = content_dom.scrollTop
      });

      window.addEventListener('mousemove', this.mouseHandler);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        camera_settings.fov,
        canvas.clientWidth / canvas.clientHeight,
        camera_settings.near,
        camera_settings.far
      );

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setClearColor(0x000000, 1);

      camera.position.z = camera_settings.z_pos;

      if (show_axis_helper) {
        this.addAxisHelper(scene);
      }

      const light = this.createLightSource(defaults.light);
      const point = this.createPointsMesh(defaults.points, star_texture)
      const sphere = this.createWireframeSphere(defaults.wire_sphere)
      const moon = this.createMoonObject(defaults.moon, moon_texture, moon_dis_map)

      scene.add(light);
      scene.add(point);
      scene.add(sphere);
      scene.add(moon);

      this.startRender(scene, camera, renderer, [
        {
          mesh: moon, animate: (mouse, scroll_pos, time, mesh) => {
            // mouse and scroll based animation
            moon.position.x = defaults.moon.init_pos[0] + (-mouse.x * 0.005);
            moon.position.y = defaults.moon.init_pos[1] + (mouse.y * 0.005) + (scroll_pos * 0.1);

            // rotate moon
            moon.rotation.x = -(time * 0.05);
            moon.rotation.y = -(time * 0.05);
          }
        },
        {
          mesh: point, animate: (mouse, scroll_pos, time, mesh) => {
            // mouse and scroll based animation
            mesh.position.y = (mouse.y * 0.0001) + scroll_pos * 0.001;
            mesh.position.x = -mouse.x * 0.0001;

            // time based animation
            mesh.rotation.x = time * 0.01;
            mesh.rotation.y = time * 0.01;
          }
        },
        {
          mesh: sphere,
          animate(mouse, scroll_pos, time, mesh) {
            // mouse based animation
            mesh.position.x = defaults.wire_sphere.init_pos[0] + (mouse.x * 0.0001) + (scroll_pos * 0.001);
            mesh.position.y = defaults.wire_sphere.init_pos[1] + (mouse.y * 0.0001) + (scroll_pos * 0.01);

            // time based animation
            mesh.rotation.x = (time * 0.06);
            mesh.rotation.y = (time * 0.06);
          },
        }
      ])
    },

    /**
     * Returns true if the renderer was resized
     * @param renderer A threejs renderer
     */
    resizeRendererToDisplaySize(renderer: THREE.Renderer): boolean {
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


    /**
     * This method starts the render of the scene.
     * 
     * @param scene The threejs scene
     * @param camera The threejs camera
     * @param renderer The threejs renderer
     */
    startRender(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.Renderer, animated_objects: AnimatedObject[]) {
      const resize = this.resizeRendererToDisplaySize;
      const getPos = this.getPositions;

      function render(time: number) {
        time = time * 0.001;

        if (resize(renderer)) {
          const canvas = renderer.domElement;
          camera.aspect = canvas.clientWidth / canvas.clientHeight;
          camera.updateProjectionMatrix();
        }

        const { mouse, scroll } = getPos();
        for (const anim of animated_objects) {
          anim.animate(mouse, scroll, time, anim.mesh);
        }

        renderer.render(scene, camera);

        requestAnimationFrame(render);
      }

      requestAnimationFrame(render);
    },
  }
});
