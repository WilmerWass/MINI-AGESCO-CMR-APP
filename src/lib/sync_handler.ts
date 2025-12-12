// src/lib/sync_handler.ts

/**
 * Compares timestamps and applies updates or inserts for a given table.
 * @param localGetByIdFn Function to get a local record by ID (e.g., window.api.getClienteById).
 * @param localUpdateFn Function to update a local record (e.g., window.api.updateCliente).
 * @param localAddFn Function to add a new local record (e.g., window.api.addCliente).
 * @param peerRecords The array of records received from the peer.
 */
async function syncTable(
  localGetByIdFn: (id: string) => Promise<any | null>,
  localUpdateFn: (id: string, data: any) => Promise<void>,
  localAddFn: (data: any) => Promise<any>,
  peerRecords: any[]
) {
  if (!peerRecords || !Array.isArray(peerRecords)) {
    return; // No data to sync for this table
  }
  console.log('syncTable: processing', peerRecords.length, 'records'); // DEBUG

  for (const peerRecord of peerRecords) {
    console.log('syncTable: processing record:', peerRecord); // DEBUG
    if (!peerRecord.id || !peerRecord.updated_at) {
      console.warn('Sync handler: skipping record without id or updated_at', peerRecord);
      continue;
    }

    const localRecord = await localGetByIdFn(peerRecord.id);

    if (localRecord) {
      // Record exists, compare timestamps
      const localDate = new Date(localRecord.updated_at);
      const peerDate = new Date(peerRecord.updated_at);

      if (peerDate > localDate) {
        console.log(`Sync: Updating local record ${peerRecord.id} from table.`);
        // Peer's record is newer, update local record
        await localUpdateFn(peerRecord.id, peerRecord);
      }
    } else {
      // Record does not exist locally, insert it
      console.log(`Sync: Inserting new record ${peerRecord.id} into table.`);
      await localAddFn(peerRecord);
    }
  }
}

/**
 * Main function to handle incoming P2P data and resolve conflicts.
 * @param dataDelPeer The entire data object received from a peer.
 */
export async function aplicarDatosRecibidos(dataDelPeer: any) {
  if (!dataDelPeer) {
    console.log('Sync handler: Received empty data from peer.');
    return;
  }

  console.log('Sync handler: Applying data received from peer...');

  // Sync each table
  await syncTable(
    window.api.getClienteById,
    window.api.updateCliente,
    window.api.addCliente,
    dataDelPeer.clientes
  );

  await syncTable(
    window.api.getAgenteById,
    window.api.updateAgente,
    window.api.addAgente,
    dataDelPeer.agentes
  );

  await syncTable(
    window.api.getAvisoById,
    window.api.updateAviso,
    window.api.addAviso,
    dataDelPeer.avisos
  );

  await syncTable(
    window.api.getEnlaceById,
    window.api.updateEnlace,
    window.api.addEnlace,
    dataDelPeer.enlaces
  );

  await syncTable(
    window.api.getUsuarioById,
    window.api.updateUsuario,
    window.api.addUsuario,
    dataDelPeer.usuarios
  );

  console.log('Sync handler: Finished applying peer data.');
}
