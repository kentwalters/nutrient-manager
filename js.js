var geoserverBaseURL = 'http://sksoilgis1.usask.ca/geoserver/sksoil/wms';

var surfaceTextureTif = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        crossOrigin: 'anonymous',
        ratio: 1,
        url: geoserverBaseURL,
        params: {
            'FORMAT': 'image/png',
            'VERSION': '1.1.1',  
            STYLES: '',
            LAYERS: 'sksoil:SUR_TEX_KNN'
        }
    })
});

var PmTif = new ol.layer.Image({
  source: new ol.source.ImageWMS({
    crossOrigin: 'anonymous',
    ratio: 1,
    url: geoserverBaseURL,
    params: {'FORMAT': 'image/png',
             'VERSION': '1.1.1',  
          STYLES: '',
          LAYERS: 'sksoil:PM_ANN',
    }
  })
});

var SolumDepthTif = new ol.layer.Image({
    source: new ol.source.ImageWMS({
      crossOrigin: 'anonymous',
        ratio: 1,
        url: geoserverBaseURL,
        params: {
            'FORMAT': 'image/png',
            'VERSION': '1.1.1',  
            STYLES: '',
            LAYERS: 'sksoil:SOLUM_DEPTH_LMT'
        }
    })
});

var SubGroupTif = new ol.layer.Image({
    source: new ol.source.ImageWMS({
      crossOrigin: 'anonymous',
        ratio: 1,
        url: geoserverBaseURL,
        params: {
            'FORMAT': 'image/png',
            'VERSION': '1.1.1',  
            STYLES: '',
            LAYERS: 'sksoil:S_GROUP_LMT'
        }
    })
});

var ADepthTif = new ol.layer.Image({
    source: new ol.source.ImageWMS({
      crossOrigin: 'anonymous',
        ratio: 1,
        url: geoserverBaseURL,
        params: {
            'FORMAT': 'image/png',
            'VERSION': '1.1.1',  
            STYLES: '',
            LAYERS: 'sksoil:A_DEPTH_SVM'
        }
    })
});

var landWaterMask = new ol.layer.Image({
    source: new ol.source.ImageWMS({
      crossOrigin: 'anonymous',
        ratio: 1,
        url: geoserverBaseURL,
        params: {
            'FORMAT': 'image/png',
            'VERSION': '1.1.1',  
            STYLES: '',
            LAYERS: 'sksoil:CB_LandWaterMask'
        }
    })
});

var nutrientPotentialTif = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        ratio: 1,
        url: 'http://sksoilgis1.usask.ca:80/geoserver/sksoil/wms',
        params: {
            'FORMAT': 'image/png',
            'VERSION': '1.1.1',
            STYLES: '',
            LAYERS: 'sksoil:sgrp-pm',
        }
    })
});

var tifs = [surfaceTextureTif, PmTif, SolumDepthTif, SubGroupTif, ADepthTif, nutrientPotentialTif];

var bing = new ol.source.BingMaps({
  key: 'AjuiTz-K1RGALYtpTD5ikQXwQjDIkKGqaxBh-cNJA8BxPcdzxLyTQ4c-RInRBTE7',
  imagerySet: 'Aerial'
});

var map = new ol.Map({
  layers: [
    new ol.layer.Tile({ source: bing }),
    surfaceTextureTif,
    PmTif,
    SolumDepthTif,
    SubGroupTif,
    ADepthTif,
    nutrientPotentialTif,
    landWaterMask
  ],
  target: 'map',
  view: new ol.View({
    center: ol.proj.fromLonLat([-106.42,50.728]),
    zoom: 14,
    minZoom: 13,
    maxZoom: 18
  })
});

var radios = $("#myButtons :input");

var slider = document.getElementById("moisture-slider");

var selectedTif = 'sksoil:SUR_TEX_KNN';

// Object to pass to updateLegendGraphic()
function legendUrlObject(layer, style) {
    this.layer = layer;
    this.style = style;
}

