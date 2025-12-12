import { BrowserWindow, ipcMain } from 'electron';
import os from 'os';
import express from 'express';
import bodyParser from 'body-parser';
const mdns = require('mdns-js');
import { getAllSyncData, getSyncDataForUser } from './database';
const fetch = require('node-fetch');

// Configuration
const BASE_P2P_SERVER_PORT = 3123;
const MAX_PORT_ATTEMPTS = 10;
const P2P_SYNC_INTERVAL_MS = 300000; // 5 minutes
const MDNS_SERVICE_TYPE = 'mi-electron-sync';
const MDNS_DISCOVERY_PORT = 3000; // This port is used for mDNS discovery, not the Express server

// State variables
let peersActivos: { name: string; ip: string; port: number; lastSeen: number }[] = [];
let mainWindow: BrowserWindow | null = null;
let db: any = null;
let actualServerPort: number | null = null; // The port our Express server actually binds to

// --- UTILITY FUNCTIONS ---
function getLocalIp(): string | null {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (iface) {
      for (const alias of iface) {
        if (alias.family === 'IPv4' && !alias.internal) {
          return alias.address;
        }
      }
    }
  }
  return null;
}

// --- MODULE 1: DISCOVERY AND SERVER ---

// mDNS Advertisement (moved out to be called after server port is known)
let mdnsAdvertisement: any = null;
function startMdnsAdvertisement(port: number) {
  if (mdnsAdvertisement) {
    mdnsAdvertisement.stop();
  }
  const localIp = getLocalIp();
  if (localIp) {
    mdnsAdvertisement = mdns.createAdvertisement(mdns.tcp(MDNS_SERVICE_TYPE), MDNS_DISCOVERY_PORT, {
      name: os.hostname(),
      txtRecord: {
        app: 'mini-agesco-crm',
        // Advertise the actual HTTP server port in the TXT record
        http_port: port.toString() 
      }
    });
    mdnsAdvertisement.start();
    console.log(`mDNS service '${MDNS_SERVICE_TYPE}' advertised on port ${MDNS_DISCOVERY_PORT} with HTTP port ${port}.`);
  }
}

// mDNS Discovery
function startMdnsDiscovery() {
  const browser = mdns.createBrowser(mdns.tcp(MDNS_SERVICE_TYPE));

  browser.on('ready', () => {
    console.log('mDNS browser ready for discovery...');
    browser.discover();
  });

  browser.on('update', (data: any) => {
    // console.log('mDNS service updated:', data);
    const peerName = data.host;
    const ip = data.addresses[0];
    const advertisedHttpPort = data.txt && data.txt.http_port ? parseInt(data.txt.http_port) : null;

    if (peerName && ip && advertisedHttpPort) {
      // Don't add self to the peer list
      if (ip === getLocalIp() && advertisedHttpPort === actualServerPort) {
        return;
      }

      const existingPeerIndex = peersActivos.findIndex(p => p.name === peerName);
      if (existingPeerIndex !== -1) {
        // Update existing peer
        peersActivos[existingPeerIndex] = {
          name: peerName,
          ip: ip,
          port: advertisedHttpPort,
          lastSeen: Date.now()
        };
      } else {
        // Add new peer
        peersActivos.push({ name: peerName, ip, port: advertisedHttpPort, lastSeen: Date.now() });
      }
      // console.log('Active peers:', peersActivos);
    }
    // Clean up old peers (e.g., if they went offline) - could be a separate scheduled task
    peersActivos = peersActivos.filter(p => (Date.now() - p.lastSeen) < (P2P_SYNC_INTERVAL_MS * 2)); // Keep peers seen within 10 minutes
  });
}

