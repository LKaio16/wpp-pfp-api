// Variáveis globais
let isConnected = false;
let currentQR = null;

// Elementos do DOM
const statusIndicator = document.getElementById('statusIndicator');
const statusDot = document.querySelector('.status-dot');
const statusText = document.querySelector('.status-text');
const statusValue = document.getElementById('statusValue');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const qrSection = document.getElementById('qrSection');
const qrCodeImage = document.getElementById('qrCodeImage');
const qrLoading = document.getElementById('qrLoading');
const phoneNumberInput = document.getElementById('phoneNumber');
const searchBtn = document.getElementById('searchBtn');
const resultSection = document.getElementById('resultSection');
const profileImage = document.getElementById('profileImage');
const profileNumber = document.getElementById('profileNumber');
const profileStatus = document.getElementById('profileStatus');
const downloadBtn = document.getElementById('downloadBtn');
const logsContainer = document.getElementById('logsContainer');

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
    addLog('Interface carregada. Aguardando conexão...', 'info');
    checkStatus();

    // Verificar status periodicamente
    setInterval(() => {
        if (isConnected) {
            checkStatus();
        }
    }, 30000); // Verificar a cada 30 segundos se estiver conectado
});

// Função para verificar status da API
async function checkStatus() {
    try {
        const response = await fetch('/status');
        const data = await response.json();

        updateConnectionStatus(data.connected, data.message);

        // Atualizar QR Code se disponível
        if (data.qrCode && !isConnected) {
            showQRCode(data.qrCode);
        } else if (isConnected) {
            hideQRCode();
        }

        addLog(`Status verificado: ${data.message}`, 'info');
    } catch (error) {
        addLog(`Erro ao verificar status: ${error.message}`, 'error');
        updateConnectionStatus(false, 'Erro de conexão');
    }
}

// Função para atualizar status da conexão
function updateConnectionStatus(connected, message) {
    isConnected = connected;

    // Atualizar indicador visual
    if (connected) {
        statusDot.classList.add('connected');
        statusDot.classList.remove('connecting');
        statusText.textContent = 'Conectado';
        statusValue.textContent = 'Conectado ao WhatsApp';

        // Atualizar botões
        connectBtn.style.display = 'none';
        disconnectBtn.style.display = 'inline-flex';

        // Esconder QR Code
        hideQRCode();
    } else {
        statusDot.classList.remove('connected');
        statusDot.classList.add('connecting');
        statusText.textContent = 'Desconectado';
        statusValue.textContent = 'Desconectado do WhatsApp';

        // Atualizar botões
        connectBtn.style.display = 'inline-flex';
        disconnectBtn.style.display = 'none';
    }
}

// Função para mostrar QR Code
function showQRCode(qrCodeData) {
    qrSection.style.display = 'block';
    qrLoading.style.display = 'flex';
    qrCodeImage.style.display = 'none';

    // Se o QR Code for uma string (data URL), mostrar a imagem
    if (qrCodeData && qrCodeData.startsWith('data:image')) {
        qrCodeImage.src = qrCodeData;
        qrCodeImage.onload = function () {
            qrLoading.style.display = 'none';
            qrCodeImage.style.display = 'block';
            addLog('QR Code gerado e exibido na interface', 'success');
        };
    } else {
        qrLoading.style.display = 'none';
        addLog('QR Code disponível no terminal', 'info');
    }
}

// Função para esconder QR Code
function hideQRCode() {
    qrSection.style.display = 'none';
    qrLoading.style.display = 'none';
    qrCodeImage.style.display = 'none';
}

// Função para conectar ao WhatsApp
async function connect() {
    try {
        addLog('Iniciando conexão com WhatsApp...', 'info');

        const response = await fetch('/connect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            addLog('Conexão iniciada. Aguarde o QR Code...', 'success');
            // Verificar status após um breve delay para pegar o QR Code
            setTimeout(checkStatus, 2000);
        } else {
            addLog(`Erro ao conectar: ${data.message}`, 'error');
        }
    } catch (error) {
        addLog(`Erro ao conectar: ${error.message}`, 'error');
    }
}

// Função para desconectar do WhatsApp
async function disconnect() {
    try {
        addLog('Desconectando do WhatsApp...', 'info');

        const response = await fetch('/disconnect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            addLog('Desconectado do WhatsApp', 'success');
            updateConnectionStatus(false, 'Desconectado do WhatsApp');
        } else {
            addLog(`Erro ao desconectar: ${data.message}`, 'error');
        }
    } catch (error) {
        addLog(`Erro ao desconectar: ${error.message}`, 'error');
    }
}