slider.onchange = function() {
    // If you're sliding the slider, you must be interested in the nutrient response layer; so switch to it first
    $("input:radio:last").prop("checked", true).trigger("change");

    var val = parseInt(this.value);
    var newStyle;

    // Either the dry, med, or wet style
    switch (val) {
        case 1:
            newStyle = 'nutrient_dry_sld';
            break;
        case 2:
            newStyle = 'nutrient_med_sld';
            break;
        case 3:
            newStyle = 'nutrient_wet_sld';
            break;
    }

    // Update the actual map layer with the new style
    nutrientPotentialTif.getSource().updateParams({'STYLES':newStyle});

    // Update the legend with the new style
    updateLegendGraphic( new legendUrlObject(selectedTif, newStyle) );
};

radios.change(function() {
    tifs.forEach( (tif, index) => {
      tifs[index].setVisible( this.id == index);
    });

    selectedTif = tifs[this.id].values_.source.params_.LAYERS;

    updateLegendGraphic( new legendUrlObject(selectedTif, null) );

    changeSalinityWarningVisibility( selectedTif == 'sksoil:sgrp-pm' );
});

function changeSalinityWarningVisibility(condition) {
    var visibility;

    condition ? visibility = 'visible' : visibility = 'hidden';

    document.getElementById('salinity-warning').style.visibility = visibility;
}

// legendUrlObject is a legendUrlObject specified by the object constructor above
function updateLegendGraphic(legendUrlObject) {
    var src = 'http://sksoilgis1.usask.ca/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LEGEND_OPTIONS=forceLabels:on;fontName:Arial';

    if (legendUrlObject.layer) {
        src += "&LAYER=" + legendUrlObject.layer;
    }

    if (legendUrlObject.style) {
        src += "&STYLE=" + legendUrlObject.style;
    }

    document.getElementById("legend-img").src = src;
}

// Export tif button
document.getElementById('export-tiff').addEventListener('click', function() {
  var data = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><GetCoverage version=\"1.1.1\" service=\"WCS\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"http://www.opengis.net/wcs/1.1.1\" xmlns:ows=\"http://www.opengis.net/ows/1.1\" xmlns:gml=\"http://www.opengis.net/gml\" xmlns:ogc=\"http://www.opengis.net/ogc\" xsi:schemaLocation=\"http://www.opengis.net/wcs/1.1.1 http://schemas.opengis.net/wcs/1.1.1/wcsAll.xsd\">\n  <ows:Identifier>"
    + selectedTif +"</ows:Identifier>\n  <DomainSubset>\n    <ows:BoundingBox crs=\"urn:ogc:def:crs:EPSG::26913\">\n      <ows:LowerCorner>398953.558558248 5619370.144252018</ows:LowerCorner>\n      <ows:UpperCorner>400583.558558248 5621810.144252018</ows:UpperCorner>\n    </ows:BoundingBox>\n  </DomainSubset>\n  <Output store=\"true\" format=\"image/tiff\">\n    <GridCRS>\n      <GridBaseCRS>urn:ogc:def:crs:EPSG::26913</GridBaseCRS>\n      <GridType>urn:ogc:def:method:WCS:1.1:2dSimpleGrid</GridType>\n      <GridOffsets>5.0 -5.0</GridOffsets>\n      <GridCS>urn:ogc:def:cs:OGC:0.0:Grid2dSquareCS</GridCS>\n    </GridCRS>\n  </Output>\n</GetCoverage>";

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
        var tifUrl = this.responseXML.getElementsByTagName('ows:Reference')[0].getAttribute('xlink:href');
        tifUrl ? window.open(tifUrl) : alert("Error downloading GeoTIFF");
    }
  });

  xhr.open("POST", "http://sksoilgis1.usask.ca/geoserver/sksoil/wcs?");

  xhr.send(data);
});


// Export png button
document.getElementById('export-png').addEventListener('click', function() {
  var date = new Date();

  map.once('postcompose', function(event) {
    var canvas = event.context.canvas;
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(canvas.msToBlob(), 'SKSIS Export - ' + date.getTime());
    } else {
      canvas.toBlob(function(blob) {
        saveAs(blob, 'SKSIS Export - ' + date.getTime());
      });
    }
  });

  map.renderSync();
});
