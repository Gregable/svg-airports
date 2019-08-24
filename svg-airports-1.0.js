// This function uses a hidden div to compute the width and height of a given
// text string. We use it so that we can position runway names precisely.
function textSize(str) {
  sizerDiv = document.createElement('div');
  sizerDiv.setAttribute('class', 'textSizer');
  textChild = document.createTextNode(str);
  sizerDiv.appendChild(textChild);
  document.getElementsByTagName('body')[0].appendChild(sizerDiv);
  const w = sizerDiv.clientWidth;
  const h = sizerDiv.clientHeight;
  sizerDiv.remove();
  return [w, h];
}

// This function renders the text for the runway identifier as well as
// some green lines showing the preferred pattern for the runway.
function renderRunwayId(runwayEl, offset, idx) {
  var gEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  // Determine the text dimensions. Note that some calculations still assume
  // specific dimensions, so we are not quite ready for arbitrary fonts yet.
  text = runwayEl.getAttribute("name");
  const size = textSize(text);
  const w = size[0];
  const h = size[1];

  textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  textChild = document.createTextNode(text);
  textEl.appendChild(textChild);

  line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');

  line1.setAttribute("x1", "0");
  line1.setAttribute("x2", "0");
  line1.setAttribute("y1", "0");
  line1.setAttribute("y2", "15");
  line2.setAttribute("x1", "0");
  line2.setAttribute("y1", "15");
  line2.setAttribute("y2", "15");

  if (runwayEl.getAttribute('pattern') === 'left')
    line2.setAttribute("x2", "-15");
  if (runwayEl.getAttribute('pattern') === 'right')
    line2.setAttribute("x2", "15");
  gEl.appendChild(line1);
  gEl.appendChild(line2);

  textEl.setAttribute("x", -1 * w / 2);
  textEl.setAttribute("y", 0 - 2);

  const t = offset + h - 2;
  if (idx === 0) {
    gEl.setAttribute("transform", "translate(0, " + t + ")");
  }
  if (idx === 1) {
    gEl.setAttribute("transform", "translate(0, -" + t + ") rotate(180)");
  }

  gEl.appendChild(textEl);
  return gEl;
}

// Renders a given runway within an airport.
function renderRunway(runwayEl, rwyPixels) {
  var gEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  gEl.setAttribute("transform",
      "rotate(" + runwayEl.getAttribute('true-heading') + ")");

  var rectEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  gEl.appendChild(rectEl);

  // Generate a 16 width runway rect which is centered at 0,0.
  rectEl.setAttribute("width", "16");
  rectEl.setAttribute("height", rwyPixels);
  rectEl.setAttribute("x", "-8");
  rectEl.setAttribute("y", -1 * rwyPixels / 2);

  if (runwayEl.children.length !== 2)
    throw("Unexpected number of <runway-id> elements");
  for (var i = 0; i < runwayEl.children.length; ++i) {
    var child = runwayEl.children[i];
    if (child.tagName !== 'RUNWAY-ID')
      throw('Unexpected tag: ' + child.tagName);
    var rwyId = renderRunwayId(child, rwyPixels / 2, i);
    gEl.appendChild(rwyId);
  }

  return gEl;
}

// Renders an entire airport, including multiple runways.
function renderAirport(airportEl) {
  const w = airportEl.getAttribute("width");
  const h = airportEl.getAttribute("height");
  // TODO: Calculate the size ratio considering the angle of the runways rather
  // than simply assuming the runways will require a square. Therefore allowing
  // a tall image to contain a N/S runway, for example.
  const minDimension = Math.min(w, h);

  var svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgEl.setAttribute("width", w);
  svgEl.setAttribute("height", h);

  maxRwyLen = 0;
  for (child of airportEl.children) {
    if (child.tagName !== 'AIRPORT-RUNWAY')
      throw("Unexpected Tag: " + child.tagName);
    rwyLen = Number.parseFloat(child.getAttribute("length-ft"));
    if (rwyLen == NaN)
      throw("Unparseable rwy length");
    if (rwyLen > maxRwyLen) maxRwyLen = rwyLen;
  }
  const ratio = 1 / maxRwyLen * (minDimension - 70);
  
  for (child of airportEl.children) {
    rwyLen = Number.parseFloat(child.getAttribute("length-ft"));
    rwyVisualLen = rwyLen * ratio;
    gEl = renderRunway(child, rwyVisualLen);
    svgEl.appendChild(gEl);

    // Translate the rendered runway to the center of the SVG
    // and then again by the user's requested translations.
    var tx = w / 2;
    var ty = h / 2;
    var transform = "translate(" + tx + ", " + ty + ") ";
    if (child.getAttribute("offset-angle")) {
      var angle = child.getAttribute("offset-angle");
      transform += "rotate(" + angle + ") ";
    }
    var ox = child.getAttribute("offset-x") * ratio;
    var oy = -1 * child.getAttribute("offset-y") * ratio;
    transform += "translate(" + ox + ", " + oy + ") ";
    if (child.getAttribute("offset-angle")) {
      var angle = child.getAttribute("offset-angle");
      transform += "rotate(-" + angle + ") ";
    }

    transform += gEl.getAttribute('transform');
    console.log(transform);
    gEl.setAttribute("transform", transform);
  }

  airportEl.appendChild(svgEl);
}

// Add some simple css for styling the CSS.
var css = `
airport-diagram svg {
  border: 1px solid black;
}
airport-diagram text {
  font: 13px sans-serif;
}
airport-diagram line { 
  stroke:rgb(20,90,20);
  stroke-width:3;
}
airport-diagram rect {
  fill:rgb(180,180,190);
  stroke:rgb(0,0,0);
}
div.textSizer {
  font: 13px sans-serif;
  position: absolute;
  float: left;
  white-space: nowrap;
  visibility: hidden;
  width: auto;
  height: auto;
}`;
var styleEl = document.createElement('style');
styleEl.type = 'text/css';
styleEl.appendChild(document.createTextNode(css));
document.getElementsByTagName('head')[0].appendChild(styleEl);

// Loop over and render each airport in turn.
const airports = document.getElementsByTagName('airport-diagram');
for (airport of airports) {
  renderAirport(airport);
}
