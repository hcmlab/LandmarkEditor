<script lang="ts" setup>
import { BNavbar, BNavbarBrand, BNavbarNav } from 'bootstrap-vue-next';
import LoadSaveActions from '@/components/Navbar/LoadSaveActions.vue';
import EditButtons from '@/components/Navbar/EditButtons.vue';
import AboutSection from '@/components/Navbar/AboutSection.vue';
</script>

<template>
  <BNavbar sticky="top" variant="light">
    <BNavbarBrand fixed="top" variant="light">
      <div class="d-flex flex-row align-items-center">
        <div class="me-3">
          <img
            id="app-icon"
            alt="Icon"
            class="rounded-circle border border-dark border-2 shadow"
            src="../../../static/images/FaceMesh.png"
            style="width: 2vw; height: 2vw"
          />
        </div>
        <div>
          <h5 id="title" class="m-0">Landmark Editor</h5>
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
