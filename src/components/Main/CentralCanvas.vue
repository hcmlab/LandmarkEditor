<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { Editor } from '@/Editors/Editor';
import { useAnnotationToolStore } from '@/stores/annotationToolStore';
import { AnnotationTool } from '@/enums/annotationTool';
import { FaceMeshEditor } from '@/Editors/FaceMeshEditor';
import { BackgroundDrawer } from '@/Editors/BackgroundDrawer';
import { PoseEditor } from '@/Editors/PoseEditor';
import { HandEditor } from '@/Editors/HandEditor';
import UserOverwriteModal from '@/components/Main/UserOverwriteModal.vue';

const tools = useAnnotationToolStore();

const editors = ref<Editor[]>([new BackgroundDrawer()]);
const canvas = ref<HTMLCanvasElement>();
let oldTools = new Set<AnnotationTool>([...tools.tools]);

onUnmounted(() => {
  // Cleanup - remove the event listener when component is unmounted
  window.removeEventListener('resize', onResize);
});

onMounted(() => {
  window.addEventListener('resize', onResize);
  if (!canvas.value) return;
  Editor.setCanvas(canvas.value);
  tools.tools.forEach((tool) => {
    editors.value.push(fromTool(tool));
  });
  Editor.draw();
});

watch(
  () => tools.tools,
  async (value) => {
    const added = new Set([...value].filter((tool) => !oldTools.has(tool)));
    const removed = new Set([...oldTools].filter((tool) => !value.has(tool)));

    editors.value.forEach((editor) => {
      if (!removed.has(editor.tool)) return;
      Editor.remove(editor.tool);
    });
    editors.value = editors.value.filter((editor) => !removed.has(editor.tool));
    await Promise.all(
      Array.from(added).map(async (tool) => {
        editors.value.push(fromTool(tool));
      })
    );
    editors.value.forEach((editor) => {
      editor.onBackgroundLoaded();
    });
    Editor.draw();
    oldTools = new Set<AnnotationTool>([...value]);
  },
  { deep: true }
);

watch(
  () => tools.selectedHistory,
  async (value) => {
    if (!value) {
      throw new Error('Failed to get selected History');
    }
    await Editor.setBackgroundSource(value.file);
    Editor.center();
    Editor.draw();
    editors.value.forEach((editor) => {
      editor.onBackgroundLoaded();
    });
  }
);

function fromTool(tool: AnnotationTool): Editor {
  switch (tool) {
    case AnnotationTool.FaceMesh:
      return new FaceMeshEditor();
    case AnnotationTool.Pose:
      return new PoseEditor();
    case AnnotationTool.Hand:
      return new HandEditor();
    default:
      throw Error('unknown tool: ' + tool);
  }
}

function handleMouseDown(event: MouseEvent): void {
  editors.value.forEach((editor) => {
    editor.onMouseDown(event);
  });
}

function handleMouseMove(event: MouseEvent): void {
  if (!canvas.value) return;
  Editor.prevMouseX = Editor.mouseX;
  Editor.prevMouseY = Editor.mouseY;
  const canvasPosLeft = canvas.value.offsetLeft;
  const canvasPosTop = canvas.value.offsetTop;
  Editor.mouseX = event.clientX - canvasPosLeft;
  Editor.mouseY = event.clientY - canvasPosTop;
  const relativeMouseX = (Editor.mouseX - Editor.offsetX) / Editor.zoomScale;
  const relativeMouseY = (Editor.mouseY - Editor.offsetY) / Editor.zoomScale;
  if (Editor.isMoving) {
    canvas.value.style.cursor = 'pointer';
    Editor.draw();
    editors.value.forEach((editor) => {
      editor.onMove(relativeMouseX, relativeMouseY);
    });
  } else if (Editor.isPanning) {
    Editor.pan(Editor.mouseX - Editor.prevMouseX, Editor.mouseY - Editor.prevMouseY);
    Editor.draw();
    editors.value.forEach((editor) => {
      editor.onPan(relativeMouseX, relativeMouseY);
    });
  } else if (Editor.image) {
    editors.value.forEach((editor) => {
      editor.onMouseMove(event, relativeMouseX, relativeMouseY);
    });
  }
}

function handleMouseUp(e: MouseEvent): void {
  if (!canvas.value) return;

  // If the ware changes in the editor, call callback
  if (Editor.isMoving) {
    editors.value.forEach((editor) => {
      editor.onPointsEdited();
    });
  }
  canvas.value.style.cursor = 'default';
  Editor.isPanning = false;
  Editor.isMoving = false;
  editors.value.forEach((editor) => {
    editor.onMouseUp(e);
  });
}

function handleWheel(event: WheelEvent): void {
  if (Editor.image && !event.shiftKey) {
    Editor.zoom(event.deltaY > 0);
    Editor.draw();
    event.preventDefault();
  }
}

const onResize = () => {
  Editor.draw();
};
</script>

<template>
  <div id="canvas-div" class="w-70 border">
    <UserOverwriteModal class="top-0 start-0 w-100 h-100" />
    <canvas
      id="canvas"
      ref="canvas"
      class=""
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @wheel="handleWheel"
      @mouseout="handleMouseUp"
    />
  </div>
</template>
