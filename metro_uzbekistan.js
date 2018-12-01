var WALL = 0, performance = window.performance;
var estaciones = {
  '522': 'Shakhriston',// linea verde
  '722': 'Bodomzor',
  '922': 'Minor',
  '1122': 'Abdulla Kodiriy',
  '1322': 'Amir Temur Hiyoboni',
  '1522': 'Oybek',
  '1328': 'Buyuk Ipak Yuli', // linea roja
  '1326': 'Pushkin',
  '1324': 'Khamid Alimjan',
  '1320': 'Mustakillik Maydoni',
  '1318': 'Pakhtakor',
  '1316': 'Bunyodkor',
  '1314': 'Milliy Bog',
  '1312': 'Novza',
  '1310': 'Mirzo Ulugbek',
  '138': 'Chilonzor',
  '136': 'Olmazor',
  '518': 'Beruni', // linea azul
  '718': 'Tinchlik',
  '918': 'Chorsu',
  '1118': 'Gafur Gulom',
  '1518': 'Uzbekistan',
  '1520': 'Kosmonavtlar',
  '1524': 'Toshkent',
  '1526': 'Mashinasozlar',
  '1528': 'Dostlik'
}
$(function() {
  var $grid = $("#search_grid"),
      $selectWallFrequency = $("#selectWallFrequency")

  var opts = {
    wallFrequency: 0.1,
    gridSize: 30,
    debug: false,
    closest: false
  };

  var grid = new GraphSearch($grid, opts, astar.search);

  $("#btnGenerate").click(function() {
    grid.initialize()
  });

  $selectWallFrequency.change(function() {
    grid.setOption({wallFrequency: $(this).val()})
    grid.initialize();
  });

  $selectGridSize.change(function() {
    grid.setOption({gridSize: $(this).val()})
    grid.initialize();
  });

  $checkDebug.change(function() {
    grid.setOption({debug: $(this).is(":checked")})
  });

  $searchDiagonal.change(function() {
    var val = $(this).is(":checked")
    grid.setOption({diagonal: val})
    grid.graph.diagonal = val
  });

  $checkClosest.change(function() {
    grid.setOption({closest: $(this).is(":checked")});
  });

  $("#generateWeights").click( function () {
    if ($("#generateWeights").prop("checked")) {
      $('#weightsKey').slideDown();
    } else {
      $('#weightsKey').slideUp();
    }
  });

});

var css = { start: "start", finish: "finish", wall: "wall", active: "active" };

