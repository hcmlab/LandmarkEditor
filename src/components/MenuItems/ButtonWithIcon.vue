<script setup lang="ts">
defineProps({
  shortcut: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  }
});

const emits = defineEmits(['click']);

function handleClick(e: MouseEvent) {
  emits('click', e);
}
</script>

<template>
  <BButton
    :id="'button-' + text.toLowerCase().replace(/ /g, '-')"
    v-shortkey="shortcut.replace('Control', 'ctrl').toLowerCase().split('+')"
    class="nav-link btn btn-light text-start"
    href="#"
    :aria-keyshortcuts="shortcut"
    @click="handleClick"
    @shortkey="handleClick"
    ><i :class="'bi ' + icon" class="me-1"></i>{{ text }}
  </BButton>
</template>

<style scoped></style>
