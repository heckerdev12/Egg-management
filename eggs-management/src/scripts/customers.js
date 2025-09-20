// customers.js

// Make functions global by attaching to window
window.showAddCustomerModal = function () {
    console.log("Opening modal...");
    document.getElementById("addCustomerModal").style.display = "flex";
};

window.closeAddCustomerModal = function () {
    console.log("Closing modal...");
    document.getElementById("addCustomerModal").style.display = "none";
};

window.addCustomer = function (event) {
    event.preventDefault();

    const customerName = document.getElementById("customerName").value.trim();
    const customerPhone = document.getElementById("customerPhone").value.trim();

    if (!customerName || !customerPhone) {
        alert("Please fill in all required fields");
        return;
    }

    // Show success message
    alert(
        "Customer added successfully!\n\n" +
        "Name: " + customerName +
        "\nPhone: " + customerPhone
    );

    // Reset form
    document.querySelector(".customer-form").reset();

    // Close modal
    window.closeAddCustomerModal();
};

// Utility functions for later (still global)
window.viewCustomer = function (customerId) {
    alert("Viewing details for customer: " + customerId);
};

window.editCustomer = function (customerId) {
    alert("Editing customer: " + customerId);
};

window.callCustomer = function (phoneNumber) {
    if (confirm("Call " + phoneNumber + "?")) {
        window.open("tel:" + phoneNumber);
    }
};

window.filterCustomers = function () {
    const searchInput = document.querySelector(".search-input");
    const filter = searchInput.value.toLowerCase();
    const tableRows = document.querySelectorAll("#customersTableBody tr");

    tableRows.forEach(row => {
        const customerName = row.querySelector(".customer-name");
        const customerPhone = row.querySelector(".contact-info div");

        if (customerName && customerPhone) {
            const nameText = customerName.textContent.toLowerCase();
            const phoneText = customerPhone.textContent.toLowerCase();

            row.style.display =
                nameText.includes(filter) || phoneText.includes(filter)
                    ? ""
                    : "none";
        }
    });
};

// Run once DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    console.log("Customers page loaded successfully!");

    // Close modal if clicking outside content
    window.addEventListener("click", function (event) {
        const modal = document.getElementById("addCustomerModal");
        if (event.target === modal) {
            window.closeAddCustomerModal();
        }
    });
});
