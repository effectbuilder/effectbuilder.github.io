# SRGB Interactive Effect Builder

A web-based, WYSIWYG tool designed to create and share complex animated effects for the SignalRGB platform without writing code from scratch.

## ✨ Features

* **Visual Editor**: A What-You-See-Is-What-You-Get interface for real-time feedback on your effects.
* **Diverse Shapes**: Includes standard shapes like rectangles, circles, and stars, plus advanced tools for creating freeform polylines.
* **Advanced Objects**: Create complex visuals with built-in objects like:
    * Particle Spawners
    * Audio Visualizers
    * Strimers (PC Cable Effects)
    * Pixel Art Sprites with a built-in frame editor
* **Dynamic Reactivity**: Make your effects come alive with reactivity to system audio and hardware sensor data (e.g., CPU load).
* **Community & Sharing**:
    * Save projects to the cloud with a Google account.
    * Share effects with other creators via a direct link.
    * Browse and load effects from the Community Gallery.
* **Easy Export**: Download your creation as a complete `.zip` file, ready to be imported directly into SignalRGB.

## 🚀 Live Demo

You can use the live version of the Effect Builder here: **[https://effectbuilder.github.io/](https://effectbuilder.github.io/)**

---

## 🛠️ For Developers & Contributors

This project is open-source. The following guide provides a high-level overview of how to extend the builder with new functionality.

### Extending the Builder

The application is designed to be modular, but adding new functionality requires updating several core components to handle configuration, UI, rendering, and exporting.

#### Adding a New Shape Property

To add a new customizable property (e.g., a "glow" effect) to existing shapes, you'll need to modify the following areas:

1.  **`Shape.js` (The Core Object)**
    * **Constructor**: Add the new property and a default value.
    * **Update Method**: Ensure the property can be updated from the UI.
    * **`draw` method**: Implement the rendering logic that uses the new property.

2.  **`main.js` (Configuration and UI)**
    * **`getDefaultObjectConfig`**: Add a new configuration object that defines the property's UI label, control type (e.g., `number`, `boolean`), and default value for newly created shapes.
    * **`shapePropertyMap`**: Add the property's name to the array for each shape that should have access to it.
    * **`controlGroupMap`**: Assign the property to a UI tab in the controls panel.
    * **`getFormValuesForObject` & `updateFormValuesFromObjects`**: Add logic to sync the property's state between the live `Shape` object and the form controls.

3.  **`main.js` (The Final Output)**
    * **`generateOutputScript` in `exportFile`**: Ensure the new property is correctly written to the `<meta>` tags or JavaScript variables in the exported HTML file.
    * **`exportedScript`**: If your new property relies on helper functions, they must be included in the exported script template.

#### Adding a New Shape Type

Adding a completely new shape (e.g., a "Waveform" object) follows a similar but more extensive process:

1.  **`getDefaultObjectConfig` in `main.js`**: Define all the default properties for your new shape type. This is the first and most critical step.
2.  **`addObjectBtn` logic in `main.js`**: This function handles the creation of a new object instance when a user clicks the "Add Object" button. It uses `getDefaultObjectConfig` to get the initial state.
3.  **The `Shape` Class in `Shape.js`**:
    * **Constructor**: Ensure it can accept and store the unique properties of your new shape.
    * **`draw` method**: Add a new `else if (this.shape === 'yourNewShape')` block with the specific Canvas API logic required to render your shape.
4.  **`renderForm` in `main.js`**: This function builds the UI. Your new shape's properties will automatically appear based on their definitions in `getDefaultObjectConfig` and the various map objects (`shapePropertyMap`, `controlGroupMap`).
5.  **`exportFile` in `main.js`**: Ensure the export process correctly handles your new shape type and its unique properties.

## 📄 License

This project is licensed under the **GNU General Public License v3.0**. For the full license text, please see the [official GNU GPLv3 page](https://www.gnu.org/licenses/gpl-3.0.html).