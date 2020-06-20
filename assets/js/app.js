// SVG dimensions, margin(s), calculate chart dimensions
var svgWidth = parseInt(d3.select("#scatter").style("width"));

var svgHeight = svgWidth * .75; //set ratio

var margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
};

// Label container's height
var labelArea = {
    left: 100,
    bottom: 100
};

var textPadding = {
    bottom: 40,
    left: 40,
};
// Adjust to space out .aText
textSpacing = 25;

// Select div and append svg
var svg = d3.select("#scatter").append("svg")
    .attr("width", svgWidth).attr("height", svgHeight)
    .attr("class", "chart");

// Radius of circles determined by plot size/window size
var circleRadius;
function getRadius() {
    if (svgWidth <= 500) {
        circleRadius = 5;
    }
    else {
        circleRadius = 10;
    }
}
// invoke to get radius once
getRadius();

// Create the labels
svg.append("g").classed("xText", true);
var xText = d3.select(".xText");

// Dynamically position our labels
function updateXTextPosition() {
    var xXpos = (svgWidth + labelArea.left) / 2; // center within inner chart dimension
    var xYpos = svgHeight - margin.bottom - textPadding.bottom;
    xText.attr("transform", `translate(${xXpos}, ${xYpos})`);
}

updateXTextPosition();

// Append three spaced out xText.
// From our updateXTextPosition function, we translated the y position "down" by the margin(20) and textPadding.bottom(40)
xText.append("text").attr("y", -textSpacing)
    .attr("value", "poverty") // used to change data
    .attr("data-axis", "x")
    .classed("aText active x", true) // classes x and y will be used to change labels, initially active
    .text("In Poverty (%)");

xText.append("text").attr("y", 0)
    .attr("value", "age") // used to change data
    .attr("data-axis", "x")
    .classed("aText inactive x", true)
    .text("Age (Median)");

xText.append("text").attr("y", textSpacing)
    .attr("value", "income") // used to change data
    .attr("data-axis", "x")
    .classed("aText inactive x", true)
    .text("Household Income (Median)");

// Do the same for yText
svg.append("g").classed("yText", true);
var yText = d3.select(".yText");

var yXpos = margin.left + textPadding.left;
var yYpos = (svgHeight - labelArea.bottom) / 2; // center within the inner chart dimension

function updateYTextPosition() {
    yText.attr("transform", `translate(${yXpos}, ${yYpos})rotate(-90)`);
}

updateYTextPosition();

yText.append("text").attr("y", -textSpacing)
    .attr("value", "obesity") // used to change data
    .attr("data-axis", "y")
    .classed("aText active y", true) // initially active
    .text("Obese (%)");

yText.append("text").attr("y", 0)
    .attr("value", "smokes") // used to change data
    .attr("data-axis", "y")
    .classed("aText inactive y", true)
    .text("Smokes (%)");

yText.append("text").attr("y", textSpacing)
    .attr("value", "healthcare") // used to change data
    .attr("data-axis", "y")
    .classed("aText inactive y", true)
    .text("Lacks Healthcare (%)");

