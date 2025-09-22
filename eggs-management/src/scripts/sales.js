// Make functions global by attaching to window
window.showAddSaleModal = function() {
    console.log("Opening add sale modal...");
    document.getElementById("addSaleModal").style.display = "flex";
    // Clear form and set default date
    const form = document.getElementById("salesForm");
    if (form) {
        form.reset();
        // Set sale date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('saleDate').value = today;
    }
};

window.closeAddSaleModal = function() {
    console.log("Closing add sale modal...");
    document.getElementById("addSaleModal").style.display = "none";
};

window.addSale = function(event) {
    event.preventDefault();
    console.log("Adding sale...");

    const customerName = document.getElementById("saleCustomer").value.trim();
    const fullTrays = parseInt(document.getElementById("saleFullTrays").value);
    const pieces = parseInt(document.getElementById("salePieces").value);
    const pricePerTray = parseFloat(document.getElementById("pricePerTray").value);
    const pricePerPiece = parseFloat(document.getElementById("pricePerPiece").value);
    const saleDate = document.getElementById("saleDate").value;
    const deliveryDate = document.getElementById("deliveryDate").value;
    const notes = document.getElementById("saleNotes").value.trim();

    if (!customerName || isNaN(fullTrays) || isNaN(pieces) || isNaN(pricePerTray) || isNaN(pricePerPiece) || !saleDate) {
        alert("Please fill in all required fields");
        return;
    }

    // Calculate total amount
    const totalAmount = (fullTrays * pricePerTray) + (pieces * pricePerPiece);

    // Show success message
    alert(
        "Sale added successfully!\n\n" +
        "Customer: " + customerName + "\n" +
        "Full Trays: " + fullTrays + "\n" +
        "Pieces: " + pieces + "\n" +
        "Total Amount: KSh " + totalAmount.toFixed(2) + "\n" +
        "Sale Date: " + saleDate
    );

    // Reset form
    document.getElementById("salesForm").reset();
    // Close modal
    window.closeAddSaleModal();
};

// Run once DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    console.log("Sales page loaded successfully!");

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('addSaleModal');
        if (event.target === modal) {
            window.closeAddSaleModal();
        }
    });
});
