import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import {
  initializeDatabase,
  getClientes, getClienteById, addCliente, updateCliente, deleteCliente,
  getAgentes, getAgenteById, addAgente, updateAgente, deleteAgente,
  getAvisos, getAvisoById, addAviso, updateAviso, deleteAviso,
  getEnlaces, getEnlaceById, addEnlace, updateEnlace, deleteEnlace,
  getUsuarios, getUsuarioById, addUsuario, updateUsuario, deleteUsuario, getUsuarioByEmail,
  getDashboardData
} from './database';
import { startP2PServer } from './p2p';

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── frontend
// │ └── main
// │   └── index.js
// └── package.json
process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.DIST, '../public')
  : process.env.DIST;

let win: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

const createWindow = () => {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // Enable Node.js integration for preload script
      nodeIntegration: false, // For security, keep false
      contextIsolation: true, // For security, keep true
    },
  });

  // Test active push message to Renderer-Process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'));
  }

}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(async () => {
  await initializeDatabase();
  createWindow();

  startP2PServer(win);

  // IPC Main handler for Login
  ipcMain.handle('login', async (event, { email, password }) => {
    try {
      const user = await getUsuarioByEmail(email);
      if (!user) {
        return { success: false, message: 'El correo electrónico no está registrado.' };
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { success: false, message: 'La contraseña es incorrecta.' };
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, _id, ...userWithoutPassword } = user;
      const userToFrontend = { ...userWithoutPassword, id: _id.toHexString() };
      return { success: true, user: userToFrontend };
      
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: `Error en el inicio de sesión: ${error.message}` };
    }
  });

  // IPC Main handlers for Client operations
  ipcMain.handle('get-clientes', async (event, asesorId) => getClientes( asesorId));
  ipcMain.handle('get-cliente-by-id', async (event, id) => getClienteById(id));
  ipcMain.handle('add-cliente', async (event, cliente) => addCliente(cliente));
  ipcMain.handle('update-cliente', async (event, id, updates) => updateCliente(id, updates));
  ipcMain.handle('delete-cliente', async (event, id) => deleteCliente(id));

  // IPC Main handlers for Agentes operations
  ipcMain.handle('get-agentes', async (event, asesorId) => getAgentes(asesorId));
  ipcMain.handle('get-agente-by-id', async (event, id) => getAgenteById(id));
  ipcMain.handle('add-agente', async (event, agente) => addAgente(agente));
  ipcMain.handle('update-agente', async (event, id, updates) => updateAgente(id, updates));
  ipcMain.handle('delete-agente', async (event, id) => deleteAgente(id));

  // IPC Main handlers for Avisos operations
  ipcMain.handle('get-avisos', async (event, user) => getAvisos(user));
  ipcMain.handle('get-aviso-by-id', async (event, id) => getAvisoById(id));
  ipcMain.handle('add-aviso', async (event, aviso) => addAviso(aviso));
  ipcMain.handle('update-aviso', async (event, id, updates) => updateAviso(id, updates));
  ipcMain.handle('delete-aviso', async (event, id) => deleteAviso(id));

  // IPC Main handlers for Enlaces operations
  ipcMain.handle('get-enlaces', async (event, asesorId) => getEnlaces(asesorId));
  ipcMain.handle('get-enlace-by-id', async (event, id) => getEnlaceById(id));
  ipcMain.handle('add-enlace', async (event, enlace) => addEnlace(enlace));
  ipcMain.handle('update-enlace', async (event, id, updates) => updateEnlace(id, updates));
  ipcMain.handle('delete-enlace', async (event, id) => deleteEnlace(id));

  // IPC Main handler for Dashboard
  ipcMain.handle('get-dashboard-data', async (event, period) => {
    try {
      const data = await getDashboardData(period);
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return { success: false, message: `Error al obtener datos del informe: ${error.message}` };
    }
  });

  // IPC Main handlers for Usuarios operations
  ipcMain.handle('get-usuarios', async (event) => getUsuarios());
  ipcMain.handle('get-usuario-by-id', async (event, id) => getUsuarioById(id));
  ipcMain.handle('add-usuario', async (event, usuario) => {
    try {
      const existingUser = await getUsuarioByEmail(usuario.email);
      if (existingUser) {
        return { success: false, message: 'El correo electrónico ya está registrado.' };
      }
      const newUserId = await addUsuario(usuario);
      return { success: true, userId: newUserId };
    } catch (error) {
      console.error('Error adding user:', error);
      return { success: false, message: `No se pudo crear el usuario: ${error.message}` };
    }
  });

  ipcMain.handle('update-usuario', async (event, id, updates) => updateUsuario(id, updates));

  ipcMain.handle('delete-usuario', async (event, id) => deleteUsuario(id));

  // IPC Main handler for saving avatar
  ipcMain.handle('save-avatar', async (event, filePath) => {
    try {
      const avatarsDir = path.join(process.cwd(), 'public', 'avatars');
      if (!fs.existsSync(avatarsDir)) {
        fs.mkdirSync(avatarsDir, { recursive: true });
      }
      const uniqueFilename = `avatar-${Date.now()}${path.extname(filePath)}`;
      const destPath = path.join(avatarsDir, uniqueFilename);
      fs.copyFileSync(filePath, destPath);
      return `/avatars/${uniqueFilename}`;
    } catch (error) {
      console.error('Failed to save avatar:', error);
      return null;
    }
  });
});