// Express Server with dynamic port finding
function findPortAndStartExpressServer(appInstance: express.Application, currentPort: number, attempts: number) {
  if (attempts >= MAX_PORT_ATTEMPTS) {
    console.error(`Failed to bind P2P server after ${MAX_PORT_ATTEMPTS} attempts.`);
    return;
  }

  const server = appInstance.listen(currentPort, () => {
    actualServerPort = currentPort;
    console.log(`P2P server listening on port ${actualServerPort}`);
    // Start mDNS advertisement AFTER successfully binding to a port
    startMdnsAdvertisement(actualServerPort); 
  }).on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${currentPort} is busy, trying next one... (Attempt ${attempts + 1}/${MAX_PORT_ATTEMPTS})`);
      findPortAndStartExpressServer(appInstance, currentPort + 1, attempts + 1);
    } else {
      console.error('P2P server error:', err);
    }
  });
}

async function getCurrentUser(): Promise<any | null> {
    return new Promise((resolve) => {
        if (!mainWindow) {
            resolve(null);
            return;
        }

        // Unique channel for the response
        const responseChannel = 'get-current-user-response';

        // Listen for the response
        ipcMain.once(responseChannel, (event, user) => {
            resolve(user);
        });

        // Send the request to the renderer
        mainWindow.webContents.send('get-current-user-request', responseChannel);

        // Timeout to prevent hanging forever
        setTimeout(() => {
            resolve(null);
        }, 5000); // 5 second timeout
    });
}

async function obtener_data_para_sync() {
    const user = await getCurrentUser();
    console.log('p2p.ts: getCurrentUser returned:', user); // DEBUG
    if (user && user.role) {
        console.log(`Syncing data for user: ${user.email} with role: ${user.role}`);
        return await getSyncDataForUser(user);
    }
    console.log('Syncing data for all users (fallback).');
    return await getAllSyncData();
}

function setupExpressServer() {
  const app = express();
  app.use(bodyParser.json());

  app.post('/sync/request', async (req, res) => {
    const dataDelPeer = req.body;
    
    if (mainWindow) {
      mainWindow.webContents.send('p2p-data-in', dataDelPeer);
    }

    const dataLocal = await obtener_data_para_sync();
    res.json(dataLocal);
  });

  findPortAndStartExpressServer(app, BASE_P2P_SERVER_PORT, 0);
}

// --- MODULE 2: CLIENT AND SCHEDULED SYNC ---

async function iniciarSincronizacionP2P() {
  console.log('Starting P2P sync cycle...');
  const dataLocal = await obtener_data_para_sync();

  // Filter out self and potentially dead peers (though mDNS cleanup helps)
  const peersToSync = peersActivos.filter(peer => 
    peer.ip !== getLocalIp() || peer.port !== actualServerPort
  );

  for (const peer of peersToSync) {
    console.log(`Syncing with peer: ${peer.name} at http://${peer.ip}:${peer.port}/sync/request`);
    try {
      const response = await fetch(`http://${peer.ip}:${peer.port}/sync/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataLocal)
      });
      const dataDelPeer = await response.json();
      
      if (mainWindow) {
        mainWindow.webContents.send('p2p-data-in', dataDelPeer);
      }
      // Update lastSeen for successful sync
      const peerIndex = peersActivos.findIndex(p => p.name === peer.name);
      if (peerIndex !== -1) {
        peersActivos[peerIndex].lastSeen = Date.now();
      }
    } catch (error) {
      console.error(`Failed to sync with peer ${peer.name}:`, error);
      // Remove peer if unreachable? mDNS will re-add if it comes back online
      peersActivos = peersActivos.filter(p => p.name !== peer.name);
    }
  }
}

// --- INITIALIZATION ---
export function startP2PServer(win: BrowserWindow, database: any) {
  mainWindow = win;
  db = database;
  startMdnsDiscovery(); // Start discovery right away
  setupExpressServer(); // Start Express server with dynamic port finding
  setInterval(iniciarSincronizacionP2P, P2P_SYNC_INTERVAL_MS);
  console.log('P2P synchronization scheduled.');
}