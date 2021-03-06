(function () {

    var data = null;

    d3.csv("data.csv").then(function (result) {
        data = result;
    });


    var monthsNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    window.getColors = function(year, month) {
        debugger;
        var monthName = monthsNames[month - 1];
        var foundItems = data.filter((item) => item.Year == year && item.Month.trim() == monthName);
        var mapped = foundItems.map(function (obj, index) {
            return {
                Country: obj.Country,
                Year: obj.Year,
                Month: obj.Month,
                Temp: obj.Temperature,
                HexColor: toColor(obj.Temperature)
            };
        });
        return mapped;
    }
    
    function toColor(num) {
    
        if (num <= 1 && num > 0) {
            return '#D6EAF8';
        }
        if (num <= 3 && num > 1) {
            return '#D6EAF8';
        }
        if (num <= 6 && num > 3) {
            return '#D6EAF8';
        }
        if (num <= 9 && num > 6) {
            return '#D6EAF8';
        }
        if (num <= 12 && num > 9) {
            return '#229954';
        }
        if (num <= 15 && num > 12) {
            return '#28B463';
    
        }
        if (num <= 19 && num > 15) {
            return '#2ECC71';
    
        }
        if (num <= 22 && num > 19) {
            return '#58D68D';
    
        }
        if (num <= 25 && num > 22) {
            return '#A9DFBF';
    
        }
        if (num <= 29 && num > 25) {
            return '#FCF3CF';
    
        }
        if (num <= 32 && num > 29) {
            return '#F7DC6F';
    
        }
        if (num <= 39 && num > 32) {
            return '#EDBB99';
    
        }
        if (num <= 41 && num > 39) {
            return '#E59866';
    
        }
        if (num <= 45 && num > 41) {
            return '#DC7633';
    
        }
        if (num > 45) {
            return '#E74C3C';
    
        }
    
    
    
    
    
        if (num <= 0 && num > -1) {
            return '#D6EAF8';
        }
        if (num <= -1 && num > -3) {
            return '#AED6F1';
        }
    
        if (num <= 3 && num > -6) {
            return '#85C1E9';
        }
        if (num <= 6 && num > -9) {
            return '#5DADE2';
        }
        if (num <= 9 && num > -11) {
            return '#2E86C1';
        }
        if (num <= -11) {
            return '#21618C';
    
        }
    
    
    
    }
    

})();


