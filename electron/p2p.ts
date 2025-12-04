import { BrowserWindow } from 'electron';
import os from 'os';
import express from 'express';
import bodyParser from 'body-parser';
const mdns = require('mdns-js');
import { getAllSyncData } from './database';
const fetch = require('node-fetch');

let peersActivos: { name: string; ip: string; port: number }[] = [];
let mainWindow: BrowserWindow | null = null;
let db: any = null;

// --- MODULE 1: DISCOVERY AND SERVER ---

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

function startMdnsDiscovery() {
  const serviceType = 'mi-electron-sync';
  
  const browser = mdns.createBrowser(mdns.tcp(serviceType));

  browser.on('ready', () => {
    console.log('mDNS browser ready for discovery...');
    browser.discover();
  });

  browser.on('update', (data: any) => {
    console.log('mDNS service updated:', data);
    const peerName = data.host;
    const ip = data.addresses[0];
    const port = data.port;

    if (peerName && ip && port) {
      const existingPeer = peersActivos.find(p => p.name === peerName);
      if (existingPeer) {
        existingPeer.ip = ip;
        // Use the fixed port for the server, not the discovery port
        existingPeer.port = 3123; 
      } else {
        peersActivos.push({ name: peerName, ip, port: 3123 });
      }
      console.log('Active peers:', peersActivos);
    }
  });

  const localIp = getLocalIp();
  if (localIp) {
    const ad = mdns.createAdvertisement(mdns.tcp(serviceType), 3000, {
      name: os.hostname(),
      txtRecord: {
        app: 'mini-agesco-crm'
      }
    });
    ad.start();
    console.log(`mDNS service '${serviceType}' advertised on port 3000.`);
  }
}

function startExpressServer() {
  const app = express();
  app.use(bodyParser.json());

  app.post('/sync/request', async (req, res) => {
    const dataDelPeer = req.body;
    
    if (mainWindow) {
      mainWindow.webContents.send('p2p-data-in', dataDelPeer);
    }

    const dataLocal = await obtener_data_sqlite_para_respuesta();
    res.json(dataLocal);
  });

  app.listen(3123, () => {
    console.log('P2P server listening on port 3123');
  });
}

async function obtener_data_sqlite_para_respuesta() {
  if (!db) return {};
  return await getAllSyncData(db);
}

// --- MODULE 2: CLIENT AND SCHEDULED SYNC ---

async function iniciarSincronizacionP2P() {
  console.log('Starting P2P sync cycle...');
  const dataLocal = await obtener_data_sqlite_para_peticion();

  for (const peer of peersActivos) {
    if (peer.ip === getLocalIp()) continue;

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
    } catch (error) {
      console.error(`Failed to sync with peer ${peer.name}:`, error);
      peersActivos = peersActivos.filter(p => p.name !== peer.name);
    }
  }
}

async function obtener_data_sqlite_para_peticion() {
    if (!db) return {};
    return await getAllSyncData(db);
}

// --- INITIALIZATION ---
export function startP2PServer(win: BrowserWindow, database: any) {
  mainWindow = win;
  db = database;
  startMdnsDiscovery();
  startExpressServer();
  setInterval(iniciarSincronizacionP2P, 300000);
  console.log('P2P synchronization scheduled every 5 minutes.');
}
