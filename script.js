// Hardware Store Management System
// Demo data is saved in the browser using localStorage.
// A Java backend/API is needed to connect this website to MySQL.


// ==========================================
// 1. SAMPLE DATA
// ==========================================

const starterData = {
    products: [
        { id: 1, name: "Hammer", category: "Hand Tools", price: 250, stock: 25 },
        { id: 2, name: "Electric Drill", category: "Power Tools", price: 1850, stock: 8 },
        { id: 3, name: "PVC Pipe", category: "Plumbing", price: 120, stock: 40 },
        { id: 4, name: "Paint Brush", category: "Painting", price: 85, stock: 5 },
        { id: 5, name: "Cement", category: "Construction", price: 285, stock: 32 }
    ],

    customers: [
        { id: 1, name: "Juan Dela Cruz", phone: "09123456789", email: "juan@email.com" }
    ],

    suppliers: [
        { id: 1, name: "ABC Trading", phone: "09223334444", email: "abc@email.com" }
    ],

    sales: [
        {
            id: 1001,
            date: new Date().toISOString().slice(0, 10),
            customer: "Juan Dela Cruz",
            amount: 2500
        }
    ]
};

// Load saved data from localStorage.
let data = JSON.parse(localStorage.getItem("hardwareHubData")) || starterData;


// ==========================================
// 2. GENERAL FUNCTIONS
// ==========================================

function saveData() {
    localStorage.setItem("hardwareHubData", JSON.stringify(data));
    renderAll();
}

function formatMoney(amount) {
    return "₱" + Number(amount).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function safeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return replacements[character];
    });
}

function emptyRow(columns) {
    return `
        <tr>
            <td colspan="${columns}" class="empty">No records found.</td>
        </tr>
    `;
}


// ==========================================
// 3. PAGE NAVIGATION
// ==========================================

function showPage(page) {
    document.querySelectorAll(".page").forEach(section => {
        section.classList.toggle("active", section.id === page);
    });

    document.querySelectorAll(".nav-link").forEach(button => {
        button.classList.toggle("active", button.dataset.page === page);
    });

    const pageNames = {
        dashboard: "Dashboard",
        products: "Products",
        inventory: "Inventory",
        sales: "Sales",
        customers: "Customers",
        suppliers: "Suppliers",
        reports: "Reports"
    };

    document.getElementById("page-title").textContent =
        pageNames[page] || "Dashboard";
}

// Sidebar navigation.
document.querySelectorAll(".nav-link").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});

// Dashboard navigation buttons.
document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.go);
    });
});

// Display today's date.
document.getElementById("today").textContent =
    new Date().toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });


// ==========================================
// 4. DASHBOARD
// ==========================================

function renderDashboard() {
    const totalSales = data.sales.reduce((total, sale) => {
        return total + Number(sale.amount);
    }, 0);

    const lowStock = data.products.filter(product => {
        return product.stock <= 10;
    });

    document.getElementById("total-sales").textContent =
        formatMoney(totalSales);

    document.getElementById("total-products").textContent =
        data.products.length;

    document.getElementById("total-customers").textContent =
        data.customers.length;

    document.getElementById("low-stock").textContent =
        lowStock.length;

    const rows = data.products.slice(0, 5).map(product => {
        const isLowStock = product.stock <= 10;

        return `
            <tr>
                <td>${safeText(product.name)}</td>
                <td>${safeText(product.category)}</td>
                <td>${formatMoney(product.price)}</td>
                <td>${product.stock}</td>
                <td>
                    <span class="pill ${isLowStock ? "low" : ""}">
                        ${isLowStock ? "Low Stock" : "Available"}
                    </span>
                </td>
            </tr>
        `;
    }).join("");

    document.getElementById("dashboard-products").innerHTML =
        rows || emptyRow(5);
}


// ==========================================
// 5. PRODUCTS
// ==========================================

