// Funzione per mostrare il popup dei filtri
function mostraFiltri() {
    const filtriDiv = document.getElementById('filtriDiv');
    if (filtriDiv) {
        const bootstrapModal = new bootstrap.Modal(filtriDiv, { backdrop: 'static' });
        bootstrapModal.show();
    } else {
        console.error("Impossibile trovare l'elemento con ID 'filtriDiv'");
    }
}

// Funzione per chiudere il popup dei filtri
function chiudiFiltri() {
    const filtriDiv = document.getElementById('filtriDiv');
    if (filtriDiv) {
        const bootstrapModal = bootstrap.Modal.getInstance(filtriDiv);
        if (bootstrapModal) bootstrapModal.hide();
    } else {
        console.error("Impossibile trovare l'elemento con ID 'filtriDiv'");
    }
}

// Funzione per applicare i filtri selezionati
function applicaFiltri() {
    const checkboxes = document.querySelectorAll('input[name="tipo[]"]:checked');
    const selectedFilters = Array.from(checkboxes).map(cb => cb.value).join(',');
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('filter', selectedFilters);
    window.location.href = currentUrl;
}

document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    
    hamburgerBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const isVisible = dropdownContent.style.display === 'block';
        
        // Aggiungi animazione di rotazione al bottone
        this.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(90deg)';
        
        dropdownContent.style.display = isVisible ? 'none' : 'block';
    });
    
    // Chiudi il dropdown quando si clicca fuori
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.hamburger-menu')) {
            dropdownContent.style.display = 'none';
            hamburgerBtn.style.transform = 'rotate(0deg)';
        }
    });
});