// Função para buscar foto de perfil
async function searchProfile() {
    const phoneNumber = phoneNumberInput.value.trim();

    if (!phoneNumber) {
        addLog('Por favor, insira um número de telefone', 'warning');
        return;
    }

    if (!isConnected) {
        addLog('WhatsApp não está conectado. Conecte primeiro.', 'warning');
        return;
    }

    try {
        addLog(`Buscando foto de perfil para: ${phoneNumber}`, 'info');

        // Desabilitar botão durante a busca
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';

        const response = await fetch(`/profile-photo/${phoneNumber}`);
        const data = await response.json();

        if (data.success) {
            showProfileResult(data);
            addLog(`Foto encontrada para ${phoneNumber}`, 'success');
        } else {
            showErrorResult(data.error || 'Erro ao buscar foto de perfil');
            addLog(`Erro: ${data.error}`, 'error');
        }
    } catch (error) {
        showErrorResult('Erro de conexão com a API');
        addLog(`Erro de conexão: ${error.message}`, 'error');
    } finally {
        // Reabilitar botão
        searchBtn.disabled = false;
        searchBtn.innerHTML = '<i class="fas fa-search"></i> Buscar';
    }
}

// Função para mostrar resultado da busca
function showProfileResult(data) {
    resultSection.style.display = 'block';

    // Atualizar imagem
    profileImage.src = data.profilePictureUrl;
    profileImage.alt = `Foto de perfil de ${data.number}`;

    // Atualizar informações
    profileNumber.textContent = `+${data.number}`;
    profileStatus.textContent = 'Foto de perfil encontrada';

    // Atualizar link de download
    downloadBtn.href = data.profilePictureUrl;
    downloadBtn.download = `profile_${data.number}.jpg`;

    // Scroll para o resultado
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Função para mostrar erro
function showErrorResult(errorMessage) {
    resultSection.style.display = 'block';

    // Mostrar imagem de erro
    profileImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiByeD0iNjAiIGZpbGw9IiNGNUY1RjUiLz4KPHBhdGggZD0iTTYwIDMwQzQzLjQzMTUgMzAgMzAgNDMuNDMxNSAzMCA2MEMzMCA3Ni41Njg1IDQzLjQzMTUgOTAgNjAgOTBDNzYuNTY4NSA5MCA5MCA3Ni41Njg1IDkwIDYwQzkwIDQzLjQzMTUgNzYuNTY4NSAzMCA2MCAzMFpNNjAgODBDNTIuMzg2IDgwIDQ2IDczLjYxNCA0NiA2NkM0NiA1OC4zODYgNTIuMzg2IDUyIDYwIDUyQzY3LjYxNCA1MiA3NCA1OC4zODYgNzQgNjZDNzQgNzMuNjE0IDY3LjYxNCA4MCA2MCA4MFpNNjAgNTdDNjIuNzYxNCA1NyA2NSA1OS4yMzg2IDY1IDYyVjY4QzY1IDcwLjc2MTQgNjIuNzYxNCA3MyA2MCA3M0M1Ny4yMzg2IDczIDU1IDcwLjc2MTQgNTUgNjhWNjJDNTUgNTkuMjM4NiA1Ny4yMzg2IDU3IDYwIDU3WiIgZmlsbD0iI0NDQ0NDQyIvPgo8L3N2Zz4K';
    profileImage.alt = 'Erro';

    // Atualizar informações
    profileNumber.textContent = 'Erro';
    profileStatus.textContent = errorMessage;

    // Desabilitar botões de ação
    downloadBtn.style.display = 'none';
}

// Função para copiar URL da imagem
async function copyImageUrl() {
    try {
        await navigator.clipboard.writeText(profileImage.src);
        addLog('URL da imagem copiada para a área de transferência', 'success');

        // Feedback visual
        const btn = event.target.closest('.btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        btn.style.background = '#25D366';
        btn.style.color = 'white';

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.color = '';
        }, 2000);
    } catch (error) {
        addLog('Erro ao copiar URL', 'error');
    }
}

// Função para adicionar log
function addLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';

    let icon = 'info-circle';
    let color = '#17a2b8';

    switch (type) {
        case 'success':
            icon = 'check-circle';
            color = '#25D366';
            break;
        case 'error':
            icon = 'exclamation-circle';
            color = '#dc3545';
            break;
        case 'warning':
            icon = 'exclamation-triangle';
            color = '#ffc107';
            break;
    }

    logEntry.innerHTML = `
        <span class="log-time" style="color: ${color};">[${timestamp}]</span>
        <span class="log-message"><i class="fas fa-${icon}"></i> ${message}</span>
    `;

    logsContainer.appendChild(logEntry);

    // Scroll para o final
    logsContainer.scrollTop = logsContainer.scrollHeight;

    // Limitar número de logs (manter apenas os últimos 50)
    const logs = logsContainer.querySelectorAll('.log-entry');
    if (logs.length > 50) {
        logs[0].remove();
    }
}

// Função para limpar logs
function clearLogs() {
    logsContainer.innerHTML = '';
    addLog('Logs limpos', 'info');
}

// Event listeners
phoneNumberInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchProfile();
    }
});

// Formatação automática do número de telefone
phoneNumberInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');

    // Limitar a 15 dígitos
    if (value.length > 15) {
        value = value.slice(0, 15);
    }

    e.target.value = value;
}); 