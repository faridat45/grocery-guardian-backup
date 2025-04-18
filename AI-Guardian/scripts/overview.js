document.addEventListener('DOMContentLoaded', () => {
    let chartInstance = null;
    const receipts = JSON.parse(localStorage.getItem('receipts')) || [];
    const monthSelector = document.getElementById('monthSelector');
    const receiptList = document.getElementById('receiptList');
    const monthlySummary = document.getElementById('monthlySummary');
    const monthlyChartCanvas = document.getElementById('monthlyChart');

    const monthlyData = {};

    // Group receipts by month and accumulate data
    receipts.forEach(r => {
        const month = r.date.slice(0, 7); // Format: "YYYY-MM"
        if (!monthlyData[month]) {
            monthlyData[month] = { total: 0, items: {}, receipts: [] };
        }

        monthlyData[month].total += r.total;

        r.items.forEach(item => {
            if (!monthlyData[month].items[item.name]) {
                monthlyData[month].items[item.name] = { count: 0, total: 0 };
            }
            monthlyData[month].items[item.name].count++;
            monthlyData[month].items[item.name].total += item.price;
        });

        monthlyData[month].receipts.push(r);
    });

    // Populate dropdown
    Object.keys(monthlyData).sort().forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = new Date(month + "-01").toLocaleString('default', {
            month: 'long',
            year: 'numeric'
        });
        monthSelector.appendChild(option);
    });

    // When month selected
    monthSelector.addEventListener('change', () => {
        const selected = monthSelector.value;
        if (!selected || !monthlyData[selected]) return;

        const data = monthlyData[selected];
        renderReceipts(data.receipts);
        renderSummary(data);
    });

    // Show all receipts
    function renderReceipts(receipts) {
        receiptList.innerHTML = '<h3>Receipts</h3>';
        receipts.forEach((r, index) => {
            const div = document.createElement('div');
            div.classList.add('receipt-entry');
    
            div.innerHTML = `
                <button class="receipt-toggle" data-index="${index}">
                    <strong>${r.vendor}</strong> — ${r.date} (€${r.total.toFixed(2)})
                </button>
                <div class="receipt-details hidden" id="details-${index}">
                    <ul>
                        ${r.items.map((i, iIndex) =>
                            `<li>
                                <input type="text" value="${i.name}" data-receipt="${index}" data-item="${iIndex}" class="edit-name" />
                                €<input type="number" value="${i.price}" data-receipt="${index}" data-item="${iIndex}" class="edit-price" step="0.01" />
                            </li>`).join('')}
                    </ul>
                    <label>Vendor: <input type="text" value="${r.vendor}" data-receipt="${index}" class="edit-vendor" /></label><br>
                    <label>Date: <input type="date" value="${r.date}" data-receipt="${index}" class="edit-date" /></label><br>
                    <button class="save-receipt" data-index="${index}">Save</button>
                    <button class="delete-receipt" data-index="${index}">Delete</button>
                    <hr>
                </div>
            `;
            receiptList.appendChild(div);
        });
    
        // Toggle collapse
        document.querySelectorAll('.receipt-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.dataset.index;
                const details = document.getElementById(`details-${index}`);
                details.classList.toggle('hidden');
            });
        });
    
        // Save edited receipt
        document.querySelectorAll('.save-receipt').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.dataset.index;
                const allReceipts = JSON.parse(localStorage.getItem('receipts')) || [];
    
                const updatedReceipt = allReceipts[index];
                updatedReceipt.vendor = document.querySelector(`.edit-vendor[data-receipt="${index}"]`).value;
                updatedReceipt.date = document.querySelector(`.edit-date[data-receipt="${index}"]`).value;
    
                updatedReceipt.items.forEach((item, i) => {
                    item.name = document.querySelector(`.edit-name[data-receipt="${index}"][data-item="${i}"]`).value;
                    item.price = parseFloat(document.querySelector(`.edit-price[data-receipt="${index}"][data-item="${i}"]`).value);
                });
    
                updatedReceipt.total = updatedReceipt.items.reduce((sum, i) => sum + i.price, 0);
                localStorage.setItem('receipts', JSON.stringify(allReceipts));
    
                alert("Receipt updated!");
                monthSelector.dispatchEvent(new Event('change')); // refresh view
            });
        });
    
        // Delete receipt
        document.querySelectorAll('.delete-receipt').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.dataset.index;
                const allReceipts = JSON.parse(localStorage.getItem('receipts')) || [];
        
                if (confirm("Are you sure you want to delete this receipt?")) {
                    allReceipts.splice(index, 1);
                    localStorage.setItem('receipts', JSON.stringify(allReceipts));
        
                    // Remove the DOM node immediately
                    const receiptEntry = btn.closest('.receipt-entry');
                    if (receiptEntry) receiptEntry.remove();
        
                    alert("Receipt deleted.");
                }
            });
        });
        
    }
    
    

    // Show monthly summary and draw chart
    function renderSummary(data) {
        monthlySummary.innerHTML = '<h3>Monthly Summary</h3>';

        const topItems = Object.entries(data.items)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([name, info]) => `${name} (x${info.count}, €${info.total.toFixed(2)})`);

        monthlySummary.innerHTML += `
            <p><strong>Total Spent:</strong> €${data.total.toFixed(2)}</p>
            <p><strong>Top Items:</strong> ${topItems.join(', ')}</p>
        `;

        // Chart total spent by month
        const labels = Object.keys(monthlyData).sort();
        const values = labels.map(m => monthlyData[m].total.toFixed(2));

        if (chartInstance) {
            chartInstance.destroy();
        }
        
        chartInstance = new Chart(monthlyChartCanvas, {
            type: 'bar',
            data: {
                labels: Object.keys(monthlyData).sort().map(m =>
                    new Date(m + "-01").toLocaleString('default', { month: 'short', year: 'numeric' })
                ),
                datasets: [{
                    label: 'Total Spent (€)',
                    data: Object.keys(monthlyData).sort().map(m => monthlyData[m].total.toFixed(2)),
                    backgroundColor: '#4caf50'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
        
    }
});