(function () {


    // DEFINE VARIABLES
    // Define size of map group
    // Full world map is 2:1 ratio
    // Using 12:5 because we will crop top and bottom of map
    w = 3000;
    h = 1250;
    // variables for catching min and max zoom factors
    var minZoom;
    var maxZoom;

    // DEFINE FUNCTIONS/OBJECTS
    // Define map projection
    var projection = d3
        .geoEquirectangular()
        .center([15, 25]) // set centre to further North as we are cropping more off bottom of map
        .scale([w / (2)]) // scale to fit group width
        .translate([w / 4.8, h / 2]) // ensure centred in group
        ;

    // Define map path
    var path = d3
        .geoPath()
        .projection(projection);

    // Create function to apply zoom to countriesGroup
    function zoomed() {
        t = d3.event.transform;
        if (countriesGroup)
            countriesGroup.attr("transform", "translate(" + [t.x, t.y] + ")scale(" + t.k + ")");
    }

    // Define map zoom behaviour
    var zoom = d3
        .zoom()
        .on("zoom", zoomed);

    function getTextBox(selection) {
        selection
            .each(function (d) {
                d.bbox = this
                    .getBBox();
            });
    }

    // Function that calculates zoom/pan limits and sets zoom to default value
    function initiateZoom() {
        // Define a "minzoom" whereby the "Countries" is as small possible without leaving white space at top/bottom or sides
        minZoom = Math.max($("#map-holder").width() / w, $("#map-holder").height() / h);
        // set max zoom to a suitable factor of this value
        maxZoom = 20 * minZoom;
        // set extent of zoom to chosen values
        // set translate extent so that panning can't cause map to move out of viewport
        zoom
            .scaleExtent([minZoom, maxZoom])
            .translateExtent([
                [0, 0],
                [w, h]
            ]);
        // define X and Y offset for centre of map to be shown in centre of holder
        midX = ($("#map-holder").width() - minZoom * w) / 2;
        midY = ($("#map-holder").height() - minZoom * h) / 2;
        // change zoom transform to min zoom and centre offsets
        svg.call(zoom.transform, d3.zoomIdentity.translate(midX, midY).scale(minZoom));
    }

    // zoom to show a bounding box, with optional additional padding as percentage of box size
    function boxZoom(box, centroid, paddingPerc) {
        minXY = box[0];
        maxXY = box[1];
        // find size of map area defined
        zoomWidth = Math.abs(minXY[0] - maxXY[0]);
        zoomHeight = Math.abs(minXY[1] - maxXY[1]);
        // find midpoint of map area defined
        zoomMidX = centroid[0];
        zoomMidY = centroid[1];
        // increase map area to include padding
        zoomWidth = zoomWidth * (1 + paddingPerc / 100);
        zoomHeight = zoomHeight * (1 + paddingPerc / 100);
        // find scale required for area to fill svg
        maxXscale = $("svg").width() / zoomWidth;
        maxYscale = $("svg").height() / zoomHeight;
        zoomScale = Math.min(maxXscale, maxYscale);
        // handle some edge cases
        // limit to max zoom (handles tiny countries)
        zoomScale = Math.min(zoomScale, maxZoom);
        // limit to min zoom (handles large countries and countries that span the date line)
        zoomScale = Math.max(zoomScale, minZoom);
        // Find screen pixel equivalent once scaled
        offsetX = zoomScale * zoomMidX;
        offsetY = zoomScale * zoomMidY;
        // Find offset to centre, making sure no gap at left or top of holder
        dleft = Math.min(0, $("svg").width() / 2 - offsetX);
        dtop = Math.min(0, $("svg").height() / 2 - offsetY);
        // Make sure no gap at bottom or right of holder
        dleft = Math.max($("svg").width() - w * zoomScale, dleft);
        dtop = Math.max($("svg").height() - h * zoomScale, dtop);
        // set zoom
        svg
            .transition()
            .duration(500)
            .call(
                zoom.transform,
                d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale)
            );
    }




    // on window resize
    $(window).resize(function () {
        // Resize SVG
        svg
            .attr("width", $("#map-holder").width())
            .attr("height", $("#map-holder").height());
        initiateZoom();
    });

    // create an SVG
    var svg = d3
        .select("#map-holder")
        .append("svg")
        // set to the same size as the "map-holder" div
        .attr("width", $("#map-holder").width())
        .attr("height", $("#map-holder").height())
        // add zoom functionality
        // .call(zoom);

    // get map data
    d3.json(
        "custom-map.json"
    ).then(
        function (json) {
            debugger;
            //Bind data and create one path per GeoJSON feature
            countriesGroup = svg.append("g").attr("id", "map");
            // add a background rectangle
            countriesGroup
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", w)
                .attr("height", h);

            // draw a path for each feature/country
            countries = countriesGroup
                .selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("id", function (d, i) {
                    return "country" + d.properties.iso_a3;
                })
                .attr("class", "country")
                //      .attr("stroke-width", 10)
                //      .attr("stroke", "#ff0000")
                // add a mouseover action to show name label for feature/country
                .on("mouseover", function (d, i) {
                    d3.select("#countryLabel" + d.properties.iso_a3).style("display", "block");
                })
                .on("mouseout", function (d, i) {
                    d3.select("#countryLabel" + d.properties.iso_a3).style("display", "none");
                })
                // add an onclick action to zoom into clicked country
                // .on("click", function (d, i) {
                //     d3.selectAll(".country").classed("country-on", false);
                //     d3.select(this).classed("country-on", true);
                //     boxZoom(path.bounds(d), path.centroid(d), 20);
                // });
            // Add a label group to each feature/country. This will contain the country name and a background rectangle
            // Use CSS to have class "countryLabel" initially hidden
            countryLabels = countriesGroup
                .selectAll("g")
                .data(json.features)
                .enter()
                .append("g")
                .attr("class", "countryLabel")
                .attr("id", function (d) {
                    return "countryLabel" + d.properties.iso_a3;
                })
                .attr("transform", function (d) {
                    return (
                        "translate(" + path.centroid(d)[0] + "," + path.centroid(d)[1] + ")"
                    );
                })
                // add mouseover functionality to the label
                .on("mouseover", function (d, i) {
                    d3.select(this).style("display", "block");
                })
                .on("mouseout", function (d, i) {
                    d3.select(this).style("display", "none");
                });
                // add an onlcick action to zoom into clicked country
                // .on("click", function (d, i) {
                //     d3.selectAll(".country").classed("country-on", false);
                //     d3.select("#country" + d.properties.iso_a3).classed("country-on", true);
                //     boxZoom(path.bounds(d), path.centroid(d), 20);
                // });
            // add the text to the label group showing country name
            countryLabels
                .append("text")
                .attr("class", "countryName")
                .style("text-anchor", "middle")
                .attr("dx", 0)
                .attr("dy", 0)
                .text(function (d) {
                    return d.properties.name;
                })
                .call(getTextBox);
            // add a background rectangle the same size as the text
            countryLabels
                .insert("rect", "text")
                .attr("class", "countryLabelBg")
                .attr("transform", function (d) {
                    return "translate(" + (d.bbox.x - 2) + "," + d.bbox.y + ")";
                })
                .attr("width", function (d) {
                    return d.bbox.width + 4;
                })
                .attr("height", function (d) {
                    return d.bbox.height;
                });
            initiateZoom();
        }
    );

})();



function tabulate(data, columns) {
    var table = d3.select('body').append('table').attr("class", 'table');
    var thead = table.append('thead');
    var tbody = table.append('tbody');

    thead.append('tr')
        .selectAll('th')
        .data(columns)
        .enter()
        .append('th')
        .text(function (d) {
            return d
        })

    var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr')

    var cells = rows.selectAll('td')
        .data(function (row) {
            return columns.map(function (column) {
                return {
                    column: column,
                    value: row[column]
                }
            })
        })
        .enter()
        .append('td')
        .text(function (d) {
            return d.value
        })

    return table;
}