<div align="center">

______________________________________________________________________

# Face Mesh Editor

#### An Editor to manually adjust automatic Face Mesh Detections

______________________________________________________________________

![Build](https://github.com/hcmlab/FaceMeshEditor/actions/workflows/build.yaml/badge.svg)

[**Demo**](https://hcmlab.github.io/FaceMeshEditor/)

Check the [Documentation](https://hcmlab.github.io/FaceMeshEditor/docs/)

![Screenshot of the Demo as a Preview](static/images/PreviewAnimation.gif)
</div>

## Features

### General

<details> <summary>Image(s) Upload</summary> 

Supported formats: **jpg** and **png**
</details>

<details> <summary>Annotation Upload</summary> 

Supported format: **json**
</details>

<details> <summary>Annotation Download</summary>

Format: **json**
</details>

<details> <summary>History</summary>

* **Redo**: Allows users to repeat a previous action. Useful for reverting to a specific state.
* **Undo**: Reverts the most recent action. Handy for correcting mistakes.
* **Reset**: Restores the system to its initial state. Useful for starting over.

</details>

<details> <summary>Model Selection</summary>

* MediaPipe (Default): Works offline. This mode utilizes a pre-trained model within the system.
* Webservice (Custom): Operates online. Users can connect to a custom external service for specialized processing.

</details>

<details> <summary>Delete Features</summary>

If a displayed face lacks a trait, marking it as hidden signifies its non-existence, and eliminated points are flagged
as such in the json file.
</details>

<details> <summary>Image Preview</summary>

Displays thumbnails of uploaded images. These small visual representations help users quickly identify and select the
desired image.
</details>

### Editor

<details> <summary>Cascading Drag</summary>

The Cascading Drag tool facilitates smooth movement of points by considering their neighboring points. When a user drags
a point, the tool calculates the movement distance for nearby points using an incremental function. This real-time
update ensures a responsive and intuitive interface.
</details>

<details> <summary>Hide Tesselation</summary>

The Hide Tesselation feature enhances focus on specific regions during annotation. Even when tesselation and their
corresponding points are hidden, users can still manipulate points via cascading drag if they are selected closely
enough. This allows precise adjustments while maintaining a clutter-free view.
</details>

<details> <summary>Zoom</summary>

The Zoom functionality allows users to adjust the magnification level of the image. By zooming in, users can examine
finer details with clarity. Conversely, zooming out provides a broader view of the entire image.
</details>

<details> <summary>Pan</summary>

The Pan feature enables users to shift the visible portion of the image. By panning, users can explore different areas
without changing the zoom level. It’s particularly useful for navigating large or detailed images.
</details>

## Custom Webservice API

As a user, you have the flexibility to integrate various face mesh detection models seamlessly into our application.
Whether you want to provide a pre-trained model via the webservice or create a dynamic model that continues to learn,
this API empowers you to tailor face mesh detection to your specific needs.

### Key Endpoints

```
/detect
```

* **Method**: POST and GET
* **Input**: Form-data with a file (supported formats: jpg and png)
* **Return**: JSON response containing detection results
* **Description**: This endpoint allows users to submit an image for detection. The supported formats are jpg and png.
  The system processes the uploaded file and responds with detection information in JSON format.

```
/annotations
```

* **Method**: POST
* **Input**: JSON string
* **Description**: Users can send annotation data in JSON format to this endpoint. The system processes the annotations
  and performs relevant actions based on the provided information.
