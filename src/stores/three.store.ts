import { ref, computed } from 'vue'
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

export const useThreeStore = defineStore('three', {
  state: () => {
    return {
      canvas: ref<HTMLCanvasElement>(),

      mouse: {
        x: 0,
        y: 0
      }
    }
  },
  actions: {
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
        displacementScale: 0.2,
        bumpMap: moon_dis_map,
        bumpScale: 0.1,
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
          this.getRandomParticlePos(amount),
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


    // to keep track of the mouse position
    addMouseListener() {
      window.addEventListener("mousemove", (e: MouseEvent) => {
        this.$state.mouse.x = e.clientX;
        this.$state.mouse.y = e.clientY;
      });
    }
  }
});
