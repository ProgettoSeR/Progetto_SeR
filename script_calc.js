document.addEventListener('DOMContentLoaded', () => {
    initializeBandSelector();
    const calcolaColoriBtn = document.querySelector('.calcola-colori-btn');
    if (calcolaColoriBtn) {
        calcolaColoriBtn.addEventListener('click', calculateColors);
    }
});

const colorValues = {
    nero: { value: 0, multiplier: 1, tolerance: null, color: '#000000' },
    marrone: { value: 1, multiplier: 10, tolerance: 1, color: '#8B4444' },
    rosso: { value: 2, multiplier: 100, tolerance: 2, color: '#FF3B30' },
    arancione: { value: 3, multiplier: 1000, tolerance: null, color: '#E67E22' },
    giallo: { value: 4, multiplier: 10000, tolerance: null, color: '#F1C40F' },
    verde: { value: 5, multiplier: 100000, tolerance: 0.5, color: '#27AE60' },
    blu: { value: 6, multiplier: 1000000, tolerance: 0.25, color: '#2980B9' },
    viola: { value: 7, multiplier: 10000000, tolerance: 0.1, color: '#8E44AD' },
    grigio: { value: 8, multiplier: 100000000, tolerance: 0.05, color: '#95A5A6' },
    bianco: { value: 9, multiplier: 1000000000, tolerance: null, color: '#FFFFFF' },
    oro: { value: null, multiplier: 0.1, tolerance: 5, color: '#D4AF37' },
    argento: { value: null, multiplier: 0.01, tolerance: 10, color: '#C0C0C0' }
};

const ppmValues = {
    marrone: { value: 100, color: colorValues.marrone.color },
    rosso: { value: 50, color: colorValues.rosso.color },
    arancione: { value: 15, color: colorValues.arancione.color },
    giallo: { value: 25, color: colorValues.giallo.color },
    blu: { value: 10, color: colorValues.blu.color },
    viola: { value: 5, color: colorValues.viola.color }
};

const toleranceColors = ['marrone', 'rosso', 'verde', 'blu', 'viola', 'grigio', 'oro', 'argento'];

let currentBandType = null;

function initializeBandSelector() {
    const bandOptions = document.querySelectorAll('.band-option');
    
    bandOptions.forEach(option => {
        option.addEventListener('click', () => {
            bandOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            currentBandType = option.dataset.bands;
            setupBandInputs(currentBandType);
        });
    });

    document.querySelector('.calcola-btn').addEventListener('click', calculateResistance);
    document.querySelector('.azzera-btn').addEventListener('click', resetCalculator);
}

function setupBandInputs(numBands) {
    const bandInputs = document.getElementById('bandInputs');
    bandInputs.innerHTML = '';
    
    for (let i = 1; i <= numBands; i++) {
        const inputGroup = createBandInput(i, numBands);
        bandInputs.appendChild(inputGroup);
    }
    
    setupResistorDisplay(numBands);
    document.getElementById('result').textContent = 'Seleziona i colori delle bande';
}

function createBandInput(index, totalBands) {
    const div = document.createElement('div');
    div.className = 'input-group';
    
    const label = document.createElement('label');
    label.textContent = getBandLabel(index, totalBands);
    
    const select = document.createElement('select');
    select.id = `band${index}`;
    select.innerHTML = `<option value="">Seleziona colore...</option>${generateColorOptions(index, totalBands)}`;
    select.addEventListener('change', () => {
        updateResistorDisplay();
        validateInputs();
    });
    
    div.appendChild(label);
    div.appendChild(select);
    return div;
}

function getBandLabel(index, totalBands) {
    switch(totalBands) {
        case '4':
            switch(index) {
                case 1: return 'Colore 1ª banda';
                case 2: return 'Colore 2ª banda';
                case 3: return 'Moltiplicatore';
                case 4: return 'Tolleranza';
            }
            break;
        
        case '5':
            switch(index) {
                case 1: return 'Colore 1ª banda';
                case 2: return 'Colore 2ª banda';
                case 3: return 'Colore 3ª banda';
                case 4: return 'Moltiplicatore';
                case 5: return 'Tolleranza';
            }
            break;
        
        case '6':
            switch(index) {
                case 1: return 'Colore 1ª banda';
                case 2: return 'Colore 2ª banda';
                case 3: return 'Colore 3ª banda';
                case 4: return 'Moltiplicatore';
                case 5: return 'Tolleranza';
                case 6: return 'PPM';
            }
            break;
    }
}

