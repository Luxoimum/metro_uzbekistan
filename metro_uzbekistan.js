var WALL = 0, performance = window.performance;
var estaciones =
    {
        "718" : "Villa San Giovanni",
        "818" : "Precotto",
        "918" : "Gorla",
        "1018" : "Turro",
        "1118" : "Rovereto",
        "1218" : "Pasteur",
        "1318" : "Loreto", //roja-´verde
        "1418" : "--",
        "1518" : "--",
        "1618" : "--",
        "1718" : "Lima",
        "1818" : "Pta Venezia",
        "1817" : "Palestro",
        "1816" : "--",
        "1815" : "S Babila",
        "1813" : "--",
        "1812" : "--",
        "1811" : "Cordusio",
        "1810" : "Cairoli",
        "189" : "Cadorna",      //roja-verde
        "188" : "Conziliacione",
        "187" : "--",
        "186" : "--",
        "185" : "Pagano",       //bifurcacion-roja
        "145" : "Qt8",
        "155" : "Lotto fiera",
        "165" : "Amendola fiera",
        "175" : "Buonarotti",
        "195" : "Wagner",
        "205" : "De Angelis",
        "215" : "Gambara",
        "225" : "Bande Nere",
        "235" : "Primaticcio",
        "245" : "Inganni",
        "255" : "Biseglie",
        "920" : "Cascina Gobba",
        "1020" : "Creszenago",
        "1120" : "Cimiano",
        "1220" : "Udine",
        "1320" : "Lambrate FS",
        "1319" : "Piola",
        "1317" : "--",
        "1316" : "Calazzo",
        "1315" : "--",
        "1313" : "--", 
        "1312" : "Gioia",
        "1311" : "--",
        "1310" : "Garibaldi",
        "139" : "--", 
        "149" : "--",
        "159" : "Moscova",
        "169" : "--",
        "179" : "Lanza",
        "199" : "S.Ambrogio",
        "209" : "S.Angostino",
        "219" : "Pta.Genova FS",
        "229" : "Romolo",
        "239" : "Famagosta",
        "1014" : "Maciachini",
        "1114" : "Zara",
        "1214" : "Sondrio",
        "1314" : "Centrale",    //verde-amarilla
        "1414" : "Repubblica",
        "1514" : "Montenapoleone",
        "1614" : "Turati",
        "1714" : "Duomo",
        "1814" : "Duomo",       //roja-amarilla
        "1914" : "Missori",
        "2014" : "Crocetta",
        "2114" : "Porta Romana",
        "2214" : "Loddi Tibb"
    }
$(function() {

    var $grid = $("#search_grid"),
        $selectWallFrequency = $("#selectWallFrequency"),
        $selectGridSize = $("#selectGridSize"),
        $checkDebug = $("#checkDebug"),
        $searchDiagonal = $("#searchDiagonal"),
        $checkClosest = $("#checkClosest");

    var opts = {
        wallFrequency: $selectWallFrequency.val(),
        gridSize: $selectGridSize.val(),
        debug: $checkDebug.is("checked"),
        diagonal: $searchDiagonal.is("checked"),
        closest: $checkClosest.is("checked")
    };

    var grid = new GraphSearch($grid, opts, astar.search);

    $("#btnGenerate").click(function() {
        grid.initialize();
    });

    $selectWallFrequency.change(function() {
        grid.setOption({wallFrequency: $(this).val()});
        grid.initialize();
    });

    $selectGridSize.change(function() {
        grid.setOption({gridSize: $(this).val()});
        grid.initialize();
    });

    $checkDebug.change(function() {
        grid.setOption({debug: $(this).is(":checked")});
    });

    $searchDiagonal.change(function() {
        var val = $(this).is(":checked");
        grid.setOption({diagonal: val});
        grid.graph.diagonal = val;
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
    this.opts = $.extend({wallFrequency:0.1, debug:true, gridSize:10}, options);
    this.initialize();
}
GraphSearch.prototype.setOption = function(opt) {
    this.opts = $.extend(this.opts, opt);
    this.drawDebugInfo();
};
GraphSearch.prototype.initialize = function() {
    this.grid = [];
    var self = this,
        nodes = [],
        $graph = this.$graph;

    $graph.empty();
    //relacionamos las estaciones con sus nombres
              //1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0
    var mapa = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 1
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 2
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 3
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 4
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 5
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,// 6
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,// 7
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,// 8
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,// 9 
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,// 0
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,// 1
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,// 2
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,// 3
                0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,// 4
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,// 5
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,// 6
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
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,// 9 
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

    this.opts.gridSize=30;
    var cellWidth = ($graph.width()/this.opts.gridSize)-2,  // -2 for border
        cellHeight = ($graph.height()/this.opts.gridSize)-2,
        $cellTemplate = $("<span />").addClass("grid_item").width(cellWidth).height(cellHeight),
        startSet = false;

    for(var x = 0; x < this.opts.gridSize; x++) {
        var $row = $("<div class='clear' />"),
            nodeRow = [],
            gridRow = [];

        for(var y = 0; y < this.opts.gridSize; y++) {
            var id = "cell_"+x+"_"+y,
                $cell = $cellTemplate.clone();
            $cell.attr("id", id).attr("x", x).attr("y", y).attr("coord",x+"_"+y);
            
            $row.append($cell);
            gridRow.push($cell);
            if(x>0){
                var posicion_mapa = ((x-1)*this.opts.gridSize)+y;
            }else{
                var posicion_mapa = ((x)*this.opts.gridSize)+y;
            }
            $cell.addClass('cell');
            var peso_celda = mapa[posicion_mapa];
            if(peso_celda === 0) {
                nodeRow.push(WALL);
                $cell.addClass(css.wall);
            } else  {
//                $cell.attr("title",estaciones[x+""+y]);
                $cell.attr("data-toggle","tooltip");
                $cell.attr("data-placement","top");
                if(estaciones[x+""+y] !== "--"){
                    $cell.attr("title",estaciones[x+""+y]);
                }
                //otorgamos el color de cada linea
                $cell.addClass(colorLinea(x+""+y));
                nodeRow.push(peso_celda);
                $cell.addClass('weight' + peso_celda);
                
                if (!startSet) {

                    $cell.addClass(css.start);
                    startSet = true;
                }
            }
        }
        $('[data-toggle="tooltip"]').tooltip();
        $graph.append($row);

        this.grid.push(gridRow);
        nodes.push(nodeRow);
    }

    this.graph = new Graph(nodes);

    // bind cell event, set start/wall positions
    this.$cells = $graph.find(".grid_item");
    this.$cells.click(function(){
        if ( $(this).attr('data-original-title') != ''){
            
            $("#select_destino").val($(this).attr("coord"));
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
    console.log($start, start)
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
    //console.log(estacion);
    var linea_roja = ["185","187","1810","1812","1818","1618","1518","1418","1218","718","818","918","1018","1118","1318","1718","1817","1816","1815",
                      "1814","1813","1811","189","188","175","165","155","145","195","205","215","225","235","245","255","186"];
    var linea_amarilla = ["714","814","914","1014","1114","1214","1314","1414","1514","1614","1714","1914","2014","2114","2214"];
    
    if(jQuery.inArray(estacion, linea_roja) != '-1'){

        return "lineaRoja";
    }else if(jQuery.inArray(estacion, linea_amarilla) != '-1'){
        
        return "lineaAmarilla";
    }else{
        
        return "lineaVerde";
    }
}
