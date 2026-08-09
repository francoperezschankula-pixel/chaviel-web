/**
 * CHAVIEL SHOPP — backend gratis con Google Apps Script.
 * Guarda cada pedido en una planilla, sube el comprobante a Drive
 * y marca las prendas como vendidas para TODOS los que entren a la web.
 *
 * Instrucciones completas en SETUP.md
 */

// Pegar acá el ID de la carpeta de Drive donde van los comprobantes.
// Es lo que aparece en la URL de la carpeta: drive.google.com/drive/folders/ESTO_DE_ACA
var CARPETA_COMPROBANTES = 'PEGAR_ID_DE_CARPETA';

function hoja_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var h = ss.getSheetByName('Pedidos');
  if (!h) {
    h = ss.insertSheet('Pedidos');
    h.appendRow(['Fecha', 'Pedido', 'Nombre', 'Teléfono', 'Prendas', 'SKUs',
                 'Total', 'Entrega', 'Domicilio', 'Localidad', 'CP', 'Provincia',
                 'Observaciones', 'Comprobante', 'Estado']);
  }
  return h;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** GET: devuelve los SKU vendidos → { ok:true, vendidos:["SKU_001"] } */
function doGet(e) {
  var h = hoja_();
  var filas = h.getDataRange().getValues();
  var vendidos = [];
  for (var i = 1; i < filas.length; i++) {
    var estado = String(filas[i][14] || '').toLowerCase();
    if (estado === 'cancelado') continue;
    String(filas[i][5] || '').split(',').forEach(function (sku) {
      sku = sku.trim();
      if (sku && vendidos.indexOf(sku) === -1) vendidos.push(sku);
    });
  }
  return json_({ ok: true, vendidos: vendidos });
}

/** POST: recibe el pedido con el comprobante en base64 */
function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var link = '';

    if (d.comprobante && d.comprobante.datos) {
      var blob = Utilities.newBlob(
        Utilities.base64Decode(d.comprobante.datos),
        d.comprobante.tipo,
        d.pedido + ' - ' + d.comprobante.nombre
      );
      var archivo = DriveApp.getFolderById(CARPETA_COMPROBANTES).createFile(blob);
      archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      link = archivo.getUrl();
    }

    hoja_().appendRow([
      new Date(), d.pedido, d.nombre, "'" + d.telefono, d.prendas,
      (d.skus || []).join(', '), d.total, d.entrega, d.domicilio, d.localidad,
      d.codigo_postal, d.provincia, d.observaciones, link, 'nuevo'
    ]);

    return json_({ ok: true, pedido: d.pedido });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}
