<script setup lang="ts">
import { onErrorCaptured, onMounted } from 'vue';
import CountryEditor from './components/CountryEditor.vue';

// Global error handler
onErrorCaptured((err, instance, info) => {
  console.error('Vue error captured:', err, info);
  return false; // Prevent error propagation
});

// Add a simple mounted handler to see if the app loads
onMounted(() => {
  console.log('App mounted successfully');
});
</script>

<template>
  <CountryEditor />
</template>

<style scoped>
</style>
