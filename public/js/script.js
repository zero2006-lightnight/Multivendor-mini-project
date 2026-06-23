// Theme toggle is handled by animations.js (loaded in footer)
// Do NOT add a duplicate handler here — it causes 'Identifier already declared' errors.

// Toggle shop name field visibility on registration
function toggleShopName(role) {
    var field = document.getElementById('shopNameField');
    if (field) {
        field.style.display = role === 'vendor' ? 'block' : 'none';
    }
}
