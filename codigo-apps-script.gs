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

// Aviso por WhatsApp de cada venta nueva. Dejar vacío para desactivarlo.
var AVISO_WHATSAPP = 'https://test1-n8n.w9bbus.easypanel.host/webhook/CHAVIEL-VENTA';

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

    avisarVenta_(d, link);

    return json_({ ok: true, pedido: d.pedido });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/** Manda el aviso de venta al WhatsApp del dueño. Si falla, el pedido igual queda guardado. */
function avisarVenta_(d, link) {
  if (!AVISO_WHATSAPP) return;
  try {
    UrlFetchApp.fetch(AVISO_WHATSAPP, {
      method: 'post',
      contentType: 'application/json; charset=utf-8',
      muteHttpExceptions: true,
      payload: JSON.stringify({
        pedido: d.pedido,
        nombre: d.nombre,
        telefono: d.telefono,
        prendas: d.prendas,
        skus: d.skus || [],
        total: d.total,
        entrega: d.entrega,
        domicilio: d.domicilio,
        localidad: d.localidad,
        provincia: d.provincia,
        comprobante: link
      })
    });
  } catch (err) {
    console.error('No se pudo avisar la venta por WhatsApp: ' + err);
  }
}
