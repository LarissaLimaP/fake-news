// Elementos do DOM
const form = document.getElementById('analysisForm');
const newsText = document.getElementById('newsText');
const newsTitle = document.getElementById('newsTitle');
const charCount = document.getElementById('charCount');
const loading = document.getElementById('loading');
const resultCard = document.getElementById('resultCard');
const resultContent = document.getElementById('resultContent');
const closeResult = document.getElementById('closeResult');
const analyzeBtn = document.getElementById('analyzeBtn');

// Contador de caracteres
newsText.addEventListener('input', () => {
    const count = newsText.value.length;
    charCount.textContent = `${count} caracteres`;
});

// Função para analisar a notícia
async function analyzeNews(text, title) {
    // Simulação de chamada à API
    // Substitua esta função pela chamada real da API de detecção de fake news
    
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulação de resultado
            const isFake = Math.random() > 0.5;
            const confidence = Math.random() * 100;
            
            resolve({
                isFake: isFake,
                confidence: confidence,
                classification: isFake ? 'Fake News' : 'Notícia Real',
                details: {
                    title: title,
                    textLength: text.length,
                    analysisDate: new Date().toLocaleString('pt-BR')
                }
            });
        }, 2000);
    });
}

// Função para exibir o resultado
function displayResult(result) {
    const confidenceClass = result.confidence > 75 ? 'high' : result.confidence > 50 ? 'medium' : 'low';
    const badgeClass = result.isFake ? 'fake' : 'real';
    const icon = result.isFake ? '⚠️' : '✓';
    
    resultContent.innerHTML = `
        <div class="result-badge ${badgeClass}">
            <span style="font-size: 1.5rem;">${icon}</span>
            <span>${result.classification}</span>
        </div>       
        <div class="result-details">
            <p><strong>Título:</strong> ${result.details.title}</p>
            <p><strong>Tamanho do texto:</strong> ${result.details.textLength} caracteres</p>
            <p><strong>Data da análise:</strong> ${result.details.analysisDate}</p>
        </div>       
        <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(138, 180, 248, 0.15); border-left: 4px solid var(--primary-color); border-radius: 0.5rem;">
            <p style="color: var(--primary-color); font-size: 0.9rem; margin: 0;">
                ${result.isFake ? 'Recomendamos verificar a fonte e procurar por outras referências confiáveis.' : 'Mesmo assim, sempre verifique múltiplas fontes antes de compartilhar.'}
            </p>
        </div>
    `;
    
    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Handler do formulário
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const text = newsText.value.trim();
    const title = newsTitle.value.trim();
    
    if (!text) {
        alert('Por favor, insira o texto da notícia para análise.');
        return;
    }
    
    if (!title) {
        alert('Por favor, insira o título da notícia.');
        return;
    }
    
    // Esconder resultado anterior e mostrar loading
    resultCard.style.display = 'none';
    loading.style.display = 'block';
    analyzeBtn.disabled = true;
    
    try {
        // Chamar a função de análise
        const result = await analyzeNews(text, title);
        
        // Esconder loading e mostrar resultado
        loading.style.display = 'none';
        displayResult(result);
        
    } catch (error) {
        console.error('Erro ao analisar notícia:', error);
        loading.style.display = 'none';
        alert('Ocorreu um erro ao analisar a notícia. Por favor, tente novamente.');
    } finally {
        analyzeBtn.disabled = false;
    }
});

// Fechar resultado
closeResult.addEventListener('click', () => {
    resultCard.style.display = 'none';
});

// Função para integração com API real (exemplo)
async function analyzeNewsAPI(text, title) {
    try {
        const response = await fetch('/predict', {   // ← ROTA CERTA DO FASTAPI
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                text: text
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Resposta da API:', errorText);
            throw new Error('Erro na análise da API');
        }

        const data = await response.json();

        return {
            isFake: data.prediction === "fake",
            confidence: (data.confidence || 0) * 100,
            classification: data.prediction === "fake" ? "Fake News" : "Notícia Real",
            details: {
                title: title,
                textLength: text?.length || 0,
                analysisDate: new Date().toLocaleString('pt-BR'),
                model: data.model || "BERT",
                additionalInfo: data.metadata || null
            }
        };

    } catch (error) {
        console.error('Erro na chamada da API:', error);
        throw new Error("Não foi possível analisar a notícia. Tente novamente.");
    }
}


// Descomente a linha abaixo e comente a função analyzeNews para usar a API real

analyzeNews = analyzeNewsAPI;