<script setup lang="ts">
import { onMounted } from 'vue';
import Sidebar from '@/components/Main/SidebarContainer.vue';
import CentralCanvas from '@/components/Main/CentralCanvas.vue';
import ThumbnailGallery from '@/components/Main/ThumbnailGallery.vue';
import TopNavbar from '@/components/Main/TopNavbar.vue';
import ImageLoadModal from '@/components/ImageLoadModal.vue';

onMounted(() => {
  const elements = document.querySelectorAll('[aria-keyshortcuts]');
  elements.forEach((baseElem: Element) => {
    const elem = baseElem as HTMLElement;
    if (!elem.ariaKeyShortcuts) return;
    elem.style.cssText = 'width: 100%; text-align: start; padding: .2vw;';
    const keys: string[] = elem.ariaKeyShortcuts
      .split('+')
      .map((k: string) =>
        k.replace('Control', 'CTRL').replace('Shift', 'SHIFT').replace('Wheel', 'SCROLL')
      );
    if (elem.ariaKeyShortcuts.length > 0) {
      const table: HTMLTableElement = document.createElement('table');
      table.style.cssText = 'width: 100%';
      const row: HTMLTableRowElement = document.createElement('tr');
      table.appendChild(row);
      const menuTextCol: HTMLTableCellElement = document.createElement('td');
      menuTextCol.innerHTML = elem.innerHTML;
      row.appendChild(menuTextCol);
      const menuShortCutCol: HTMLTableCellElement = document.createElement('td');
      menuShortCutCol.style.cssText = 'text-align: end;';
      menuShortCutCol.innerHTML = keys.map((k: string) => '<kbd>' + k + '</kbd>').join('+');
      row.appendChild(menuShortCutCol);
      elem.replaceChildren(table);
    }
  });
});
</script>

<template>
  <div class="vh-100 vw-100 overflow-hidden shadow">
    <TopNavbar class="h-5" />
    <div class="d-flex flex-row h-95 w-100">
      <Sidebar />
      <CentralCanvas />
      <ThumbnailGallery />
    </div>
    <ImageLoadModal />
  </div>
</template>
