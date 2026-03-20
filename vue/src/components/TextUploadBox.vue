<script setup lang="ts">
import type { Ref } from "vue";

defineProps<{
  dragging: boolean;
  text: string;
  accept: string;
  fileInput: Ref<HTMLInputElement | null>;
  textEditor: Ref<HTMLDivElement | null>;
}>();

defineEmits<{
  (e: "focus-editor"): void;
  (e: "open-file-picker"): void;
  (e: "drag-over", event: DragEvent): void;
  (e: "drag-leave"): void;
  (e: "drop-text", event: DragEvent): void;
  (e: "change-file", event: Event): void;
  (e: "input-text", event: Event): void;
  (e: "paste-text", event: ClipboardEvent): void;
}>();
</script>

<template>
  <div
    class="text-upload-box"
    :class="{ dragging }"
    @click="$emit('focus-editor')"
    @dragover="$emit('drag-over', $event)"
    @dragleave="$emit('drag-leave')"
    @drop="$emit('drop-text', $event)"
  >
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      @change="$emit('change-file', $event)"
      hidden
    />

    <div class="text-editor-wrap">
      <div
        v-if="!text"
        class="text-placeholder-row"
        @click.stop="$emit('focus-editor')"
      >
        <span class="text-placeholder">Paste your text, Drop or</span>
        <button
          type="button"
          class="inline-upload-btn"
          @click.stop="$emit('open-file-picker')"
        >
          Upload
        </button>
      </div>

      <div
        ref="textEditor"
        class="text-editable"
        :class="{ filled: text }"
        contenteditable
        @input="$emit('input-text', $event)"
        @paste="$emit('paste-text', $event)"
      ></div>
    </div>
  </div>
</template>