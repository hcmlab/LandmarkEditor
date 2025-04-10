<script setup lang="ts">
import { BNavbar } from 'bootstrap-vue-next';
import LoadSaveActions from '@/components/Navbar/LoadSaveActions.vue';
import EditButtons from '@/components/Navbar/EditButtons.vue';
import AboutSection from '@/components/Navbar/AboutSection.vue';
</script>

<template>
  <BNavbar variant="light" sticky="top">
    <BNavbarBrand variant="light" fixed="top">
      <div class="d-flex flex-row align-items-center">
        <div class="me-3">
          <img
            id="app-icon"
            src="../../../static/images/FaceMesh.png"
            class="rounded-circle border border-dark border-2 shadow"
            style="width: 2vw; height: 2vw"
            alt="Icon"
          />
        </div>
        <div>
          <h5 id="title" class="m-0">Face Mesh Editor</h5>
        </div>
      </div>
    </BNavbarBrand>
    <BNavbarNav id="navbar-buttons" class="w-100">
      <LoadSaveActions />
      <EditButtons />
      <AboutSection />
    </BNavbarNav>
  </BNavbar>
</template>

<style scoped></style>