// Import CSV 
d3.csv("assets/data/data.csv").then(data => {
    var currentX = "poverty";
    var currentY = "obesity";

    var xMin, xMax, yMin, yMax;

    // D3 tip
    var toolTip = d3.tip()
        .attr("class", "d3-tip").offset([40, -60]) // must use attr() with tip()
        .html(d => {
            var xValue;
            var state = `<div>${d.state}</div>`;
            var yValue = "<div>" + currentY + ": " + d[currentY] + "%</div>";

            if (currentX === "poverty") {
                xValue = "<div>" + currentX + ": " + d[currentX] + "%</div>";
            }
            else {
                xValue = "<div>" + currentX + ": " + parseFloat(d[currentX]).toLocaleString("en") + "</div>";
            }
            return state + xValue + yValue;
        });


    svg.call(toolTip);


    // In order to build our scales, we need to find the 
    // minimum and maximum values of our data to set the domain
    function xMinMax() {
        xMin = d3.min(data, d => parseFloat(d[currentX]) * 0.9);
        xMax = d3.max(data, d => parseFloat(d[currentX]) * 1.1);
    }

    function yMinMax() {
        yMin = d3.min(data, d => parseFloat(d[currentY]) * 0.9);
        yMax = d3.max(data, d => parseFloat(d[currentY]) * 1.1);
    }

    xMinMax();
    yMinMax();

    // From our minimum and maximum values for x and y, create the scales
    // then create the axes
    var xScale = d3.scaleLinear()
        .domain([xMin, xMax])
        .range([margin.left + labelArea.left, svgWidth - margin.left]);
    var yScale = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([svgHeight - margin.bottom - labelArea.bottom, margin.bottom]); //D3's positive is down

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    // change tick count 
    function tickCount() {
        if (svgWidth <= 500) {
            xAxis.ticks(5);
            yAxis.ticks(5);
        }
        else {
            xAxis.ticks(10);
            yAxis.ticks(10);
        }
    }
    tickCount();

    // function to change labels, set active classes
    function changeLabels(axis, value) {
        d3.selectAll(".aText").filter("." + axis).filter(".active")//filter for only respective active text
            .classed("active", false).classed("inactive", true); //change active to inactive
        // sets the clicked text from inactive to active
        value.classed("inactive", false).classed("active", true);
    }

    var xBarTranslate = svgHeight - margin.bottom - labelArea.bottom;
    var yBarTranslate = margin.left + labelArea.left;
    svg.append("g").call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", `translate(0, ${xBarTranslate})`);
    svg.append("g").call(yAxis)
        .attr("class", "yAxis")
        .attr("transform", `translate(${yBarTranslate}, 0)`);

    // Select group for the circles and labels
    var circlesGroup = svg.selectAll("g circlesGroup").data(data).enter();

    // Append the circles
    circlesGroup.append("circle")
        .attr("cx", d => xScale(d[currentX]))
        .attr("cy", d => yScale(d[currentY]))
        .attr("r", circleRadius)
        .attr("class", d => `stateCircle ${d.abbr}`)
        // Using the lexical 'this', should not be used with an anonymous function
        .on("mouseover", function (d) {
            toolTip.show(d, this);
            d3.select(this).style("stroke", "#323232");
        })
        .on("mouseout", function (d) {
            toolTip.hide(d, this);
            d3.select(this).style("stroke", "#e3e3e3");
        });

    // Append labels
    circlesGroup.append("text")
        .text(d => d.abbr)
        .attr("dx", d => xScale(d[currentX]))
        .attr("dy", d => yScale(d[currentY]) + circleRadius / 3)
        .attr("font-size", circleRadius) // keep within the circle
        .attr("class", "stateText")
        .on("mouseover", function (d) {
            toolTip.show(d, this);
            d3.select(`.${d.abbr}`).style("stroke", "#323232");
        })
        .on("mouseout", function (d) {
            toolTip.hide(d, this);
            d3.select(`.${d.abbr}`).style("stroke", "#e3e3e3");
        });


    // Make the axis text dynamic by adding event listener
    d3.selectAll(".aText").on("click", function () {
        var thisElement = d3.select(this); // reference, used frequenty
        if (thisElement.classed("inactive")) {
            // determine x or y
            var axis = thisElement.attr("data-axis");
            // Later used to change currentX or currentY
            var state = thisElement.attr("value");

            if (axis === "x") {
                currentX = state;
                // Call xMinMax to update values, update xScale, then update axis
                xMinMax();
                xScale.domain([xMin, xMax]);
                svg.select(".xAxis").transition().call(xAxis);

                // Update circles' point on the map
                d3.selectAll("circle").each(function (d) {
                    d3.select(this).transition()
                        .attr("cx", d => xScale(d[currentX]));
                });
                // Update locations' point
                d3.selectAll(".stateText").each(function (d) {
                    d3.select(this).transition()
                        .attr("dx", d => xScale(d[currentX]));
                });
                // Change the labels to set activity
                changeLabels(axis, thisElement);
            }
            else {
                // Do the same but for the y-axis
                currentY = state;
                yMinMax();
                yScale.domain([yMin, yMax]);
                svg.select(".yAxis").transition().call(yAxis);
                d3.selectAll("circle").each(function (d) {
                    d3.select(this).transition()
                        .attr("cy", d => yScale(d[currentY]));
                });
                d3.selectAll(".stateText").each(function (d) {
                    d3.select(this).transition()
                        .attr("dy", d => yScale(d[currentY]) + circleRadius / 3);
                });
                changeLabels(axis, thisElement);
            }
        }
    })
    // Responsive Chart when window is resized
    d3.select(window).on("resize", resize);

    function resize() {
        svgWidth = parseInt(d3.select("#scatter").style("width"));
        svgHeight = svgWidth * 0.75;
        // now our yYpos changes
        yYpos = (svgHeight - labelArea.bottom) / 2;

        // use the new width and height to resize the chart
        svg.attr("width", svgWidth).attr("height", svgHeight);

        // Change the scales, then change the axes
        xScale.range([margin.left + labelArea.left, svgWidth - margin.left]);
        yScale.range([svgHeight - margin.bottom - labelArea.bottom, margin.bottom]);

        // update axes location, for the x-axis, we must recalculate how much to move it "up" by
        xBarTranslate = svgHeight - margin.bottom - labelArea.bottom;
        svg.select(".xAxis").call(xAxis).attr("transform", `translate(0, ${xBarTranslate})`);
        svg.select(".yAxis").call(yAxis);

        // If resizing ticks
        tickCount();

        // Update labels
        updateXTextPosition();
        updateYTextPosition();

        // Update circle radius
        getRadius();

        // Change location of circles and text to reflect the axes changes
        d3.selectAll("circle")
            .attr("cx", d => xScale(d[currentX])) // update positions
            .attr("cy", d => yScale(d[currentY]))
            .attr("r", () => circleRadius); // update radius
        d3.selectAll(".stateText")
            .attr("dx", d => xScale(d[currentX]))
            .attr("dy", d => yScale(d[currentY]) + circleRadius / 3)
            .attr("r", circleRadius);
    }
})
