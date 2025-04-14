# Adding new Models

When adding new models to the editor you need to follow add the following things:

## Add Model class

In the `src/models` directory the classes which implement each model. Create a descendents of the class in
`modelApi.ts`.

## Add Model to the enum

In `src/enums/annotationTool.ts` the enum which lists all models is defined. Add the new model to the enum.
In this file an array is generated where all classes source their knowledge about what models are present.

## Add Model to serializer

In `src/graph/serializedData.ts` add your model to `ImageAnnotationData` so it can be serialized and deserialized to and
from JSON files.

## Add Model to tool selector

Add your model and additional information to `src/components/Sidebar/ToolSelector.ts` so it can be selected in the UI.
Also add additional information where needed.

## Add Model to editor

If your model simple annotates a graph you can inherit the `PointMoveEditor` in `src/Editors/PointMoveEditor.ts`.
If your annotation is more complex you can create a new editor which inherits from `Editor` in `src/Editors/Editor.ts`.

## Link your model and Editor

In `fromTool` in `src/components/CentralCanvas.ts` you need to add your model and editor to the switch statement to
connect the tool to the editor.

## Add configuration to your editor.

Any configuration is handled in the files in `src/stores`. `annotationToolStore.ts` is the main store which handles the
tools, the loaded images and common configurations options. If your model needs additional configuration you can create
a new store in `src/stores/ToolSpecific`.

## Create a configuration for your model

Like with the other models you need to create a configuration for your model. This is done in
`src/components/Sidebar/ToolMenu`.
Check the other models for examples. You need to add an empty component for a delete button to show up.

## Connect your config and editor

In the switch statement in `componentFromTool` contained in `src/components/Sidebar/ToolSelector.ts` you need to add
your tool and your configuration component.

## Persisting configurations

If you want to persist configurations for your model you need to add new options to `ToolConfig` in
`src/graphs/serializedData.ts`.
Also in `getToolConfigData` inside `src/components/Navbar/LoadSaveAction.vue` you need to add the new options to the
function to be serialized.
Additionally, in `parseToolConfigData` in the same file add the new options to load the data again.
