// Configurações da API
const API_BASE_URL = 'http://localhost:3000';

// Elementos do DOM
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const statusDot = statusIndicator.querySelector('.status-dot');
const checkStatusBtn = document.getElementById('checkStatusBtn');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const phoneNumberInput = document.getElementById('phoneNumber');
const searchBtn = document.getElementById('searchBtn');
const resultContainer = document.getElementById('resultContainer');
const resultContent = document.getElementById('resultContent');
const clearResultBtn = document.getElementById('clearResultBtn');
const logsContainer = document.getElementById('logsContainer');
const clearLogsBtn = document.getElementById('clearLogsBtn');
const currentTimeSpan = document.getElementById('currentTime');

// Estado da aplicação
let isConnected = false;
let isChecking = false;

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    // Event listeners
    checkStatusBtn.addEventListener('click', checkStatus);
    connectBtn.addEventListener('click', connectWhatsApp);
    disconnectBtn.addEventListener('click', disconnectWhatsApp);
    searchBtn.addEventListener('click', searchProfilePhoto);
    clearResultBtn.addEventListener('click', clearResult);
    clearLogsBtn.addEventListener('click', clearLogs);

    // Enter key no input
    phoneNumberInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchProfilePhoto();
        }
    });

    // Verificar status inicial
    checkStatus();

    addLog('Interface inicializada com sucesso!', 'success');
});

// Funções de utilidade
function updateCurrentTime() {
    const now = new Date();
    currentTimeSpan.textContent = now.toLocaleTimeString();
}

