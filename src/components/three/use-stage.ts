"use client";

import { useEffect, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import { type Budget, frameBudget } from "@/lib/budget";

import { prefersReducedMotion } from "../motion/gsap";
import { disposeTree } from "./load-model";

export type StageContext = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  reduced: boolean;
  /** True once the stage was unmounted; async setup must stop when it flips. */
  disposed: () => boolean;
};

export type StageActor = {
  /** Called every frame while the stage is on screen; `t` is seconds since start. */
  update: (dt: number, t: number) => void;
  /** Resize hook: width and height in CSS pixels. */
  resize?: (width: number, height: number) => void;
  dispose?: () => void;
  /** A click that lands on `target`'s meshes calls `onHit`. */
  hit?: { target: THREE.Object3D; onHit: () => void };
};

/**
 * A WebGL canvas that lives inside `host` and only draws while it is on screen.
 * The renderer is created when the host comes within a screen of the viewport and freed once it is a screen and a half
 * away, so a phone holds about two WebGL contexts instead of one per section, and scrolling back and forth near the edge
 * does not rebuild it. Without WebGL the section simply has no 3D, and it tries again on the next approach.
 */
export function useStage(host: RefObject<HTMLElement | null>, build: (ctx: StageContext) => StageActor, fov = 30) {
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let teardown: (() => void) | undefined;
    let unmounted = false;
    let budget: Budget | undefined;

    const start = () => {
      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch (error) {
        console.warn("3D stage skipped: WebGL is unavailable", error);
        return;
      }
      const phone = Math.min(innerWidth, innerHeight) < 600;
      const reduced = prefersReducedMotion();
      let alive = true;
      // Checking every shader compile stalls the main thread for tens of milliseconds per material.
      renderer.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
      budget ??= { ratio: Math.min(devicePixelRatio, phone ? 1.5 : 1.75), slow: 0 };
      renderer.setPixelRatio(budget.ratio);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.className = "block h-full w-full";
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(fov, 1, 0.01, 200);
      const pmrem = new THREE.PMREMGenerator(renderer);
      let env: THREE.Texture;
      let actor: StageActor;
      try {
        env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = env;
        scene.environmentIntensity = 0.25;
        actor = build({ scene, camera, reduced, disposed: () => unmounted || !alive });
      } catch (error) {
        console.warn("3D stage skipped: setup failed", error);
        pmrem.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
        return;
      }

      const resize = () => {
        const w = Math.max(1, el.clientWidth);
        const h = Math.max(1, el.clientHeight);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        actor.resize?.(w, h);
      };
      const ray = new THREE.Raycaster();
      const onClick = (e: MouseEvent) => {
        const box = renderer.domElement.getBoundingClientRect();
        if (!actor.hit || !box.width || !box.height || (e.target as Element).closest?.("a, button")) return;
        const at = new THREE.Vector2(((e.clientX - box.left) / box.width) * 2 - 1, 1 - ((e.clientY - box.top) / box.height) * 2);
        if (Math.abs(at.x) > 1 || Math.abs(at.y) > 1) return;
        actor.hit.target.updateWorldMatrix(true, true);
        ray.setFromCamera(at, camera);
        if (ray.intersectObject(actor.hit.target, true).length > 0) actor.hit.onHit();
      };
      if (actor.hit) addEventListener("click", onClick);

      const sizer = new ResizeObserver(resize);
      sizer.observe(el);
      resize();

      let frame = 0;
      let visible = false;
      let last = 0;
      let elapsed = 0;
      const tick = (now: number) => {
        frame = requestAnimationFrame(tick);
        const raw = now - last;
        const dt = Math.min(raw / 1000, 0.1);
        last = now;
        if (budget && raw < 250) {
          const next = frameBudget(budget, raw);
          if (next.ratio !== budget.ratio) {
            renderer.setPixelRatio(next.ratio);
            resize();
          }
          budget = next;
        }
        elapsed += dt;
        actor.update(dt, elapsed);
        renderer.render(scene, camera);
      };
      const watcher = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting === visible) return;
        visible = entry.isIntersecting;
        if (visible) {
          last = performance.now();
          frame = requestAnimationFrame(tick);
        } else cancelAnimationFrame(frame);
      });
      watcher.observe(el);

      teardown = () => {
        alive = false;
        cancelAnimationFrame(frame);
        removeEventListener("click", onClick);
        watcher.disconnect();
        sizer.disconnect();
        actor.dispose?.();
        disposeTree(scene);
        env.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    };

    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !teardown) start();
      },
      { rootMargin: "100% 0px" },
    );
    const far = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && teardown) {
          teardown();
          teardown = undefined;
        }
      },
      { rootMargin: "150% 0px" },
    );
    near.observe(el);
    far.observe(el);

    return () => {
      unmounted = true;
      near.disconnect();
      far.disconnect();
      teardown?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the stage is built once per mount
  }, []);
}
