<script setup lang="ts">
import type { Mode } from "../App.vue";

defineProps<{
  mode: Mode;
}>();

defineEmits<{
  (e: "change-mode", mode: Mode): void;
}>();
</script>

<template>
  <div class="mode-buttons">
    <button :class="{ active: mode === 'text' }" @click="$emit('change-mode', 'text')">
      Text
    </button>
    <button :class="{ active: mode === 'image' }" @click="$emit('change-mode', 'image')">
      Image
    </button>
    <button :class="{ active: mode === 'video' }" @click="$emit('change-mode', 'video')">
      Video
    </button>
  </div>
</template>