function addLog(message, type = 'info') {
    const now = new Date();
    const timestamp = now.toLocaleTimeString();

    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.innerHTML = `
        <span class="timestamp">[${timestamp}]</span>
        <span class="message">${message}</span>
    `;

    logsContainer.appendChild(logEntry);
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

function updateStatus(connected, message) {
    isConnected = connected;
    statusText.textContent = message;

    statusDot.className = 'status-dot';
    if (connected) {
        statusDot.classList.add('connected');
    } else if (isChecking) {
        statusDot.classList.add('connecting');
    }

    // Atualizar estado dos botões
    connectBtn.disabled = connected;
    disconnectBtn.disabled = !connected;
    searchBtn.disabled = !connected;
}

function showLoading(element) {
    element.disabled = true;
    const originalText = element.innerHTML;
    element.innerHTML = '<div class="loading"></div>';
    return originalText;
}

function hideLoading(element, originalText) {
    element.disabled = false;
    element.innerHTML = originalText;
}

// Funções da API
async function checkStatus() {
    if (isChecking) return;

    isChecking = true;
    updateStatus(false, 'Verificando...');

    const originalText = showLoading(checkStatusBtn);

    try {
        addLog('Verificando status da conexão...', 'info');

        const response = await fetch(`${API_BASE_URL}/status`);
        const data = await response.json();

        if (data.connected) {
            updateStatus(true, 'Conectado ao WhatsApp');
            addLog('✅ WhatsApp conectado com sucesso!', 'success');
        } else {
            updateStatus(false, 'Desconectado do WhatsApp');
            addLog('⚠️ WhatsApp não está conectado', 'warning');
        }

    } catch (error) {
        updateStatus(false, 'Erro ao verificar status');
        addLog(`❌ Erro ao verificar status: ${error.message}`, 'error');
    } finally {
        hideLoading(checkStatusBtn, originalText);
        isChecking = false;
    }
}

async function connectWhatsApp() {
    const originalText = showLoading(connectBtn);

    try {
        addLog('Iniciando conexão com WhatsApp...', 'info');

        const response = await fetch(`${API_BASE_URL}/connect`, {
            method: 'POST'
        });
        const data = await response.json();

        addLog(data.message, 'info');

        // Aguardar um pouco e verificar status novamente
        setTimeout(() => {
            checkStatus();
        }, 2000);

    } catch (error) {
        addLog(`❌ Erro ao conectar: ${error.message}`, 'error');
    } finally {
        hideLoading(connectBtn, originalText);
    }
}

async function disconnectWhatsApp() {
    const originalText = showLoading(disconnectBtn);

    try {
        addLog('Desconectando do WhatsApp...', 'info');

        const response = await fetch(`${API_BASE_URL}/disconnect`, {
            method: 'POST'
        });
        const data = await response.json();

        updateStatus(false, 'Desconectado do WhatsApp');
        addLog(data.message, 'success');

    } catch (error) {
        addLog(`❌ Erro ao desconectar: ${error.message}`, 'error');
    } finally {
        hideLoading(disconnectBtn, originalText);
    }
}

async function searchProfilePhoto() {
    const phoneNumber = phoneNumberInput.value.trim();

    if (!phoneNumber) {
        addLog('❌ Por favor, insira um número de telefone', 'error');
        return;
    }

    if (!isConnected) {
        addLog('❌ WhatsApp não está conectado. Conecte primeiro.', 'error');
        return;
    }

    const originalText = showLoading(searchBtn);

    try {
        addLog(`🔍 Buscando foto de perfil para: ${phoneNumber}`, 'info');

        const response = await fetch(`${API_BASE_URL}/profile-photo/${phoneNumber}`);
        const data = await response.json();

        if (data.success) {
            showSuccessResult(data);
            addLog(`✅ Foto encontrada para ${phoneNumber}`, 'success');
        } else {
            showErrorResult(data.error, phoneNumber);
            addLog(`❌ ${data.error}`, 'error');
        }

    } catch (error) {
        const errorMessage = `Erro ao buscar foto: ${error.message}`;
        showErrorResult(errorMessage, phoneNumber);
        addLog(`❌ ${errorMessage}`, 'error');
    } finally {
        hideLoading(searchBtn, originalText);
    }
}

function showSuccessResult(data) {
    resultContainer.style.display = 'block';

    resultContent.innerHTML = `
        <div class="profile-photo">
            <img src="${data.profilePictureUrl}" alt="Foto de perfil" onerror="this.style.display='none'">
        </div>
        <div class="photo-info">
            <h4>Informações da Foto</h4>
            <div class="info-item">
                <span class="info-label">Número:</span>
                <span class="info-value">${data.number}</span>
            </div>
            <div class="info-item">
                <span class="info-label">JID:</span>
                <span class="info-value">${data.jid}</span>
            </div>
            <div class="info-item">
                <span class="info-label">URL da Foto:</span>
                <span class="info-value">
                    <a href="${data.profilePictureUrl}" target="_blank" style="word-break: break-all;">
                        ${data.profilePictureUrl}
                    </a>
                </span>
            </div>
        </div>
    `;
}

function showErrorResult(error, phoneNumber) {
    resultContainer.style.display = 'block';

    resultContent.innerHTML = `
        <div class="error-message">
            <h4>❌ Erro ao obter foto de perfil</h4>
            <p><strong>Número:</strong> ${phoneNumber}</p>
            <p><strong>Erro:</strong> ${error}</p>
            <p><strong>Possíveis causas:</strong></p>
            <ul>
                <li>O número não tem WhatsApp</li>
                <li>O usuário tem privacidade configurada</li>
                <li>O número está incorreto</li>
                <li>WhatsApp não está conectado</li>
            </ul>
        </div>
    `;
}

function clearResult() {
    resultContainer.style.display = 'none';
    resultContent.innerHTML = '';
    addLog('Resultado limpo', 'info');
}

function clearLogs() {
    logsContainer.innerHTML = '';
    addLog('Logs limpos', 'info');
}

// Função global para usar exemplos
function setExample(number) {
    phoneNumberInput.value = number;
    addLog(`Exemplo carregado: ${number}`, 'info');
    phoneNumberInput.focus();
}

// Verificar status periodicamente
setInterval(() => {
    if (isConnected) {
        checkStatus();
    }
}, 30000); // Verificar a cada 30 segundos se estiver conectado 