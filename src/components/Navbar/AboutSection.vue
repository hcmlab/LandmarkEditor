<script setup lang="ts">
import { ref } from 'vue';

const showInfo = ref(false);
</script>

<template>
  <BNavItemDropdown id="about-dropdown" text="About" class="py-1" variant="light">
    <BDropdownItem>
      <a
        id="button-github"
        class="nav-link btn btn-light text-start"
        href="https://github.com/hcmlab/LandmarkEditor"
        target="_blank"
        ><i class="bi bi-github me-1"></i>GitHub</a
      >
    </BDropdownItem>
    <BDropdownDivider />
    <BDropdownItem>
      <a
        id="button-report-issue"
        class="nav-link btn btn-light text-start"
        href="https://github.com/hcmlab/LandmarkEditor/issues/new"
        target="_blank"
        ><i class="bi bi-bug me-1"></i>Report Issue</a
      >
    </BDropdownItem>
    <BDropdownItem>
      <a
        id="button-question"
        class="nav-link btn btn-light text-start"
        href="https://github.com/hcmlab/LandmarkEditor/issues"
        target="_blank"
        ><i class="bi bi-question-circle me-1"></i>Question</a
      >
    </BDropdownItem>
    <BDropdownItem>
      <a
        id="button-info"
        class="nav-link btn btn-light text-start"
        href="#"
        @click="showInfo = true"
        ><i class="bi bi-info-circle me-1"></i>Info</a
      >
    </BDropdownItem>
  </BNavItemDropdown>

  <BModal v-model="showInfo" title="Info" :hide-footer="true" centered>
    <b>&copy; 2024 Chair of Human-Centered Artificial Intelligence</b><br />
    University of Augsburg<br />
    Germany
  </BModal>
</template>

<style scoped></style>
