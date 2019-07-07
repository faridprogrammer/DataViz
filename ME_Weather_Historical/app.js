(function () {

    var data = null;

    d3.csv("data.csv").then(function (result) {

        var columns = ['Temperature', 'Year', 'Month', 'Country', 'ISO3']
        data = result;
        tabulate(data, columns);


    });



})();
function tabulate(data, columns) {
    var table = d3.select('body').append('table').attr("class",'table');
    var thead = table.append('thead');
    var tbody = table.append('tbody');

    thead.append('tr')
        .selectAll('th')
        .data(columns)
        .enter()
        .append('th')
        .text(function (d) { return d })

    var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr')

    var cells = rows.selectAll('td')
        .data(function (row) {
            return columns.map(function (column) {
                return { column: column, value: row[column] }
            })
        })
        .enter()
        .append('td')
        .text(function (d) { return d.value })

    return table;
}

