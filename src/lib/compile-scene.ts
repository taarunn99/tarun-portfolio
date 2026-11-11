import type { Camera, Object3D, WebGLRenderer } from "three";

/**
 * Compiles a scene's shaders before its first frame. Where the driver offers
 * KHR_parallel_shader_compile the compile runs off the main thread and this
 * resolves when it is done; elsewhere it falls back to a plain (blocking)
 * compile, without the warning three logs for compileAsync.
 */
export async function compileScene(renderer: WebGLRenderer, scene: Object3D, camera: Camera): Promise<void> {
  if (renderer.extensions.has("KHR_parallel_shader_compile")) {
    await renderer.compileAsync(scene, camera);
  } else {
    renderer.compile(scene, camera);
  }
}
