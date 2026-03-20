<script setup lang="ts">
defineProps<{
  result: string;
}>();

defineEmits<{
  (e: "reset"): void;
}>();
</script>

<template>
  <div class="analyze-section">
    <div class="analyze-button-row">
      <button type="button" class="reset-btn" @click="$emit('reset')">
        Reset
      </button>
    </div>

    <p v-if="result" class="result-text">{{ result }}</p>
  </div>
</template>