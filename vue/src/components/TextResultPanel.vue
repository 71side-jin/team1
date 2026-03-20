<script setup lang="ts">
defineProps<{
  isAnalyzing: boolean;
  result: string;
}>();

defineEmits<{
  (e: "analyze"): void;
  (e: "reset"): void;
}>();
</script>

<template>
  <div class="analyze-section">
    <div class="analyze-button-row">
      <button
        class="analyze-btn"
        @click="$emit('analyze')"
        :disabled="isAnalyzing"
      >
        <span v-if="isAnalyzing" class="spinner"></span>
        <span v-else>Analyze</span>
      </button>

      <button
        v-if="result"
        type="button"
        class="reset-btn"
        @click="$emit('reset')"
      >
        Reset
      </button>
    </div>

    <p v-if="result" class="result-text">{{ result }}</p>
  </div>
</template>