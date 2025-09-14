**Adding a New Object**

Adding a new object to the effect builder is a multi-step process that involves updating several key functions to ensure the application correctly handles the new object's creation, rendering, and export.

1. The addObjectBtn Function
The addObjectBtn event listener is the entry point for creating a new object. It's responsible for generating a unique ID for the new object and creating its default configuration.
    * Generate a new ID: The function calculates a new, unique ID for the object based on the existing objects in the scene.
    * Get default configs: It calls getDefaultObjectConfig() to retrieve a full set of default properties for the new object.
    * Create a new Shape object: It instantiates a new Shape object using the default configurations and the canvas context.
    * Add to the scene: The new Shape object is added to the objects array, and its configuration is added to the configStore.

2. The getDefaultObjectConfig Function
This function is the single source of truth for defining the properties of a new object. It returns an array of property-value pairs for a new object, which includes all of its settings.
    * Define properties: It returns an array of objects, where each object represents a single property (e.g., shape, x, y).
    * Set default values: Each property object includes a default value, which is used to initialize the new object's state.

3. The Shape Class
The Shape class is the blueprint for all objects in the scene. It's responsible for managing an object's properties, updating its state, and drawing it on the canvas.
    * Constructor: The Shape constructor accepts an object of properties and assigns them to the new object. This allows the application to create a new Shape object with all the properties defined in getDefaultObjectConfig().
    * draw method: The draw method uses the object's properties to render it on the canvas.

4. The renderForm Function
The renderForm function is responsible for creating the UI controls for each object in the scene.
    * Iterate through objects: It iterates through the objects array and creates a new panel for each object.
    * Create controls: For each object, it dynamically creates form controls (e.g., text boxes, sliders, dropdowns) based on the object's configuration in the configStore.

5. The exportFile Function
The exportFile function is responsible for generating the final HTML file. It includes all the object data and the necessary JavaScript code to run the effect.
    * generateOutputScript: This function builds the HTML meta tags and JavaScript variables for the exported file.
    * exportedScript: The exportedScript template includes all the JavaScript logic, such as the Shape class, the drawFrame function, and the animate function, that is necessary for the effect to run outside of the editor.


**Adding a new property**

1. Update Shape.js - The Core Object
    * Constructor: Add the new property to the list of properties the Shape class can accept. Give it a default value so that existing effects don't break.
    * Update method: The update method is called to apply changes from the UI. This ensures your new property responds to user input.
    * Implement the visual logic: Add code to the draw method or other relevant rendering functions (like _drawFill) to use your new property to modify the shape's appearance.


2. Update main.js - Configuration and UI
    * getDefaultObjectConfig: Add a new entry for your property in this function. This serves as the single source of truth for all new objects and includes details like the control's label, type, and default value.
    * shapePropertyMap: This map controls which properties appear for which shape. Add the name of your new property to the list for every shape that should have access to it.
    * controlGroupMap: This tells the application which tab to place the new control in. Choose an existing group or create a new one.
    * getFormValuesForObject: This function reads the value from the form and scales it for internal use. If your property needs scaling (e.g., for position, size, or speed), apply it here.
    * updateFormValuesFromObjects: This function is crucial for keeping the form in sync with the live state of the shape. Add a line to read the property from the Shape object and update the form control.


3. Update the exportFile function - The Final Output
    * generateOutputScript: This function builds the <meta> tags and JavaScript variables for the exported file. You'll need to add logic to export your new property correctly.
    * Update the exported script: Add any new functions or classes that the property relies on to the exportedScript template. This ensures that the generated file contains all the necessary code to run the effect.