google.charts.load('current', {'packages':['corechart']});        

// draw chart for battle of sexes (with given number of male and female counts)
function drawChart(g1, g1count, g2, g2count) {

    var data = google.visualization.arrayToDataTable([
      ['Gender', 'Medals'],
      [g1, parseInt(g1count)],
      [g2, parseInt(g2count)],
      ]);

    var options = {
      title: 'Battle of the Sexes Medal Count',
      color: 'blue',
      is3D: true,
  };

  var chart = new google.visualization.PieChart(document.getElementById('piechart'));
  console.log(chart);
  chart.draw(data, options);
}