function renderProducts() {
    const search = document.getElementById("product-search")
        .value.toLowerCase();

    const filteredProducts = data.products.filter(product => {
        const productInfo = product.name + " " + product.category;

        return productInfo.toLowerCase().includes(search);
    });

    const rows = filteredProducts.map(product => {
        const isLowStock = product.stock <= 10;

        return `
            <tr>
                <td>${safeText(product.name)}</td>
                <td>${safeText(product.category)}</td>
                <td>${formatMoney(product.price)}</td>
                <td>${product.stock}</td>
                <td>
                    <span class="pill ${isLowStock ? "low" : ""}">
                        ${isLowStock ? "Low Stock" : "Available"}
                    </span>
                </td>
                <td>
                    <button class="secondary-btn"
                        onclick="editProduct(${product.id})">
                        Edit
                    </button>

                    <button class="secondary-btn"
                        onclick="deleteProduct(${product.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    document.getElementById("products-table").innerHTML =
        rows || emptyRow(6);
}

// Edit an existing product.
function editProduct(id) {
    const product = data.products.find(item => item.id === id);

    if (product) {
        openForm("product", product);
    }
}

// Delete a product.
function deleteProduct(id) {
    if (confirm("Delete this product?")) {
        data.products = data.products.filter(product => {
            return product.id !== id;
        });

        saveData();
    }
}


// ==========================================
// 6. INVENTORY
// ==========================================

function renderInventory() {
    const search = document.getElementById("inventory-search")
        .value.toLowerCase();

    const filteredProducts = data.products.filter(product => {
        const productInfo = product.name + " " + product.category;

        return productInfo.toLowerCase().includes(search);
    });

    const rows = filteredProducts.map(product => {
        const isLowStock = product.stock <= 10;

        return `
            <tr>
                <td>${safeText(product.name)}</td>
                <td>${safeText(product.category)}</td>
                <td>${product.stock}</td>
                <td>
                    <span class="pill ${isLowStock ? "low" : ""}">
                        ${isLowStock ? "Restock Needed" : "In Stock"}
                    </span>
                </td>
            </tr>
        `;
    }).join("");

    document.getElementById("inventory-table").innerHTML =
        rows || emptyRow(4);
}


// ==========================================
// 7. CUSTOMERS AND SUPPLIERS
// ==========================================

function renderSimpleTable(tableId, items, fields, columns) {
    const rows = items.map(item => {
        const cells = fields.map(field => {
            return `<td>${safeText(item[field])}</td>`;
        }).join("");

        return `<tr>${cells}</tr>`;
    }).join("");

    document.getElementById(tableId).innerHTML =
        rows || emptyRow(columns);
}


// ==========================================
// 8. SALES
// ==========================================

function renderSales() {
    const rows = data.sales.map(sale => {
        return `
            <tr>
                <td>#${sale.id}</td>
                <td>${safeText(sale.date)}</td>
                <td>${safeText(sale.customer)}</td>
                <td>${formatMoney(sale.amount)}</td>
            </tr>
        `;
    }).join("");

    document.getElementById("sales-table").innerHTML =
        rows || emptyRow(4);
}


// ==========================================
// 9. REPORTS
// ==========================================

function renderReports() {
    const totalSales = data.sales.reduce((total, sale) => {
        return total + Number(sale.amount);
    }, 0);

    const totalStock = data.products.reduce((total, product) => {
        return total + Number(product.stock);
    }, 0);

    document.getElementById("report-sales").textContent =
        data.sales.length;

    document.getElementById("report-units").textContent =
        totalStock;

    document.getElementById("report-suppliers").textContent =
        data.suppliers.length;

    document.getElementById("report-customers").textContent =
        data.customers.length;

    document.getElementById("sales-summary").textContent =
        `Your store has recorded ${data.sales.length} sale(s), with total sales of ${formatMoney(totalSales)}. There are ${data.products.length} products registered in the system.`;
}


// ==========================================
// 10. DISPLAY ALL TABLES AND DATA
// ==========================================

function renderAll() {
    renderDashboard();
    renderProducts();
    renderInventory();
    renderSales();

    renderSimpleTable(
        "customers-table",
        data.customers,
        ["name", "phone", "email"],
        3
    );

    renderSimpleTable(
        "suppliers-table",
        data.suppliers,
        ["name", "phone", "email"],
        3
    );

    renderReports();
}

// Search events.
document.getElementById("product-search")
    .addEventListener("input", renderProducts);

document.getElementById("inventory-search")
    .addEventListener("input", renderInventory);


// ==========================================
// 11. FORM SETTINGS
// ==========================================

const dialog = document.getElementById("data-dialog");
const formFields = document.getElementById("form-fields");

let currentType = "";
let editingId = null;

function openForm(type, item = null) {
    currentType = type;
    editingId = item?.id ?? null;

    const formSettings = {
        product: {
            title: item ? "Edit Product" : "Add Product",
            fields: [
                ["name", "Product Name"],
                ["category", "Category"],
                ["price", "Price", "number"],
                ["stock", "Stock Quantity", "number"]
            ]
        },

        customer: {
            title: "Add Customer",
            fields: [
                ["name", "Customer Name"],
                ["phone", "Contact Number"],
                ["email", "Email"]
            ]
        },

        supplier: {
            title: "Add Supplier",
            fields: [
                ["name", "Supplier Name"],
                ["phone", "Contact Number"],
                ["email", "Email"]
            ]
        },

        sale: {
            title: "Record Sale",
            fields: [
                ["customer", "Customer Name"],
                ["amount", "Sale Amount", "number"]
            ]
        }
    };

    const settings = formSettings[type];

    document.getElementById("dialog-title").textContent =
        settings.title;

    formFields.innerHTML = settings.fields.map(field => {
        const key = field[0];
        const label = field[1];
        const inputType = field[2] || "text";

        const value = safeText(item?.[key] ?? "");
        const numberOptions = inputType === "number"
            ? 'min="0" step="0.01"'
            : "";

        return `
            <div class="field">
                <label for="f-${key}">${label}</label>

                <input
                    id="f-${key}"
                    name="${key}"
                    type="${inputType}"
                    ${numberOptions}
                    required
                    value="${value}"
                >
            </div>
        `;
    }).join("");

    dialog.showModal();
}


// Close the form.
function closeForm() {
    dialog.close();
    formFields.innerHTML = "";
}


// ==========================================
// 12. FORM BUTTONS
// ==========================================

document.getElementById("close-dialog")
    .addEventListener("click", closeForm);

document.getElementById("cancel-dialog")
    .addEventListener("click", closeForm);

document.getElementById("add-product-btn")
    .addEventListener("click", () => {
        openForm("product");
    });

document.getElementById("add-customer-btn")
    .addEventListener("click", () => {
        openForm("customer");
    });

document.getElementById("add-supplier-btn")
    .addEventListener("click", () => {
        openForm("supplier");
    });

document.getElementById("record-sale-btn")
    .addEventListener("click", () => {
        openForm("sale");
    });


// ==========================================
// 13. SAVE FORM DATA
// ==========================================

document.getElementById("data-form").addEventListener("submit", event => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData.entries());

    // Convert price, stock, and amount into numbers.
    Object.keys(values).forEach(key => {
        if (key === "price" || key === "stock" || key === "amount") {
            values[key] = Number(values[key]);
        }
    });

    // Save product.
    if (currentType === "product") {
        if (editingId) {
            data.products = data.products.map(product => {
                return product.id === editingId
                    ? { ...product, ...values }
                    : product;
            });
        } else {
            data.products.push({
                id: Date.now(),
                ...values
            });
        }
    }

    // Save customer.
    else if (currentType === "customer") {
        data.customers.push({
            id: Date.now(),
            ...values
        });
    }

    // Save supplier.
    else if (currentType === "supplier") {
        data.suppliers.push({
            id: Date.now(),
            ...values
        });
    }

    // Record sale.
    else if (currentType === "sale") {
        data.sales.unshift({
            id: Date.now().toString().slice(-6),
            date: new Date().toISOString().slice(0, 10),
            ...values
        });
    }

    closeForm();
    saveData();
});


// ==========================================
// 14. LOAD DATA WHEN THE WEBSITE OPENS
// ==========================================

renderAll();