function generateColorOptions(bandNum, totalBands) {
    let options = '';
    
    const getTextColor = (backgroundColor) => {
        const darkColors = ['nero', 'blu', 'viola', 'marrone', 'grigio'];
        return darkColors.includes(backgroundColor) ? 'white' : 'black';
    };

    // Banda della tolleranza (ultima banda per 4 e 5 bande, penultima per 6 bande)
    if ((totalBands === '4' && bandNum === 4) || 
        (totalBands === '5' && bandNum === 5) || 
        (totalBands === '6' && bandNum === 5)) {
        toleranceColors.forEach(color => {
            if (colorValues[color].tolerance !== null) {
                const textColor = getTextColor(color);
                options += `<option value="${color}" style="
                    background-color: ${colorValues[color].color}; 
                    color: ${textColor};
                    font-family: monospace;
                ">
                    ${(color.charAt(0).toUpperCase() + color.slice(1)).padEnd(20, '\u00A0')}±${colorValues[color].tolerance}%
                </option>`;
            }
        });
    }
    // Banda del moltiplicatore
    else if ((totalBands === '4' && bandNum === 3) || 
             (totalBands === '5' && bandNum === 4) || 
             (totalBands === '6' && bandNum === 4)) {
        Object.keys(colorValues).forEach(color => {
            if (colorValues[color].multiplier !== null) {
                let multiplierText = formatMultiplier(colorValues[color].multiplier);
                const textColor = getTextColor(color);
                options += `<option value="${color}" style="
                    background-color: ${colorValues[color].color}; 
                    color: ${textColor};
                    font-family: monospace;
                ">
                    ${(color.charAt(0).toUpperCase() + color.slice(1)).padEnd(20, '\u00A0')}×${multiplierText}
                </option>`;
            }
        });
    }
    // Banda PPM (solo per la sesta banda)
    else if (totalBands === '6' && bandNum === 6) {
        Object.keys(ppmValues).forEach(color => {
            const textColor = getTextColor(color);
            options += `<option value="${color}" style="
                background-color: ${ppmValues[color].color}; 
                color: ${textColor};
                font-family: monospace;
            ">
                ${(color.charAt(0).toUpperCase() + color.slice(1)).padEnd(20, '\u00A0')}${ppmValues[color].value} PPM
            </option>`;
        });
    }
    // Bande dei valori (1-3)
    else {
        Object.keys(colorValues).forEach(color => {
            if (colorValues[color].value !== null) {
                const textColor = getTextColor(color);
                options += `<option value="${color}" style="
                    background-color: ${colorValues[color].color}; 
                    color: ${textColor};
                    font-family: monospace;
                ">
                    ${(color.charAt(0).toUpperCase() + color.slice(1)).padEnd(20, '\u00A0')}${colorValues[color].value}
                </option>`;
            }
        });
    }
    
    return options;
}

function formatMultiplier(multiplier) {
    if (multiplier >= 1000000000) return `${multiplier/1000000000}G`;
    if (multiplier >= 1000000) return `${multiplier/1000000}M`;
    if (multiplier >= 1000) return `${multiplier/1000}k`;
    if (multiplier < 1) return `0.${multiplier*100}`;
    return multiplier;
}

function setupResistorDisplay(numBands) {
    const resistorDisplay = document.getElementById('resistorDisplay');
    resistorDisplay.innerHTML = '';
    
    for (let i = 1; i <= numBands; i++) {
        const band = document.createElement('div');
        band.className = 'band';
        band.id = `bandDisplay${i}`;
        resistorDisplay.appendChild(band);
    }
}

function updateResistorDisplay() {
    if (!currentBandType) return;
    
    const numBands = parseInt(currentBandType);
    for (let i = 1; i <= numBands; i++) {
        const select = document.getElementById(`band${i}`);
        const bandDisplay = document.getElementById(`bandDisplay${i}`);
        
        if (select && bandDisplay) {
            const color = select.value;
            if (color) {
                if (i === numBands && numBands === 6) {
                    bandDisplay.style.backgroundColor = ppmValues[color].color;
                } else {
                    bandDisplay.style.backgroundColor = colorValues[color].color;
                }
            } else {
                bandDisplay.style.backgroundColor = '#ddd';
            }
        }
    }
}

function validateInputs() {
    if (!currentBandType) return false;
    
    const numBands = parseInt(currentBandType);
    for (let i = 1; i <= numBands; i++) {
        const select = document.getElementById(`band${i}`);
        if (!select || !select.value) return false;
    }
    return true;
}

