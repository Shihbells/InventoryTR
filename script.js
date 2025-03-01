document.addEventListener("DOMContentLoaded", function () {
    function updateDateTime() {
        const dateElement = document.getElementById("current-date");
        const today = new Date();

        const formattedDate = today.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        const formattedTime = today.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });

        dateElement.innerHTML = `Date: ${formattedDate} <br> Time: ${formattedTime}`;
    }

    setInterval(updateDateTime, 1000);
    updateDateTime();

    const addButton = document.querySelector('.menubar-add-button');
    const removeButton = document.querySelector('.menubar-remove-button');
    const exportButton = document.querySelector('.export-button');
    const tableBody = document.querySelector('.list table tbody');
    const sortButton = document.querySelector('.sort-button');

    function saveInventory() {
        const inventory = [];
        document.querySelectorAll(".list table tbody tr").forEach((row) => {
            inventory.push({
                category: row.querySelector(".item-category").value,
                name: row.querySelector(".item-name").textContent,
                quantity: row.querySelector(".item-quantity").textContent,
                status: row.querySelector(".item-status").textContent,
            });
        });
        localStorage.setItem("inventoryData", JSON.stringify(inventory));
    }

    function loadInventory() {
        const savedData = localStorage.getItem("inventoryData");
        if (savedData) {
            const inventory = JSON.parse(savedData);
            inventory.forEach((item) => addRow(item.category, item.name, item.quantity));
        }
    }

    function updateStatus(row) {
        const quantityCell = row.querySelector('.item-quantity');
        const statusCell = row.querySelector('.item-status');
        let quantity = parseInt(quantityCell.textContent) || 0;

        if (quantity >= 8) {
            statusCell.textContent = "High";
            statusCell.className = "item-status high";
        } else if (quantity <= 3) {
            statusCell.textContent = "Low";
            statusCell.className = "item-status low";
        } else {
            statusCell.textContent = "Medium";
            statusCell.className = "item-status medium";
        }
    }

    function addRow(category = "Kitchen", name = "Enter Name", quantity = 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <select class="item-category">
                    <option value="Kitchen" ${category === "Kitchen" ? "selected" : ""}>Kitchen</option>
                    <option value="Bar" ${category === "Bar" ? "selected" : ""}>Bar</option>
                    <option value="Pastry" ${category === "Pastry" ? "selected" : ""}>Pastry</option>
                </select>
            </td>
            <td contenteditable="true" class="item-name">${name}</td>
            <td contenteditable="true" class="item-quantity">${quantity}</td>
            <td class="item-status">Low</td>
        `;

        row.querySelector('.item-quantity').addEventListener('input', () => {
            updateStatus(row);
            saveInventory();
        });

        tableBody.appendChild(row);
        updateStatus(row);
        saveInventory();
    }

    addButton.addEventListener('click', () => addRow());

    removeButton.addEventListener('click', function () {
        const rows = tableBody.querySelectorAll('tr');
        if (rows.length > 0) {
            rows[rows.length - 1].remove();
            saveInventory();
        }
    });

    if (sortButton) {
        sortButton.addEventListener('click', function () {
            let rows = Array.from(document.querySelectorAll(".list table tbody tr"));

            rows.sort((a, b) =>
                a.querySelector(".item-name").textContent.localeCompare(b.querySelector(".item-name").textContent)
            );

            rows.forEach(row => tableBody.appendChild(row));
        });
    }

    exportButton.addEventListener("click", function () {
        let receiptWindow = window.open("", "", "width=400,height=600");

        let today = new Date();
        let formattedDate = today.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        let formattedTime = today.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });

        let receiptContent = `
            <html>
            <head>
                <style>
                    body { font-family: 'Courier New', Courier, monospace; text-align: center; padding: 20px; }
                    h2 { margin-bottom: 10px; }
                    .receipt-container { border: 1px dashed black; padding: 15px; width: 90%; margin: auto; }
                    table { width: 100%; margin-top: 10px; border-collapse: collapse; }
                    th, td { border-bottom: 1px dashed black; padding: 5px; text-align: left; }
                    .total { font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    <h2>🛒 Inventory</h2>
                    <p>Date: ${formattedDate}</p>
                    <p>Time: ${formattedTime}</p>
                    <hr>
                    <table>
                        <tr>
                            <th>#</th>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Status</th>
                        </tr>`;

        document.querySelectorAll(".list table tbody tr").forEach((row, index) => {
            let name = row.querySelector(".item-name").textContent;
            let quantity = row.querySelector(".item-quantity").textContent;
            let status = row.querySelector(".item-status").textContent;

            receiptContent += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${name}</td>
                    <td>${quantity}</td>
                    <td>${status}</td>
                </tr>`;
        });

        receiptContent += `
                    </table>
                    <p class="total">Total Items: ${document.querySelectorAll(".list table tbody tr").length}</p>
                    <p>Thank you for using the system!</p>
                </div>
                <script>window.print();</script>
            </body>
            </html>`;

        receiptWindow.document.write(receiptContent);
        receiptWindow.document.close();
    });

    loadInventory();
});