function GraphSearch($graph, options, implementation) {
  this.$graph = $graph;
  this.search = implementation;
  this.opts = $.extend({wallFrequency:0.1, debug:true, gridSize:30}, options);
  this.initialize();
}
GraphSearch.prototype.setOption = function(opt) {
  this.opts = $.extend(this.opts, opt);
  this.drawDebugInfo();
};
GraphSearch.prototype.initialize = function() {
  this.grid = []
  let self = this,
      nodes = [],
      $graph = this.$graph

  //relacionamos las estaciones con sus nombres
  let mapa = [
  //0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 0
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 1
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 2
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 3
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 4
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,// 5
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,18,0,0,0,0,0,0,0,// 6
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,// 7
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23,0,0,0,13,0,0,0,0,0,0,0,// 8
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,// 9
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,0,0,0,9,0,0,0,0,0,0,0,// 0
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,// 1
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,8.5,0,0,0,0,0,0,0,// 2
    0,0,0,0,0,0,1,36,1,11,1,15,1,18,1,10,1,23,1,14,1,15,1,13,1,15,1,15,1,0,// 3
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,22,0,0,0,0,0,0,0,// 4
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,19,1,12,1,15,1,37,1,16,1,0,// 5
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 6
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 7
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 8
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 9
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 0
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 1
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 2
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 3
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 4
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 5
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 6
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 7
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 8
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]// 9

  // Creamos la etiqueta span que se va a usar como Template para las paradas y caminos
  let $cellTemplate = $("<span />").addClass("grid_item"),
      startSet = false,
      posicion_mapa = 0

  // Recorremos las x filas
  for(let x = 0; x < this.opts.gridSize; x++) {
    let $row = $("<div class='clear' />"),
        nodeRow = [],
        gridRow = []

    // Recorremos las y columnas (aqui es donde se crean todas las paradas y los caminos usando la plantilla)
    for(let y = 0; y < this.opts.gridSize; y++) {
      let id = 'cell_'+x+'_'+y,
          $cell = $cellTemplate.clone()

      // calculamos el desplazamiento dentro del array mapa para encontrar nuestra parada o camino
      posicion_mapa = ((x)*this.opts.gridSize) + y

      $cell.attr('id', id).attr('x', x).attr('y', y).attr('coord', x+'_'+y)
      $row.append($cell)
      gridRow.push($cell)
      $cell.addClass('cell') // mirar porque de le agrega la clase cell ahora y no antes de meterlo en gridRow

      /*
      * Aqui es donde se guarda la distancia real (el peso)
      * este es el sitio en el que dependiendo de los parametros
      * de la ruta el peso cambia, por ejemplo, cuando se hace un
      * trasbordo (mirar en profundiad).
      */
      let peso_celda = mapa[posicion_mapa]

      if(peso_celda === 0) {
        nodeRow.push(WALL) // nodeRow parece ser el grafo que se le va a pasar al algoritmo
        $cell.addClass(css.wall)
      } else {
        $cell.attr("data-toggle", "tooltip")
        $cell.attr("data-placement", "top")
        if(!!estaciones[x+""+y]){
          $cell.attr("title", estaciones[x+""+y])
        }

        // color de cada linea
        $cell.addClass(colorLinea(x+""+y))

        // agregamos el peso de la celda al array de nodos (que se pasa en un futuro al algoritmo astar)
        nodeRow.push(peso_celda)

        // no me gusta eel funcionamiento de este if
        if (!startSet) {
          $cell.addClass(css.start) // mirar si se puede quitar esta linea
          startSet = true
        }
      }
    }

    $('[data-toggle="tooltip"]').tooltip()
    $graph.append($row)

    this.grid.push(gridRow)
    nodes.push(nodeRow)
  }
  this.graph = new Graph(nodes)

  // bind cell event, set start/wall positions
  this.$cells = $graph.find(".grid_item")
  this.$cells.click(function(){
    if ( $(this).attr('data-original-title') != ''){
      $("#select_destino").val($(this).attr("coord"))
      self.cellClicked($(this));
    }
  });

  /*
      **********************
      Control de los eventos
      **********************
  */

  $("#select_origen").change(function(event){
    //seleccionamos un origen en la lista desplegable
    var origenCoords = $("#select_origen :selected").val();

    $(".start" ).removeClass(css.start);
    if( $("[coord='"+origenCoords+"']").hasClass("lineaRoja") ){

      $("[coord='"+origenCoords+"']").removeClass("lineaRoja");
    }else if( $("[coord='"+origenCoords+"']").hasClass("lineaVerde") ) {

      $("[coord='"+origenCoords+"']").removeClass("lineaVerde");
    }else{

      $("[coord='"+origenCoords+"']").removeClass("lineaAmarilla");
    }

    $( "[coord='"+origenCoords+"']" ).addClass(css.start);
  });

  $("#select_destino").change(function(event){
    //seleccionamos un destino en la lista desplegable
    var destinoCoords = $("#select_destino :selected").val();

    $( ".end" ).removeClass(css.start);
    $( "[coord='"+destinoCoords+"']" ).addClass(css.finish);
    //llamar al seach
    self.cellClicked( $( "[coord='"+destinoCoords+"']" ) );
    $("#select_origen").val(destinoCoords);
  });



};
GraphSearch.prototype.cellClicked = function($end) {

  var end = this.nodeFromElement($end);

  if($end.hasClass(css.wall) || $end.hasClass(css.start)) {
    return;
  }

  this.$cells.removeClass(css.finish);
  $end.addClass("finish");
  var $start = this.$cells.filter("." + css.start),
    start = this.nodeFromElement($start);

  var sTime = performance ? performance.now() : new Date().getTime();

  var path = this.search(this.graph, start, end, {
    closest: this.opts.closest
  });
  var fTime = performance ? performance.now() : new Date().getTime(),
    duration = (fTime-sTime).toFixed(2);

  if(path.length === 0) {
    //$("#message").text("couldn't find a path (" + duration + "ms)");
    this.animateNoPath();
  }
  else {
    //$("#message").text("search took " + duration + "ms.");
    this.drawDebugInfo();
    this.animatePath(path);
    //montamos el array con el recorrido, con los nombres de las estaciones.
    var recorrido=[];
    inicio = $("#select_origen :selected").val().split("_");
    recorrido.push(estaciones[inicio[0]+""+inicio[1]]);

    for(var nodo=0;nodo<path.length;nodo++){
      try{    var origen=estaciones[path[nodo].x+""+path[nodo].y];
        var destino=estaciones[path[nodo+1].x+""+path[nodo+1].y];
      }catch(e){}
      //para cada nodo recorrido, obtenemos el nombre de la estacion a la que corresponde y lo guardamos en el array
      if( (origen !== "--")){

        recorrido.push(origen);
      }

    }
    //limpiamos la tabla
    $("#table_tbody").html("");
    //representamos el recorrido realizado en la tabla
    $("#table_tbody").append("<tr><th scope='row'></th><td><STRONG>"+recorrido[0]+"</STRONG></td><td><STRONG>"+recorrido[recorrido.length-1]+"</STRONG></td></tr>");
    for(var parada=0;parada<recorrido.length-1;parada++){
      var numero = parada+1;
      $("#table_tbody").append("<tr><th scope='row'>"+numero+"</th><td>"+recorrido[parada]+"</td><td>"+recorrido[parada+1]+"</td></tr>");
    }
    //marcar el destino como próximo origen
    $("#select_origen").val(end.x+"_"+end.y);
    $("#select_destino").val(0);

  }
};
GraphSearch.prototype.drawDebugInfo = function() {
  this.$cells.html(" ");
  var that = this;
  if(this.opts.debug) {
    that.$cells.each(function() {
      var node = that.nodeFromElement($(this)),
        debug = false;
      if (node.visited) {
        debug = "F: " + node.f + "<br />G: " + node.g + "<br />H: " + node.h;
      }

      if (debug) {
        $(this).html(debug);
      }
    });
  }
};
GraphSearch.prototype.nodeFromElement = function($cell) {
  return this.graph.grid[parseInt($cell.attr("x"))][parseInt($cell.attr("y"))];
};
GraphSearch.prototype.animateNoPath = function() {
  var $graph = this.$graph;
  var jiggle = function(lim, i) {
    if(i>=lim) { $graph.css("top", 0).css("left", 0); return; }
    if(!i) i=0;
    i++;
    $graph.css("top", Math.random()*6).css("left", Math.random()*6);
    setTimeout(function() {
      jiggle(lim, i);
    }, 5);
  };
  jiggle(15);
};
GraphSearch.prototype.animatePath = function(path) {
  var grid = this.grid,
    timeout = 1000 / grid.length,
    elementFromNode = function(node) {
      return grid[node.x][node.y];
    };

  var self = this;
  // will add start class if final
  var removeClass = function(path, i) {
    if(i >= path.length) { // finished removing path, set start positions
      return setStartClass(path, i);
    }
    elementFromNode(path[i]).removeClass(css.active);
    setTimeout(function() {
      removeClass(path, i+1);
    }, timeout*path[i].getCost());
  };
  var setStartClass = function(path, i) {
    if(i === path.length) {
      self.$graph.find("." + css.start).removeClass(css.start);
      elementFromNode(path[i-1]).addClass(css.start);
    }
  };
  var addClass = function(path, i) {
    if(i >= path.length) { // Finished showing path, now remove
      return removeClass(path, 0);
    }
    elementFromNode(path[i]).addClass(css.active);
    setTimeout(function() {
      addClass(path, i+1);
    }, timeout*path[i].getCost());
  };

  addClass(path, 0);

  var coords=$("#select_origen :selected").val().split("_");
  this.$graph.find("." + css.start).removeClass(css.start).addClass(colorLinea(coords[0]+""+coords[1]));
  this.$graph.find("." + css.finish).removeClass(css.finish).addClass(css.start);
};
//devuelve la clase a aplicar dependiendo de la linea de la que forme parte la estacion.
function colorLinea(estacion){
  let linea_roja = ['1328', '1326', '1324', '1320', '1318', '1316', '1314', '1312', '1310', '138', '136']
  let linea_azul = ['518', '718', '918', '1118', '1518', '1520', '1524', '1526', '1528']
  let linea_verde = ['522', '722', '922', '1122', '1322', '1522']
  if(jQuery.inArray(estacion, linea_roja) != '-1'){
    return "lineaRoja";
  }else if(jQuery.inArray(estacion, linea_azul) != '-1'){
    return "lineaAzul";
  }else if (jQuery.inArray(estacion, linea_verde) != '-1'){
    return "lineaVerde";
  } else {
    return "camino"
  }
}