function calculateResistance() {
    if (!validateInputs()) {
        document.getElementById('result').textContent = 'Seleziona tutti i colori prima di calcolare';
        return;
    }

    const numBands = parseInt(currentBandType);
    let value = 0;
    let tolerance = 0;
    let ppm = null;

    // Calcola il valore base
    if (numBands === 4) {
        const band1 = colorValues[document.getElementById('band1').value].value;
        const band2 = colorValues[document.getElementById('band2').value].value;
        const multiplierBand = document.getElementById('band3').value;
        const toleranceBand = document.getElementById('band4').value;
        
        value = (band1 * 10 + band2) * colorValues[multiplierBand].multiplier;
        tolerance = colorValues[toleranceBand].tolerance;
    } 
    else if (numBands === 5) {
        const band1 = colorValues[document.getElementById('band1').value].value;
        const band2 = colorValues[document.getElementById('band2').value].value;
        const band3 = colorValues[document.getElementById('band3').value].value;
        const multiplierBand = document.getElementById('band4').value;
        const toleranceBand = document.getElementById('band5').value;
        
        value = (band1 * 100 + band2 * 10 + band3) * colorValues[multiplierBand].multiplier;
        tolerance = colorValues[toleranceBand].tolerance;
    } 
    else if (numBands === 6) {
        const band1 = colorValues[document.getElementById('band1').value].value;
        const band2 = colorValues[document.getElementById('band2').value].value;
        const band3 = colorValues[document.getElementById('band3').value].value;
        const multiplierBand = document.getElementById('band4').value;
        const tempCoeffBand = document.getElementById('band5').value;
        
        value = (band1 * 100 + band2 * 10 + band3) * colorValues[multiplierBand].multiplier;
        ppm = colorValues[tempCoeffBand].ppm;
    }

    // Formatta e visualizza il risultato
    let result = formatResistanceValue(value);
    if (numBands === 4 || numBands === 5) {
        result += ` ±${tolerance}%`;
    }
    if (numBands === 6) {
        result += ` (${ppm} ppm/°C)`;
    }

    document.getElementById('result').textContent = result;
}

function formatResistanceValue(value) {
    if (value >= 1000000000) {
        return (value / 1000000000).toFixed(2) + 'G';
    } else if (value >= 1000000) {
        return (value / 1000000).toFixed(2) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(2) + 'k';
    }
    return value.toFixed(2);
}

function resetCalculator() {
    currentBandType = null;
    document.querySelectorAll('.band-option').forEach(opt => opt.classList.remove('active'));
    document.getElementById('bandInputs').innerHTML = '';
    document.getElementById('resistorDisplay').innerHTML = '';
    document.getElementById('result').textContent = 'Seleziona il tipo di resistore';
}

function calculateColors() {
    const value = parseFloat(document.getElementById('resistanceValue').value);
    const multiplier = parseFloat(document.getElementById('resistanceUnit').value);
    const totalValue = value * multiplier;
    
    if (isNaN(totalValue)) {
        alert('Inserisci un valore valido');
        return;
    }

    if (!currentBandType) {
        alert('Seleziona prima il tipo di resistore');
        return;
    }

    const numBands = parseInt(currentBandType);
    let valueStr = totalValue.toString().replace('.', '');
    let multiplierPower = 0;

    // Rimuovi gli zeri finali e calcola il moltiplicatore
    while (valueStr.endsWith('0') && valueStr.length > (numBands === 4 ? 2 : 3)) {
        valueStr = valueStr.slice(0, -1);
        multiplierPower++;
    }

    // Aggiungi zeri iniziali se necessario
    while (valueStr.length < (numBands === 4 ? 2 : 3)) {
        valueStr = '0' + valueStr;
    }

    // Gestisci i decimali
    if (totalValue < 1) {
        const decimalStr = totalValue.toString();
        const decimalParts = decimalStr.split('.');
        if (decimalParts.length > 1) {
            valueStr = decimalParts[1].substring(0, numBands === 4 ? 2 : 3);
            multiplierPower = -decimalParts[1].indexOf(valueStr[0]) - 1;
        }
    }

    // Converti in numero per il controllo del range
    const numValue = parseInt(valueStr);

    // Controlla i range in base al tipo di banda
    if (numBands === 4) {
        if (numValue < 0 || numValue > 99) {
            alert('Per le resistenze a 4 bande, inserire un numero da 0 a 99');
            return;
        }
    } else if (numBands === 5 || numBands === 6) {
        if (numValue < 0 || numValue > 999) {
            alert('Per le resistenze a 5/6 bande, inserire un numero da 0 a 999');
            return;
        }
    }

    // Imposta le bande
    if (numBands === 4) {
        setColorBand(1, parseInt(valueStr[0]));
        setColorBand(2, parseInt(valueStr[1]));
        setColorBand(3, multiplierPower);
        setColorBand(4, null); // Per la tolleranza
    } else if (numBands === 5 || numBands === 6) {
        setColorBand(1, parseInt(valueStr[0]));
        setColorBand(2, parseInt(valueStr[1]));
        setColorBand(3, parseInt(valueStr[2]));
        setColorBand(4, multiplierPower);
        if (numBands === 5) {
            setColorBand(5, null); // Per la tolleranza
        } else {
            setColorBand(5, null); // Per la tolleranza
            setColorBand(6, null); // Per il PPM
        }
    }

    updateResistorDisplay();
}

function setColorBand(bandNumber, value) {
    const select = document.getElementById(`band${bandNumber}`);
    if (!select) return;

    // Per le bande delle cifre (1-3)
    if (bandNumber <= 3) {
        for (const [color, data] of Object.entries(colorValues)) {
            if (data.value === value) {
                select.value = color;
                break;
            }
        }
    } 
    // Per il moltiplicatore (banda 3 per 4 bande, banda 4 per 5/6 bande)
    else {
        for (const [color, data] of Object.entries(colorValues)) {
            const multiplierLog = Math.log10(data.multiplier);
            if (multiplierLog === value) {
                select.value = color;
                break;
            }
        }
    }
}