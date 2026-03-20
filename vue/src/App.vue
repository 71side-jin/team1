<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import ModeButtons from "./components/ModeButtons.vue";
import MediaUploadBox from "./components/MediaUploadBox.vue";
import MediaResultPanel from "./components/MediaResultPanel.vue";
import TextUploadBox from "./components/TextUploadBox.vue";
import TextResultPanel from "./components/TextResultPanel.vue";

export type Mode = "text" | "image" | "video";

const mode = ref<Mode>("image");
const dragging = ref(false);
const text = ref("");
const isAnalyzing = ref(false);
const result = ref("");
const isPreviewLoading = ref(false);
const previewUrl = ref("");

const fileInput = ref<HTMLInputElement | null>(null);
const textEditor = ref<HTMLDivElement | null>(null);

const ACCEPT_MAP: Record<Mode, string> = {
  text: ".txt",
  image: "image/*",
  video: "video/*",
};

const LABEL_MAP: Record<Exclude<Mode, "text">, string> = {
  image: "Drag & Drop or Click to Upload an Image",
  video: "Drag & Drop or Click to Upload a Video",
};

const accept = computed(() => ACCEPT_MAP[mode.value]);

const label = computed(() => {
  if (mode.value === "image") return LABEL_MAP.image;
  if (mode.value === "video") return LABEL_MAP.video;
  return "";
});

const isTextMode = computed(() => mode.value === "text");
const hasText = computed(() => text.value.trim().length > 0);
const mediaReady = computed(
  () => !isPreviewLoading.value && previewUrl.value.length > 0
);

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function revokePreviewUrl() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
}

function clearTextEditor() {
  if (textEditor.value) {
    textEditor.value.innerText = "";
  }
}

function clearFileInput() {
  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

function resetState() {
  text.value = "";
  dragging.value = false;
  isAnalyzing.value = false;
  result.value = "";
  isPreviewLoading.value = false;

  revokePreviewUrl();
  previewUrl.value = "";

  clearTextEditor();
  clearFileInput();
}

function changeMode(nextMode: Mode) {
  mode.value = nextMode;
  resetState();
}

function openFilePicker() {
  fileInput.value?.click();
}

function focusTextEditor() {
  textEditor.value?.focus();
}

function updateTextEditor(newText: string) {
  text.value = newText;
  result.value = "";

  if (textEditor.value) {
    textEditor.value.innerText = newText;
    textEditor.value.focus();
  }
}

async function handleTextFile(selectedFile: File) {
  const content = await selectedFile.text();
  updateTextEditor(content);
}

async function handleMediaFile(selectedFile: File) {
  isPreviewLoading.value = true;
  result.value = "";

  revokePreviewUrl();
  previewUrl.value = "";

  const previewPromise = (async () => {
    await delay(1200);
    return URL.createObjectURL(selectedFile);
  })();

  const analyzePromise = (async () => {
    await delay(2000);
    return "RESULT";
  })();

  const [objectUrl, analyzeResult] = await Promise.all([
    previewPromise,
    analyzePromise,
  ]);

  previewUrl.value = objectUrl;
  result.value = analyzeResult;
  isPreviewLoading.value = false;
}

async function handleFile(selectedFile?: File) {
  if (!selectedFile) return;

  if (isTextMode.value) {
    await handleTextFile(selectedFile);
    return;
  }

  await handleMediaFile(selectedFile);
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  dragging.value = true;
}

function handleDragLeave() {
  dragging.value = false;
}

async function handleDrop(e: DragEvent) {
  e.preventDefault();
  dragging.value = false;

  const droppedFile = e.dataTransfer?.files?.[0];
  await handleFile(droppedFile);
}

async function handleTextDrop(e: DragEvent) {
  e.preventDefault();
  dragging.value = false;

  const droppedFile = e.dataTransfer?.files?.[0];
  if (droppedFile) {
    await handleTextFile(droppedFile);
    return;
  }

  const droppedText = e.dataTransfer?.getData("text") || "";
  if (droppedText) {
    const currentText = textEditor.value?.innerText || text.value;
    updateTextEditor(currentText + droppedText);
  }
}

async function handleChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const selectedFile = target.files?.[0];
  await handleFile(selectedFile);
}

function handleTextInput(e: Event) {
  const target = e.target as HTMLDivElement;
  text.value = target.innerText;
}

function handleTextPaste(e: ClipboardEvent) {
  e.preventDefault();
  const pasted = e.clipboardData?.getData("text") || "";
  const currentText = textEditor.value?.innerText || "";
  updateTextEditor(currentText + pasted);
}

async function handleAnalyze() {
  if (!hasText.value) return;

  isAnalyzing.value = true;
  result.value = "";

  await delay(2000);

  isAnalyzing.value = false;
  result.value = "RESULT";
}

onBeforeUnmount(() => {
  revokePreviewUrl();
});
</script>

<template>
  <div class="page">
    <h1 class="title">I SEE YOU</h1>

    <ModeButtons :mode="mode" @change-mode="changeMode" />

    <template v-if="!isTextMode">
      <MediaUploadBox
        :mode="mode"
        :dragging="dragging"
        :preview-url="previewUrl"
        :is-preview-loading="isPreviewLoading"
        :accept="accept"
        :label="label"
        @open-file-picker="openFilePicker"
        @drag-over="handleDragOver"
        @drag-leave="handleDragLeave"
        @drop-file="handleDrop"
        @change-file="handleChange"
        :file-input="fileInput"
      />

      <MediaResultPanel
        v-if="mediaReady"
        :result="result"
        @reset="resetState"
      />
    </template>

    <template v-else>
      <TextUploadBox
        :dragging="dragging"
        :text="text"
        :accept="accept"
        :file-input="fileInput"
        :text-editor="textEditor"
        @focus-editor="focusTextEditor"
        @open-file-picker="openFilePicker"
        @drag-over="handleDragOver"
        @drag-leave="handleDragLeave"
        @drop-text="handleTextDrop"
        @change-file="handleChange"
        @input-text="handleTextInput"
        @paste-text="handleTextPaste"
      />

      <TextResultPanel
        v-if="hasText"
        :is-analyzing="isAnalyzing"
        :result="result"
        @analyze="handleAnalyze"
        @reset="resetState"
      />
    </template>
  </div>
</template>