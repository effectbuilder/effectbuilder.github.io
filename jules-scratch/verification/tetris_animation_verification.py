import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Construct the full path to the HTML file
        file_path = os.path.abspath('index.html')

        # Go to the local HTML file
        await page.goto(f'file://{file_path}')

        # Wait for the page to load completely
        await page.wait_for_load_state('networkidle')

        # Function to get the source code of a function
        get_default_object_config_source = """
        () => {
            const getDefaultObjectConfig = (newId) => {
                return [
            // Geometry & Transform
            { property: `obj${newId}_shape`, label: `Object ${newId}: Shape`, type: "combobox", default: "rectangle", values: "rectangle,circle,ring,polygon,star,text,oscilloscope,tetris,fire,fire-radial,pixel-art,audio-visualizer,spawner,strimer,polyline", description: "The basic shape of the object." },
            { property: `obj${newId}_x`, label: `Object ${newId}: X Position`, type: "number", default: "10", min: "0", max: "320", description: "The horizontal position of the object on the canvas." },
            { property: `obj${newId}_y`, label: `Object ${newId}: Y Position`, type: "number", default: "10", min: "0", max: "200", description: "The vertical position of the object on the canvas." },
            { property: `obj${newId}_width`, label: `Object ${newId}: Width`, type: "number", default: "50", min: "2", max: "320", description: "The width of the object." },
            { property: `obj${newId}_height`, label: `Object ${newId}: Height`, type: "number", default: "38", min: "2", max: "200", description: "The height of the object." },
            { property: `obj${newId}_rotation`, label: `Object ${newId}: Rotation`, type: "number", default: "0", min: "-360", max: "360", description: "The static rotation of the object in degrees." },

            // Fill Style & Animation
            { property: `obj${newId}_fillShape`, label: `Object ${newId}: Fill Shape`, type: "boolean", default: "false", description: "Fills the interior of the shape with the selected fill style. For polylines, this will close the path." },
            { property: `obj${newId}_gradType`, label: `Object ${newId}: Fill Type`, type: "combobox", default: "linear", values: "none,solid,linear,radial,conic,alternating,random,rainbow,rainbow-radial,rainbow-conic", description: "The type of color fill or gradient to use." },
            { property: `obj${newId}_gradientStops`, label: `Object ${newId}: Gradient Colors`, type: "gradientpicker", default: '[{"color":"#FFA500","position":0},{"color":"#FF4500","position":0.5},{"color":"#8B0000","position":1}]', description: "The colors and positions of the gradient. The default is a fiery gradient." },
            { property: `obj${newId}_useSharpGradient`, label: `Object ${newId}: Use Sharp Gradient`, type: "boolean", default: "false", description: "If checked, creates a hard line between colors in Linear/Radial gradients instead of a smooth blend." },
            { property: `obj${newId}_animationMode`, label: `Object ${newId}: Animation Mode`, type: "combobox", values: "loop,bounce,bounce-reversed,bounce-random", default: "loop", description: "Determines how the gradient animation behaves." },
            { property: `obj${newId}_animationSpeed`, label: `Object ${newId}: Animation Speed`, type: "number", default: "50", min: "0", max: "100", description: "Master speed for particle systems, gradient scroll, and other animations." },
            { property: `obj${newId}_cycleColors`, label: `Object ${newId}: Cycle Colors`, type: "boolean", default: "false", description: "Animates the colors by cycling through the color spectrum." },
            { property: `obj${newId}_cycleSpeed`, label: `Object ${newId}: Color Cycle Speed`, type: "number", default: "10", min: "0", max: "100", description: "The speed at which colors cycle when 'Cycle Colors' is enabled." },
            { property: `obj${newId}_rotationSpeed`, label: `Object ${newId}: Rotation Speed`, type: "number", default: "0", min: "-100", max: "100", description: "The continuous rotation speed of the object. Overrides static rotation." },
            { property: `obj${newId}_scrollDir`, label: `Object ${newId}: Scroll Direction`, type: "combobox", values: "right,left,up,down", default: "right", description: "The direction the gradient animation moves." },
            { property: `obj${newId}_phaseOffset`, label: `Object ${newId}: Phase Offset`, type: "number", default: "10", min: "0", max: "100", description: "Offsets the gradient animation for each item in a grid, seismic wave, or Tetris block, creating a cascading effect." },

            // Shape-Specific Properties
            { property: `obj${newId}_sides`, label: `Object ${newId}: Sides`, type: "number", default: "6", min: "3", max: "50", description: "(Polygon) The number of sides for the polygon." },
            { property: `obj${newId}_points`, label: `Object ${newId}: Points`, type: "number", default: "5", min: "3", max: "50", description: "(Star) The number of points on the star." },
            { property: `obj${newId}_starInnerRadius`, label: `Object ${newId}: Inner Radius %`, type: "number", default: "50", min: "1", max: "99", description: "(Star) The size of the inner points as a percentage of the outer radius." },
            { property: `obj${newId}_innerDiameter`, label: `Object ${newId}: Inner Diameter`, type: "number", default: "25", min: "1", max: "318", description: "(Ring) The diameter of the inner hole of the ring." },
            { property: `obj${newId}_numberOfSegments`, label: `Object ${newId}: Segments`, type: "number", default: "12", min: "1", max: "50", description: "(Ring) The number of individual segments that make up the ring." },
            { property: `obj${newId}_angularWidth`, label: `Object ${newId}: Segment Angle`, type: "number", min: "1", max: "360", default: "20", description: "(Ring) The width of each ring segment, in degrees." },
            { property: `obj${newId}_numberOfRows`, label: `Object ${newId}: Number of Rows`, type: "number", default: "1", min: "1", max: "100", description: "(Grid) The number of vertical cells in the grid." },
            { property: `obj${newId}_numberOfColumns`, label: `Object ${newId}: Number of Columns`, type: "number", default: "1", min: "1", max: "100", description: "(Grid) The number of horizontal cells in the grid." },
            { property: `obj${newId}_text`, label: `Object ${newId}: Text`, type: "textfield", default: "New Text", description: "(Text) The content displayed within the text object." },
            { property: `obj${newId}_fontSize`, label: `Object ${newId}: Font Size`, type: "number", default: "15", min: "2", max: "100", description: "(Text) The size of the text." },
            { property: `obj${newId}_textAlign`, label: `Object ${newId}: Justification`, type: "combobox", values: "left,center,right", default: "center", description: "(Text) The horizontal alignment of the text." },
            { property: `obj${newId}_pixelFont`, label: `Object ${newId}: Pixel Font Style`, type: "combobox", values: "small,large", default: "small", description: "(Text) The style of the pixelated font." },
            { property: `obj${newId}_textAnimation`, label: `Object ${newId}: Text Animation`, type: "combobox", values: "none,marquee,typewriter,wave", default: "none", description: "(Text) The animation style for the text." },
            { property: `obj${newId}_textAnimationSpeed`, label: `Object ${newId}: Text Scroll Speed`, type: "number", min: "1", max: "100", default: "10", description: "(Text) The speed of the text animation." },
            { property: `obj${newId}_showTime`, label: `Object ${newId}: Show Current Time`, type: "boolean", default: "false", description: "Overrides the text content to show the current time." },
            { property: `obj${newId}_showDate`, label: `Object ${newId}: Show Current Date`, type: "boolean", default: "false", description: "Overrides the text content to show the current date." },
            { property: `obj${newId}_lineWidth`, label: `Object ${newId}: Line Width`, type: "number", default: "1", min: "1", max: "20", description: "(Oscilloscope) The thickness of the oscilloscope line." },
            { property: `obj${newId}_waveType`, label: `Object ${newId}: Wave Type`, type: "combobox", default: "sine", values: "sine,square,sawtooth,triangle,earthquake", description: "(Oscilloscope) The shape of the wave being displayed." },
            { property: `obj${newId}_frequency`, label: `Object ${newId}: Frequency / Wave Peaks`, type: "number", default: "5", min: "1", max: "50", description: "(Oscilloscope) The number of wave peaks displayed across the shape." },
            { property: `obj${newId}_oscDisplayMode`, label: `Object ${newId}: Display Mode`, type: "combobox", default: "linear", values: "linear,radial,seismic", description: "(Oscilloscope) The layout of the oscilloscope animation." },
            { property: `obj${newId}_pulseDepth`, label: `Object ${newId}: Pulse Depth`, type: "number", default: "50", min: "0", max: "100", description: "The intensity of the wave's amplitude or pulse effect." },
            { property: `obj${newId}_enableWaveAnimation`, label: `Object ${newId}: Enable Wave Animation`, type: "boolean", default: "true", description: "Toggles the movement of the oscilloscope wave." },
            { property: `obj${newId}_oscAnimationSpeed`, label: `Object ${newId}: Wave Animation Speed`, type: "number", min: "0", max: "100", default: "10", description: "Controls the speed of the oscilloscope wave movement, independent of the fill animation." },
            { property: `obj${newId}_waveStyle`, label: `Object ${newId}: Seismic Wave Style`, type: "combobox", default: "wavy", values: "wavy,round", description: "(Oscilloscope) The style of the seismic wave." },
            { property: `obj${newId}_waveCount`, label: `Object ${newId}: Seismic Wave Count`, type: "number", default: "5", min: "1", max: "20", description: "(Oscilloscope) The number of seismic waves to display." },
            { property: `obj${newId}_tetrisBlockCount`, label: `Object ${newId}: Block Count`, type: "number", default: "10", min: "1", max: "50", description: "(Tetris) The number of blocks in the animation cycle." },
            { property: `obj${newId}_tetrisAnimation`, label: `Object ${newId}: Drop Physics`, type: "combobox", values: "gravity,linear,gravity-fade,fade-in-stack,fade-in-out,comet,comet-gravity,comet-gravity-reversed", default: "gravity", description: "(Tetris) The physics governing how the blocks fall." },
            { property: `obj${newId}_tetrisSpeed`, label: `Object ${newId}: Drop/Fade-in Speed`, type: "number", default: "5", min: "1", max: "100", description: "(Tetris) The speed of the drop animation." },
            { property: `obj${newId}_tetrisBounce`, label: `Object ${newId}: Bounce Factor`, type: "number", default: "50", min: "0", max: "90", description: "(Tetris) How much the blocks bounce on impact." },
            { property: `obj${newId}_tetrisHoldTime`, label: `Object ${newId}: Hold Time`, type: "number", default: "50", min: "0", max: "200", description: "(Tetris) For fade-in-out, the time blocks remain visible before fading out." },
            { property: `obj${newId}_tetrisBlurEdges`, label: `Object ${newId}: Blur Edges`, type: "boolean", default: "false", description: "(Tetris/Comet) Blurs the leading and trailing edges of the comet for a softer look." },
            { property: `obj${newId}_tetrisHold`, label: `Object ${newId}: Hold at Ends`, type: "boolean", default: "false", description: "(Tetris/Comet) Pauses the comet at the start and end of its path." },
            { property: `obj${newId}_fireSpread`, label: `Object ${newId}: Fire Spread %`, type: "number", default: "100", min: "1", max: "100", description: "(Fire Radial) Controls how far the flames spread from the center." },
            { property: `obj${newId}_pixelArtFrames`, label: `Object ${newId}: Pixel Art Frames`, type: "pixelarttable", default: '[{"data":"[[1]]","duration":1}]', description: "(Pixel Art) Manage animation frames." },

            // Stroke Fill
            { property: `obj${newId}_enableStroke`, label: `Object ${newId}: Enable Stroke`, type: "boolean", default: "false", description: "Enables a stroke (outline) for the shape." },
            { property: `obj${newId}_strokeWidth`, label: `Object ${newId}: Stroke Width`, type: "number", default: "2", min: "1", max: "50", description: "The thickness of the shape's stroke." },
            { property: `obj${newId}_strokeGradType`, label: `Object ${newId}: Stroke Type`, type: "combobox", default: "solid", values: "solid,linear,radial,conic,alternating,random,rainbow,rainbow-radial,rainbow-conic", description: "The type of color fill or gradient to use for the stroke." },
            { property: `obj${newId}_strokeGradientStops`, label: `Object ${newId}: Stroke Gradient Colors`, type: "gradientpicker", default: '[{"color":"#FFFFFF","position":0}]', description: "The colors and positions of the stroke gradient." },
            { property: `obj${newId}_strokeUseSharpGradient`, label: `Object ${newId}: Stroke Use Sharp Gradient`, type: "boolean", default: "false", description: "If checked, creates a hard line between colors in the stroke gradient instead of a smooth blend." },
            { property: `obj${newId}_strokeAnimationMode`, label: `Object ${newId}: Stroke Animation Mode`, type: "combobox", values: "loop,bounce", default: "loop", description: "Determines how the stroke gradient animation behaves." },
            { property: `obj${newId}_strokeAnimationSpeed`, label: `Object ${newId}: Stroke Animation Speed`, type: "number", default: "2", min: "0", max: "100", description: "Controls the scroll speed of the stroke gradient animation." },
            { property: `obj${newId}_strokeCycleColors`, label: `Object ${newId}: Cycle Stroke Colors`, type: "boolean", default: "false", description: "Animates the stroke colors by cycling through the color spectrum." },
            { property: `obj${newId}_strokeCycleSpeed`, label: `Object ${newId}: Stroke Color Cycle Speed`, type: "number", default: "10", min: "0", max: "100", description: "The speed at which stroke colors cycle when 'Cycle Stroke Colors' is enabled." },
            { property: `obj${newId}_strokeRotationSpeed`, label: `Object ${newId}: Stroke Rotation Speed`, type: "number", default: "0", min: "-100", max: "100", description: "The continuous rotation speed of the stroke's conic gradient pattern." },
            { property: `obj${newId}_strokeScrollDir`, label: `Object ${newId}: Stroke Scroll Direction`, type: "combobox", default: "right", values: "right,left,up,down,along-path,along-path-reversed", description: "The direction the stroke gradient animation moves. 'Along Path' is for Polylines only." },
            { property: `obj${newId}_strokePhaseOffset`, label: `Object ${newId}: Stroke Phase Offset`, type: "number", default: "10", min: "0", max: "100", description: "Offsets the stroke gradient animation for each item in a grid, creating a cascading effect." },

            // Audio Reactivity
            { property: `obj${newId}_enableAudioReactivity`, label: `Object ${newId}: Enable Sound Reactivity`, type: "boolean", default: "false", description: "Enables the object to react to sound." },
            { property: `obj${newId}_audioTarget`, label: `Object ${newId}: Reactive Property`, type: "combobox", default: "Flash", values: "none,Flash,Size,Rotation,Path Speed", description: "Which property of the object will be affected by the sound." },
            { property: `obj${newId}_audioMetric`, label: `Object ${newId}: Audio Metric`, type: "combobox", default: "volume", values: "volume,bass,mids,highs", description: "Which part of the audio spectrum to react to." },
            { property: `obj${newId}_beatThreshold`, label: `Object ${newId}: Beat Threshold`, type: "number", default: "30", min: "1", max: "100", description: "Sensitivity for beat detection. Higher values are MORE sensitive." },
            { property: `obj${newId}_audioSensitivity`, label: `Object ${newId}: Sensitivity`, type: "number", default: "50", min: "0", max: "200", description: "How strongly the object reacts to the audio metric." },
            { property: `obj${newId}_audioSmoothing`, label: `Object ${newId}: Smoothing`, type: "number", default: "50", min: "0", max: "99", description: "Smooths out the reaction to prevent flickering. Higher values are smoother." },

            // Audio Visualizer
            { property: `obj${newId}_vizDynamicRange`, label: `Object ${newId}: Dynamic Range`, type: "boolean", default: "false", description: "(Visualizer) Automatically adjusts the frequency range to focus on active audio, ignoring silent higher frequencies." },
            { property: `obj${newId}_vizSmoothing`, label: `Object ${newId}: Smoothing`, type: "number", default: "60", min: "0", max: "99", description: "(Visualizer) How smoothly the bars react to audio changes. Higher is smoother." },
            { property: `obj${newId}_vizDrawStyle`, label: `Object ${newId}: Draw Style`, type: "combobox", default: "Line", values: "Bars,Line,Area", description: "(Visualizer) How the frequencies are rendered." },
            { property: `obj${newId}_vizLayout`, label: `Object ${newId}: Layout`, type: "combobox", default: "Linear", values: "Linear,Circular,Polyline,Circular Polyline", description: "(Visualizer) The overall layout of the visualizer." },
            { property: `obj${newId}_vizStyle`, label: `Object ${newId}: Style`, type: "combobox", default: "bottom", values: "bottom,center,top", description: "(Visualizer) The alignment of the visualizer bars." },
            { property: `obj${newId}_vizInnerRadius`, label: `Object ${newId}: Inner Radius %`, type: "number", default: "40", min: "0", max: "95", description: "(Visualizer) Sets the radius of the empty inner circle." },
            { property: `obj${newId}_vizLineWidth`, label: `Object ${newId}: Line Width`, type: "number", default: "2", min: "1", max: "20", description: "(Visualizer) The thickness of the line for the Line/Area draw styles." },
            { property: `obj${newId}_vizAutoScale`, label: `Object ${newId}: Auto-Scale Height`, type: "boolean", default: "true", description: "(Visualizer) If checked, the tallest bar will always reach the top of the shape." },
            { property: `obj${newId}_vizBarCount`, label: `Object ${newId}: Bar Count`, type: "number", default: "32", min: "2", max: "128", description: "(Visualizer) The number of frequency bars to display." },
            { property: `obj${newId}_vizBarSpacing`, label: `Object ${newId}: Bar Spacing`, type: "number", default: "2", min: "0", max: "20", description: "(Visualizer) The space between each bar in pixels." },
            { property: `obj${newId}_vizMaxBarHeight`, label: `Object ${newId}: Max Bar Height %`, type: "number", default: "100", min: "5", max: "100", description: "(Visualizer) Sets the maximum possible length for any visualizer bar." },
            { property: `obj${newId}_vizUseSegments`, label: `Object ${newId}: Use LED Segments`, type: "boolean", default: "false", description: "(Visualizer) Renders bars as discrete segments instead of solid blocks." },
            { property: `obj${newId}_vizSegmentCount`, label: `Object ${newId}: Segment Count`, type: "number", default: "16", min: "2", max: "64", description: "(Visualizer) The number of vertical LED segments the bar is divided into." },
            { property: `obj${newId}_vizSegmentSpacing`, label: `Object ${newId}: Segment Spacing`, type: "number", default: "1", min: "0", max: "10", description: "(Visualizer) The spacing between segments in a bar." },
            { property: `obj${newId}_vizBassLevel`, label: `Object ${newId}: Bass Level %`, type: "number", default: "100", min: "0", max: "200", description: "(Visualizer) Multiplier for the lowest frequency bars." },
            { property: `obj${newId}_vizTrebleBoost`, label: `Object ${newId}: Treble Boost %`, type: "number", default: "125", min: "0", max: "200", description: "(Visualizer) Multiplier for the highest frequency bars." },

            // Sensor Reactivity
            { property: `obj${newId}_enableSensorReactivity`, label: `Object ${newId}: Enable Sensor Reactivity`, type: "boolean", default: "false", description: "Enables the object to react to sensor data." },
            { property: `obj${newId}_sensorTarget`, label: `Object ${newId}: Reactive Property`, type: "combobox", default: "Sensor Meter", values: "Sensor Meter,Time Plot", description: "Selects the specific effect that the object will perform in response to sensor data." },
            { property: `obj${newId}_sensorValueSource`, label: `Object ${newId}: Sensor Value`, type: "combobox", default: "value", values: "value,min,max", description: "The source of the data value to use from the selected sensor (current, min, or max)." },
            { property: `obj${newId}_userSensor`, label: `Object ${newId}: Sensor`, type: "sensor", default: "CPU Load", description: "The hardware sensor to monitor for reactivity." },
            { property: `obj${newId}_timePlotLineThickness`, label: `Object ${newId}: Line Thickness`, type: "number", default: "1", min: "1", max: "50", description: "(Time Plot) Sets the thickness of the time-plot line." },
            { property: `obj${newId}_timePlotFillArea`, label: `Object ${newId}: Fill Area`, type: "boolean", default: "false", description: "(Time Plot) Fills the area under the time plot line." },
            { property: `obj${newId}_sensorColorMode`, label: `Object ${newId}: Color Mode`, type: "combobox", default: "None", values: "None,Value-Based Gradient,Thresholds", description: "(Sensor Meter) The coloring method for the sensor meter." },
            { property: `obj${newId}_sensorMidThreshold`, label: `Object ${newId}: Mid Threshold`, type: "number", default: "50", min: "0", max: "100", description: "The sensor value at which the color changes from green to orange." },
            { property: `obj${newId}_sensorMaxThreshold`, label: `Object ${newId}: Max Threshold`, type: "number", default: "90", min: "0", max: "100", description: "The sensor value at which the color changes from orange to red." },
            { property: `obj${newId}_sensorMeterShowValue`, label: `Object ${newId}: Show Value`, type: "boolean", default: "false", description: "(Sensor Meter) Displays the current sensor value as text on the meter." },
            { property: `obj${newId}_timePlotAxesStyle`, label: `Object ${newId}: Axes Style`, type: "combobox", default: "None", values: "None,Lines Only,Lines and Values", description: "(Time Plot) Sets the style for the X and Y axes." },
            { property: `obj${newId}_timePlotTimeScale`, label: `Object ${newId}: Time Scale (Seconds)`, type: "number", default: "5", min: "1", max: "30", description: "(Time Plot) The total duration in seconds displayed across the width of the chart." },

            // Strimer
            { property: `obj${newId}_strimerRows`, label: `Object ${newId}: Rows`, type: "number", default: "4", min: "1", max: "50", description: "(Strimer) Number of horizontal rows." },
            { property: `obj${newId}_strimerColumns`, label: `Object ${newId}: Columns`, type: "number", default: "4", min: "1", max: "50", description: "(Strimer) Number of vertical columns." },
            { property: `obj${newId}_strimerBlockCount`, label: `Object ${newId}: Block Count`, type: "number", default: "4", min: "1", max: "100", description: "(Strimer) Number of animated blocks per column." },
            { property: `obj${newId}_strimerBlockSize`, label: `Object ${newId}: Block Size`, type: "number", default: "10", min: "1", max: "100", description: "(Strimer) Height of each block in pixels." },
            { property: `obj${newId}_strimerAnimation`, label: `Object ${newId}: Animation`, type: "combobox", default: "Bounce", values: "Bounce,Loop,Cascade,Audio Meter,Snake", description: "(Strimer) The primary animation style for the blocks." },
            { property: `obj${newId}_strimerDirection`, label: `Object ${newId}: Direction`, type: "combobox", default: "Random", values: "Up,Down,Random", description: "(Strimer) The initial direction of the blocks." },
            { property: `obj${newId}_strimerEasing`, label: `Object ${newId}: Easing`, type: "combobox", default: "Linear", values: "Linear,Ease-In,Ease-Out,Ease-In-Out", description: "(Strimer) The acceleration curve of the block movement." },
            { property: `obj${newId}_strimerAnimationSpeed`, label: `Object ${newId}: Animation Speed`, type: "number", default: "20", min: "0", max: "100", description: "(Strimer) The speed of the block movement, independent of the fill animation." },
            { property: `obj${newId}_strimerSnakeDirection`, label: `Object ${newId}: Snake Direction`, type: "combobox", default: "Vertical", values: "Horizontal,Vertical", description: "(Strimer) The direction of the snake." },
            { property: `obj${newId}_strimerBlockSpacing`, label: `Object ${newId}: Block Spacing`, type: "number", default: "5", min: "0", max: "50", description: "(Cascade) The vertical spacing between blocks in a cascade." },
            { property: `obj${newId}_strimerGlitchFrequency`, label: `Object ${newId}: Glitch Frequency`, type: "number", default: "0", min: "0", max: "100", description: "(Glitch) How often blocks stutter or disappear. 0 is off." },
            { property: `obj${newId}_strimerPulseSync`, label: `Object ${newId}: Sync Columns`, type: "boolean", default: "true", description: "(Pulse) If checked, all columns pulse together." },
            { property: `obj${newId}_strimerAudioSensitivity`, label: `Object ${newId}: Audio Sensitivity`, type: "number", default: "100", min: "0", max: "200", description: "(Audio Meter) Multiplies the height of the audio bars." },
            { property: `obj${newId}_strimerBassLevel`, label: `Object ${newId}: Bass Level %`, type: "number", default: "100", min: "0", max: "200", description: "(Audio Meter) Multiplier for the bass column(s)." },
            { property: `obj${newId}_strimerTrebleBoost`, label: `Object ${newId}: Treble Boost %`, type: "number", default: "150", min: "0", max: "200", description: "(Audio Meter) Multiplier for the treble/volume columns." },
            { property: `obj${newId}_strimerAudioSmoothing`, label: `Object ${newId}: Audio Smoothing`, type: "number", default: "60", min: "0", max: "99", description: "(Audio Meter) Smooths out the bar movement." },
            { property: `obj${newId}_strimerPulseSpeed`, label: `Object ${newId}: Pulse Speed`, type: "number", default: "0", min: "0", max: "100", description: "(Modifier) Speed of the breathing/pulse effect. 0 is off." },

            // Spawner
            { property: `obj${newId}_spawn_shapeType`, label: `Object ${newId}: Particle Shape`, type: "combobox", values: "rectangle,circle,polygon,star,sparkle,custom,matrix,random", default: "circle", description: "(Spawner) The geometric shape of the emitted particles." },
            { property: `obj${newId}_spawn_animation`, label: `Object ${newId}: Emitter Style`, type: "combobox", values: "explode,fountain,rain,flow", default: "explode", description: "(Spawner) The behavior and direction of particle emission." },
            { property: `obj${newId}_spawn_count`, label: `Object ${newId}: Max Particles`, type: "number", default: "100", min: "1", max: "500", description: "(Spawner) The maximum number of particles on screen at once." },
            { property: `obj${newId}_spawn_spawnRate`, label: `Object ${newId}: Spawn Rate`, type: "number", default: "50", min: "0", max: "500", description: "(Spawner) How many new particles are created per second." },
            { property: `obj${newId}_spawn_lifetime`, label: `Object ${newId}: Lifetime (s)`, type: "number", default: "3", min: "0.1", max: "20", description: "(Spawner) How long each particle lasts, in seconds." },
            { property: `obj${newId}_spawn_speed`, label: `Object ${newId}: Initial Speed`, type: "number", default: "50", min: "0", max: "500", description: "(Spawner) The average starting speed of newly created particles." },
            { property: `obj${newId}_spawn_speedVariance`, label: `Object ${newId}: Initial Speed Variance (±)`, type: "number", default: "0", min: "0", max: "500", description: "(Spawner) Adds randomness to the initial speed of each particle." },
            { property: `obj${newId}_spawn_size`, label: `Object ${newId}: Particle Size`, type: "number", default: "10", min: "1", max: "100", description: "(Spawner) The size of each particle in pixels." },
            { property: `obj${newId}_spawn_size_randomness`, label: `Object ${newId}: Size Randomness %`, type: "number", default: "0", min: "0", max: "100", description: "(Spawner) How much to vary each particle's size." },
            { property: `obj${newId}_spawn_gravity`, label: `Object ${newId}: Gravity`, type: "number", default: "0", min: "-200", max: "200", description: "(Spawner) A constant downward (or upward) force applied to particles." },
            { property: `obj${newId}_spawn_spread`, label: `Object ${newId}: Spread Angle`, type: "number", default: "360", min: "0", max: "360", description: "(Spawner) The angle (in degrees) for Explode or Fountain emitters." },
            { property: `obj${newId}_spawn_rotationSpeed`, label: `Object ${newId}: Particle Rotation Speed`, type: "number", default: "0", min: "-360", max: "360", description: "(Spawner) The average rotational speed of each particle in degrees per second." },
            { property: `obj${newId}_spawn_rotationVariance`, label: `Object ${newId}: Rotation Variance (±deg/s)`, type: "number", default: "0", min: "0", max: "360", description: "(Spawner) Sets the random range for rotation speed." },
            { property: `obj${newId}_spawn_initialRotation_random`, label: `Object ${newId}: Random Initial Rotation`, type: "boolean", default: "false", description: "(Spawner) If checked, each particle starts at a random angle." },
            { property: `obj${newId}_spawn_svg_path`, label: `Object ${newId}: Custom SVG Path`, type: "textfield", default: "M -20 -20 L 20 -20 L 20 20 L -20 20 Z", description: "(Spawner) The SVG `d` attribute path data for the custom particle shape." },
            { property: `obj${newId}_spawn_matrixCharSet`, label: `Object ${newId}: Matrix Character Set`, type: "combobox", default: "katakana", values: "katakana,numbers,binary,ascii", description: "(Spawner) The set of characters to use for the Matrix particle type." },
            { property: `obj${newId}_spawn_enableTrail`, label: `Object ${newId}: Enable Trail`, type: "boolean", default: "false", description: "(Spawner/Trail) Enables a fading trail behind each particle." },
            { property: `obj${newId}_spawn_trailLength`, label: `Object ${newId}: Trail Length`, type: "number", default: "15", min: "1", max: "50", description: "(Spawner) The number of segments or characters in a particle's trail." },
            { property: `obj${newId}_spawn_trailSpacing`, label: `Object ${newId}: Trail Spacing`, type: "number", default: "1", min: "0.1", max: "10", step: "0.1", description: "(Spawner/Trail) Multiplier for the distance between trail segments." },
            { property: `obj${newId}_spawn_matrixEnableGlow`, label: `Object ${newId}: Enable Character Glow`, type: "boolean", default: "false", description: "(Spawner/Matrix) Adds a glow effect to the matrix characters." },
            { property: `obj${newId}_spawn_matrixGlowSize`, label: `Object ${newId}: Character Glow Size`, type: "number", default: "10", min: "0", max: "50", description: "(Spawner/Matrix) The size and intensity of the glow effect." },

            // Polyline
            { property: `obj${newId}_polylineCurveStyle`, label: `Object ${newId}: Curve Style`, type: "combobox", default: "straight", values: "straight,loose-curve,tight-curve", description: "(Polyline) The style of the line segments." },
            { property: `obj${newId}_polylineNodes`, label: `Object ${newId}: Nodes`, type: "nodetable", default: '[{"x":50,"y":50},{"x":150,"y":100}]', description: "(Polyline) The coordinate data for the polyline nodes." },
            { property: `obj${newId}_pathAnim_enable`, label: `Object ${newId}: Enable Animation`, type: "boolean", default: "false", description: "Enables an object that travels along the path." },
            { property: `obj${newId}_pathAnim_shape`, label: `Object ${newId}: Shape`, type: "combobox", default: "circle", values: "circle,rectangle,star,polygon", description: "The shape of the traveling object." },
            { property: `obj${newId}_pathAnim_size`, label: `Object ${newId}: Size`, type: "number", default: "10", min: "1", max: "100", description: "The size of the traveling object in pixels." },
            { property: `obj${newId}_pathAnim_speed`, label: `Object ${newId}: Speed`, type: "number", default: "50", min: "0", max: "1000", description: "How fast the object travels along the path (pixels per second)." },
            { property: `obj${newId}_pathAnim_gradType`, label: `Object ${newId}: Fill Type`, type: "combobox", default: "solid", values: "solid,linear,radial,conic,alternating,random,rainbow,rainbow-radial,rainbow-conic" },
            { property: `obj${newId}_pathAnim_useSharpGradient`, label: `Object ${newId}: Use Sharp Gradient`, type: "boolean", default: "false" },
            { property: `obj${newId}_pathAnim_gradColor1`, label: `Object ${newId}: Color 1`, type: "color", default: "#FFFFFF" },
            { property: `obj${newId}_pathAnim_gradColor2`, label: `Object ${newId}: Color 2`, type: "color", default: "#00BFFF" },
            { property: `obj${newId}_pathAnim_animationMode`, label: `Object ${newId}: Fill Animation`, type: "combobox", values: "loop,bounce", default: "loop" },
            { property: `obj${newId}_pathAnim_animationSpeed`, label: `Object ${newId}: Fill Speed`, type: "number", default: "10", min: "0", max: "100" },
            { property: `obj${newId}_pathAnim_behavior`, label: `Object ${newId}: Behavior`, type: "combobox", values: "Loop,Ping-Pong", default: "Loop", description: "How the object behaves when it reaches the end of the path." },
            { property: `obj${newId}_pathAnim_objectCount`, label: `Object ${newId}: Object Count`, type: "number", default: "1", min: "1", max: "100", description: "The number of objects to animate along the path." },
            { property: `obj${newId}_pathAnim_objectSpacing`, label: `Object ${newId}: Object Spacing`, type: "number", default: "25", min: "0", max: "200", description: "The distance between each object when Object Count is greater than 1." },
            { property: `obj${newId}_pathAnim_scrollDir`, label: `Object ${newId}: Scroll Direction`, type: "combobox", values: "right,left,up,down", default: "right" },
            { property: `obj${newId}_pathAnim_cycleColors`, label: `Object ${newId}: Cycle Colors`, type: "boolean", default: "false" },
            { property: `obj${newId}_pathAnim_cycleSpeed`, label: `Object ${newId}: Color Cycle Speed`, type: "number", default: "10", min: "0", max: "100" },
            { property: `obj${newId}_pathAnim_trail`, label: `Object ${newId}: Trail`, type: "combobox", values: "None,Fade,Solid", default: "None", description: "Adds a trail behind the moving object." },
            { property: `obj${newId}_pathAnim_trailLength`, label: `Object ${newId}: Trail Length`, type: "number", default: "20", min: "1", max: "200", description: "The length of the trail." },
            { property: `obj${newId}_pathAnim_trailColor`, label: `Object ${newId}: Trail Color`, type: "combobox", values: "Inherit,Rainbow", default: "Inherit", description: "The color style of the trail." },
        ];
            }
            return getDefaultObjectConfig;
        }
        """

        # Expose the function to the page's context
        await page.evaluate(f"window.getDefaultObjectConfig = {get_default_object_config_source}")

        # Add a listener for console messages
        page.on('console', lambda msg: print(f"Browser console: {msg.text}"))

        # Select the 'tetris' shape for obj1
        await page.select_option('select[name="obj1_shape"]', 'tetris')

        # Select the 'comet' animation
        await page.select_option('select[name="obj1_tetrisAnimation"]', 'comet')

        # Wait for a moment to let the animation run
        await page.wait_for_timeout(1000)

        # Take a screenshot
        screenshot_path = 'jules-scratch/verification/tetris_animation_verification.png'
        await page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
