<script setup lang="ts">
import type { Mode } from "../App.vue";
import type { Ref } from "vue";

defineProps<{
  mode: Mode;
  dragging: boolean;
  previewUrl: string;
  isPreviewLoading: boolean;
  accept: string;
  label: string;
  fileInput: Ref<HTMLInputElement | null>;
}>();

defineEmits<{
  (e: "open-file-picker"): void;
  (e: "drag-over", event: DragEvent): void;
  (e: "drag-leave"): void;
  (e: "drop-file", event: DragEvent): void;
  (e: "change-file", event: Event): void;
}>();
</script>

<template>
  <div
    class="upload-box"
    :class="{ dragging }"
    @click="!previewUrl ? $emit('open-file-picker') : undefined"
    @dragover="$emit('drag-over', $event)"
    @dragleave="$emit('drag-leave')"
    @drop="$emit('drop-file', $event)"
  >
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      @change="$emit('change-file', $event)"
      hidden
    />

    <div v-if="isPreviewLoading" class="media-loading">
      <span class="spinner dark"></span>
    </div>

    <img
      v-else-if="previewUrl && mode === 'image'"
      :src="previewUrl"
      alt="preview"
      class="media-preview"
    />

    <video
      v-else-if="previewUrl && mode === 'video'"
      :src="previewUrl"
      class="media-preview"
      controls
    />

    <div v-else class="upload-content">
      <div class="upload-icon">
        <svg
          v-if="mode === 'image'"
          width="88"
          height="88"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="8"
            y="8"
            width="40"
            height="40"
            rx="4"
            stroke="currentColor"
            stroke-width="4"
          />
          <circle cx="20" cy="20" r="4" fill="currentColor" />
          <path
            d="M12 36L24 24L32 32L44 20L52 36"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <svg
          v-else-if="mode === 'video'"
          width="88"
          height="88"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="8"
            y="12"
            width="36"
            height="28"
            rx="4"
            stroke="currentColor"
            stroke-width="4"
          />
          <polygon points="22,20 22,32 32,26" fill="currentColor" />
        </svg>
      </div>

      <p class="upload-text">{{ label }}</p>
    </div>
  </div>
</template>