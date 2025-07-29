const express = require('express');
const cors = require('cors');
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Variável global para armazenar a conexão do WhatsApp
let sock = null;
let isConnected = false;

// Função para inicializar a conexão do WhatsApp
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    sock = makeWASocket({
        auth: state,
        defaultQueryTimeoutMs: undefined,
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n📱 QR Code gerado! Escaneie com o WhatsApp:');
            console.log('='.repeat(50));

            try {
                // Gerar QR Code como texto no terminal
                const qrText = await qrcode.toString(qr, {
                    type: 'terminal',
                    small: true
                });
                console.log(qrText);
                console.log('='.repeat(50));
                console.log('💡 Dica: Se o QR Code não aparecer bem, tente aumentar o tamanho da janela do terminal');
            } catch (error) {
                console.log('❌ Erro ao gerar QR Code:', error.message);
                console.log('🔗 QR Code string:', qr);
            }
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão fechada devido a ', lastDisconnect?.error, ', reconectando ', shouldReconnect);

            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('✅ Conectado ao WhatsApp!');
            isConnected = true;
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

// Rota para verificar status da conexão
app.get('/status', (req, res) => {
    res.json({
        connected: isConnected,
        message: isConnected ? 'Conectado ao WhatsApp' : 'Desconectado do WhatsApp'
    });
});

// Rota para obter foto de perfil
app.get('/profile-photo/:number', async (req, res) => {
    try {
        const { number } = req.params;

        if (!isConnected || !sock) {
            return res.status(503).json({
                error: 'WhatsApp não está conectado. Aguarde a conexão ser estabelecida.'
            });
        }

        // Formatar o número (remover caracteres especiais e adicionar @c.us)
        let formattedNumber = number.replace(/[^\d]/g, '');

        // Adicionar código do país se não estiver presente
        if (!formattedNumber.startsWith('55')) {
            formattedNumber = '55' + formattedNumber;
        }

        const jid = formattedNumber + '@s.whatsapp.net';

        console.log(`Tentando obter foto de perfil para: ${jid}`);

        // Obter foto de perfil
        const profilePictureUrl = await sock.profilePictureUrl(jid, 'image');

        res.json({
            success: true,
            number: number,
            jid: jid,
            profilePictureUrl: profilePictureUrl
        });

    } catch (error) {
        console.error('Erro ao obter foto de perfil:', error);

        if (error.message.includes('404')) {
            return res.status(404).json({
                error: 'Foto de perfil não encontrada para este número',
                number: req.params.number
            });
        }

        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// Rota para conectar ao WhatsApp
app.post('/connect', async (req, res) => {
    try {
        if (isConnected) {
            return res.json({
                message: 'Já conectado ao WhatsApp',
                connected: true
            });
        }

        await connectToWhatsApp();

        res.json({
            message: 'Iniciando conexão com WhatsApp. Verifique o console para o QR Code.',
            connected: false
        });

    } catch (error) {
        console.error('Erro ao conectar:', error);
        res.status(500).json({
            error: 'Erro ao conectar com WhatsApp',
            message: error.message
        });
    }
});

// Rota para desconectar do WhatsApp
app.post('/disconnect', (req, res) => {
    try {
        if (sock) {
            sock.end();
            sock = null;
            isConnected = false;
        }

        res.json({
            message: 'Desconectado do WhatsApp',
            connected: false
        });

    } catch (error) {
        console.error('Erro ao desconectar:', error);
        res.status(500).json({
            error: 'Erro ao desconectar do WhatsApp',
            message: error.message
        });
    }
});

// Rota de teste
app.get('/', (req, res) => {
    res.json({
        message: 'API WhatsApp Profile Photo',
        endpoints: {
            'GET /status': 'Verificar status da conexão',
            'POST /connect': 'Conectar ao WhatsApp',
            'POST /disconnect': 'Desconectar do WhatsApp',
            'GET /profile-photo/:number': 'Obter foto de perfil por número'
        },
        example: {
            url: '/profile-photo/5511999999999',
            description: 'Obter foto de perfil do número 11 99999-9999'
        },
        interface: {
            url: '/index.html',
            description: 'Interface gráfica para testar a API'
        }
    });
});

// Rota para a interface gráfica
app.get('/interface', (req, res) => {
    res.redirect('/index.html');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 API WhatsApp Profile Photo`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`🎨 Interface gráfica: http://localhost:${PORT}/index.html`);
    console.log(`\nPara usar a API:`);
    console.log(`1. Acesse a interface: http://localhost:${PORT}/index.html`);
    console.log(`2. Clique em "Conectar" e escaneie o QR Code`);
    console.log(`3. Digite um número e clique em "Buscar"`);
    console.log(`\nOu use via API:`);
    console.log(`- GET /status - Verificar status`);
    console.log(`- POST /connect - Conectar ao WhatsApp`);
    console.log(`- GET /profile-photo/5511999999999 - Obter foto de perfil`);
});

// Conectar automaticamente ao iniciar
connectToWhatsApp(); 