// @TODO: YOUR CODE HERE!

// Define dimensions
var svgWidth = 900;
var svgHeight = 500;

var margin = {
    top: 40,
    bottom: 100,
    left: 100,
    right: 40
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create SVG wrapper, append SVG group for chart
// and shift chart by top and left margins
// Wrapper:
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial parameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare"

// Function for updating X-axis scale upon click
function xScale(data, chosenXAxis) {
    // Create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;
}

// Function for updating Y-axis scale upon click
function yScale(data, chosenYAxis) {
    // Create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.max(data, d => d[chosenYAxis]) * 1.2,
        d3.min(data, d => d[chosenYAxis]) * 0.8
        ])
        .range([0, height]);

    return yLinearScale;
}


// Function for updating X-axis var upon click
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;

}

// Function for updating Y-axis variable on click
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;

}

// Function for updating circles group with transition
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.selectAll("circle").transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    circlesGroup.selectAll("text").transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// Function for updating text in circles group with transition
function renderText(circletextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circletextGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));
    
    return circletextGroup;
}

// Function for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
        var xLabel = "In Poverty (%)";
    }

    else if (chosenXAxis === "age") {
        var xLabel = "Age (Median)";
    }

    else {
        var xLabel = "income";
    }

    if (chosenYAxis === "healthcare") {
        var yLabel = "Lacks of Healthcare (%)";
    }

    else if (chosenYAxis === "smokes") {
        var yLabel = "Smokes (%)";
    }

    else {
        var yLabel = "obesity";
    }


    var toolTip = d3
        .tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${xLabel}: ${d[chosenXAxis]}<br>${yLabel}: ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

// Import data

d3.csv("assets/data/data.csv")
    .then(function (data, err) {
    if (err) throw err;
    console.log
    console.log('loaded state data', data);

    // Parse data
    data.forEach(function (data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.healthcareLow = +data.healthcareLow;
        data.healthcareHigh = +data.healthcareHigh;
        data.obesity = +data.obesity;
        data.obesityLow = +data.obesityLow;
        data.obesityHigh = +data.obesityHigh;
        data.smokes = +data.smokes;
        data.smokesLow = +data.smokesLow;
        data.smokesHigh = +data.smokesHigh;

    })

    // xLinearScale function 
    var xLinearScale = xScale(data, chosenXAxis);

    // YLinearScale function
    var yLinearScale = yScale(data, chosenYAxis);

    // Axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    console.log(bottomAxis);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append xAxis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // Append yAxis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .attr("transform", `translate(0, 0)`)
        .call(leftAxis);

    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("g");

    circlesGroup.append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("opacity", "0.75")
        .classed("stateCircle", true);

    circlesGroup.append("text")
        .classed("stateText", true)
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d.obesity));

    // Group for x Axis label
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 25)
        .attr("value", "age") 
        .classed("active", true)
        .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 50)
        .attr("value", "income") 
        .classed("inactive", true)
        .text("Household Income (Median)");

    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 75)
        .attr("value", "poverty") 
        .classed("inactive", true)
        .text("In Poverty (%)");

    // Group for y Axis label
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${-margin.left}, ${height / 2}) rotate(-90)`);

    var obesityLabel = yLabelsGroup.append("text")
        .attr("y", 5)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("axis-text", true)
        .classed("active", true)
        .text("Obese (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .attr("y", 30)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("axis-text", true)
        .classed("inactive", true)
        .text("Smoke (%)");

    var hcLabel = yLabelsGroup.append("text")
        .attr("y", 55)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("axis-text", true)
        .classed("inactive", true)
        .text("Lack Healthcare (%)");

    // Update ToolTip function 
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // X axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function () {
            // Get value
            var xValue = d3.select(this).attr("value");
            if (xValue !== chosenXAxis) {

                // Replace chosenXAxis with value
                chosenXAxis = xValue

                console.log(chosenXAxis);

                // Update X scale
                xLinearScale = xScale(data, chosenXAxis);
                yLinearScale = yScale(data, chosenYAxis);

                // Update X axis
                xAxis = renderXAxes(xLinearScale, xAxis);

                // Update circles
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Update tooltips
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

         

            }
        });

    // Y axis labels event listener
    yLabelsGroup.selectAll("text")
        .on("click", function () {

            // Get value
            var yValue = d3.select(this).attr("value");
            if (yValue !== chosenYAxis) {

                // Replace chosenYAxis with value
                chosenYAxis = yValue

                console.log(chosenYAxis);

                // Update X scale
                xLinearScale = xScale(data, chosenXAxis);
                yLinearScale = yScale(data, chosenYAxis);

                // Update Y axis
                yAxis = renderYAxes(yLinearScale, yAxis);

                // Update circles
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Update tooltips
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            }
        });
}).catch(function (error) {
    console.log(error);
});