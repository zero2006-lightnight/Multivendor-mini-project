
// Add your custom javascript here
function toggleShopName(role) {
    const shopNameInput = document.getElementById('shopNameInput');
    if (role === 'vendor') {
        shopNameInput.style.display = 'block';
    } else {
        shopNameInput.style.display = 'none';
    }
}


