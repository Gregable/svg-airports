# svg-airports
Web Component for drawing simplified airport diagrams.

This repository contains a simple javascript library that can be included on any page to add
simple airport diagrams to the page, such as this one:

<img src=example.svg>

The source code for this example looks like:

```html
<airport-diagram width=200 height=200>
  <airport-runway length-ft=4001 true-heading=132>
    <runway-id name=12 pattern=left></runway-id>
    <runway-id name=30 pattern=left></runway-id>
  </airport-runway>
  <airport-runway length-ft=3438 true-heading=090
                  offset-angle=0 offset-x=0 offset-y=700>
    <runway-id name=8 pattern=left></runway-id>
    <runway-id name=26 pattern=left></runway-id>
  </airport-runway>
</airport-diagram> 
```

To use, simply include the javascript file at the bottom of your page:
```html
<script src=svg-airports-1.0.js async></script>
```

A quick description of the fields above:
 - `airport-diagram`: This sets up a container for the image with width/height specified in pixels.
 - `airport-runway`: One or more runways can be specified. 
   - The `length-ft` attribute provides lengths which will be used to relatively size multiple runways.
   - The `true-heading` attribute specifies the true heading of the runway in degrees. Use values < 180.
   - `offset-angle`, `offset-x`, and `offset-y` can be used to translate the runway. By default each runway center
     is centered within the diagram image. `offset-x` will move the runway to the east by the provided number of ft,
     `offset-y` to the north. If `offset-angle` is set, the offsets will be relative to the provided angle. Typically
     setting an offset angle perpendicular to the runway heading allows one to position it most easily.
 - `runway-id` provides the runway labels and pattern indicator for the runway. `name` can be a value like `12` or `7L` while
   `pattern` must be either `left` or `right`.
