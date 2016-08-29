var Simulation = require('./simulate');
var Chart = require('./barChart');
var Graphic = require('./main');
var frequency = require('./frequency');
var Moth = require('./moth');
var Matchmaker = require('./matchmaker');
var drawChromosomes = require('./chromosome');
var ScatterPlot = require('./scatter3D');

const MAX_ENV = 255;

$(document).ready(function() {
  var num_gens = $('#num-gens').val();
  var env;
  var config;
  var mySim;
  var starting;
  var graphic = new Graphic();
  var chart = new Chart();
  var scatter = new ScatterPlot();
  var canRun = true;
  var formNumGens;
  var formPopSize;
  var formMutRate;
  var formFitness;

  selectButton($('#scenario-a'));

  drawChromosomes();
  scatter.initPlot();

  initializeSim();

  // render starting population in the SVG/canvas
  drawD3(starting, mySim.population, config);

  $('#scenario-a').click(function() {
    unselectButtons();
    selectButton(this);
    $('#uniform').prop("checked", true)
    $('#black-white').prop("checked", true)
    formNumGens = $('#num-gens').val(300);
    formPopSize = $('#pop-size').val(500);
    formMutRate = $('#mut-rate').val(0.0002);
    formFitness = $('#fitness').val(0.2);
    $('#reset').click();
  });

  $('#scenario-b').click(function() {
    unselectButtons();
    selectButton(this);
    $('#uniform').prop("checked", true)
    $('#black-white').prop("checked", true)
    formNumGens = $('#num-gens').val(200);
    formPopSize = $('#pop-size').val(500);
    formMutRate = $('#mut-rate').val(0);
    formFitness = $('#fitness').val(0.2);
    $('#reset').click();
  });

  $('#scenario-c').click(function() {
    unselectButtons();
    selectButton(this);
    $('#random').prop("checked", true)
    $('#black-white').prop("checked", true)
    formNumGens = $('#num-gens').val(300);
    formPopSize = $('#pop-size').val(500);
    formMutRate = $('#mut-rate').val(0.0001);
    formFitness = $('#fitness').val(0.35);
    $('#reset').click();
  });

  $('#scenario-d').click(function() {
    unselectButtons();
    selectButton(this);
    $('#random').prop("checked", true)
    $('#color').prop("checked", true)
    formNumGens = $('#num-gens').val(400);
    formPopSize = $('#pop-size').val(500);
    formMutRate = $('#mut-rate').val(0.0001);
    formFitness = $('#fitness').val(0.25);
    $('#reset').click();
  });

  $('#scenario-e').click(function() {
    unselectButtons();
    selectButton(this);
    $('#random').prop("checked", true)
    $('#color').prop("checked", true)
    formNumGens = $('#num-gens').val(300);
    formPopSize = $('#pop-size').val(500);
    formMutRate = $('#mut-rate').val(0.0001);
    formFitness = $('#fitness').val(0);
    $('#reset').click();
  });

  $("#start").click(function() {
    formNumGens = $('#num-gens').val();
    formPopSize = $('#pop-size').val();
    formMutRate = $('#mut-rate').val();
    formFitness = $('#fitness').val();

    var form_valid = true;

    if (formNumGens < 100 || formNumGens > 1000) {
      form_valid = false;
    }

    if (formPopSize < 100 || formPopSize > 1000) {
      form_valid = false;
    }

    if (formMutRate < 0 || formMutRate > 0.5) {
      form_valid = false;
    }

    if (formFitness < 0 || formFitness > 1) {
      form_valid = false;
    }

    if (form_valid) {
      $('.above-gen').html('&nbsp;');
      canRun = true;
      showStop();

      var n = 10;
      var i = 0;
      var text = $('.gen').text();

      // simulate 10 gens every 250ms
      var interval = setInterval(function() {
        if (i < num_gens && canRun) {
            mySim.runSimulation(n);
            drawD3(starting, mySim.population, config);
            $(".gen").html(parseInt(text) + i+10);
        } else {
          clearInterval(interval);
          canRun = true;
          showStart();
        }
        i += 10;
      }, 250);
    } else {
      $('.above-gen').html("Invalid settings");
    }
  });

  $('#stop').on('click', function() {
    canRun = false;
    showStart();
  });

  $('#myForm :input, .radio').on('click change', function() {
    getInputs();
    resetSim();
  });

  $('#reset').on('click', function() {
    canRun = false;
    getInputs();
    resetSim();
    showStart();
  });

  $("#back-to-top").click(function (event){
      event.preventDefault();
      $('html, body').animate({
          scrollTop: $("h1").offset().top - 120
      }, 300);
  });

  $("#nav-sim, #take-me-there").click(function (event){
      event.preventDefault();
      $('html, body').animate({
          scrollTop: $("#all-visualizations").offset().top - 90
      }, 300);
  });

  $("#nav-history").click(function (event){
      event.preventDefault();
      $('html, body').animate({
          scrollTop: $("#moth-history").offset().top - 90
      }, 300);
  });

  $("#nav-how").click(function (event){
      event.preventDefault();
      $('html, body').animate({
          scrollTop: $("#how-it-works").offset().top - 90
      }, 300);
  });

  function resetSim() {
    $(".gchart").remove();
    $(".env").remove();
    $(".gen").html('0');
    $('.above-gen').html('&nbsp;');

    initializeSim();

    drawD3(starting, mySim.population, config);
  }

  function makeConfig(obj={}) {
    var blackAndWhite = ["grey"];
    var color = ["red", "green", "blue"];
    var config = {
      max_env: MAX_ENV,
      population_size: $('#pop-size').val(),
      mutation_rate: $('#mut-rate').val(),
      fitness_advantage: $('#fitness').val(),
      moth: obj.moth || Moth,
      moth_type: ($('input[id=color]:checked').length > 0) ? color : blackAndWhite,
      matchmaker: obj.matchmaker || Matchmaker
    }

    if ($('input[id=uniform]:checked').length > 0) {
      config.uniform = true;
      config.env = (config.moth_type === color
                  ? { red: 165, green: 222, blue: 230 }
                  : { grey: 20 });
    } else {
      config.uniform = false;
      config.env = (config.moth_type === color
                  ? { red: randomNum(), green: randomNum(), blue: randomNum()}
                  : { grey: randomNum() });
    }

    return config;
  }

  function randomNum() {
    return Math.floor(Math.random() * (255 + 1));
  }

  function drawD3(starting, pop, config) {
    let chrom_vals = getChromVals(mySim.population);

    if (config.moth_type[0] === "grey") {
      // show only the bar chart or the 3D scatter plot, depending on color mode
      document.getElementById("container-for-3d").style.display = "none";
      document.getElementById("chart-container").style.display = "";

      chart.drawChart(starting, frequency(chrom_vals), Math.round(config.env["grey"]/12.75)*5);
      graphic.drawGraphic(chrom_vals, [config.env["grey"],config.env["grey"],config.env["grey"]]);
    } else {
      $('.legend').remove();
      document.getElementById("container-for-3d").style.display = "";
      document.getElementById("chart-container").style.display = "none";

      scatter.drawPlot(getChromVals(pop));
      graphic.drawGraphic(chrom_vals, [config.env["red"],config.env["green"],config.env["blue"]]);
    }
  }

  function initializeSim() {
    config = makeConfig();
    mySim = new Simulation(config);
    starting = frequency(getChromVals(mySim.population));
  }

  function getChromVals(population) {
    // return array of arrays. inner array contains numerical chromosome values
    // for either a single grey chromosome, or for red, green, blue chromosomes
    return population.map(function(m) {
      let a = [];
      if (Object.keys(m.value).length === 1) {
        a = [m.value["grey"], m.value["grey"], m.value["grey"]];
      } else {
        for (let type in m.value) {
          a.push(m.value[type]);
        }
      }
      return a;
    });
  }

  function getInputs() {
    // get all the inputs into an array
    var $inputs = $('#myForm :input');
    var values = {};

    // adjust settings according to the form data
    $inputs.each(function() {
        $(this.name).val($(this).val());
    });

    // set the number of generations to form input value
    num_gens = $('#num-gens').val();
  }

  function showStop() {
    document.getElementById('start').style.display = "none";
    document.getElementById('stop').style.display = "inline-block";
  }

  function showStart() {
    document.getElementById('start').style.display = "";
    document.getElementById('stop').style.display = "none";
  }

  function unselectButtons() {
    $('button').css("background-color", "");
    $('button').css("border", "");
  }

  function selectButton(this_button) {
    $(this_button).blur();
    $(this_button).css("background-color", "#aaa");
    $(this_button).css("border", "none");
  }
});

