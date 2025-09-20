// inventory.js - robust, uses delegation so it works even if HTML is injected later
(function () {
  const inventory = [];

  /* -------------------- helpers -------------------- */
  function el(id) { return document.getElementById(id); }
  function fmtDate(d) { if (!d) return ''; const dt = new Date(d); return dt.toLocaleDateString('en-GB'); }
  function escapeHtml(s){ return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  /* -------------------- modal control -------------------- */
  function showAddInventoryModal() {
    const modal = el('addInventoryModal');
    if (!modal) return console.warn('Modal element not found (#addInventoryModal)');
    modal.style.display = 'flex';
    const form = el('inventoryForm');
    if (form) form.reset();
    const delivery = el('deliveryDate');
    if (delivery) delivery.value = new Date().toISOString().split('T')[0];
  }

  function closeAddInventoryModal() {
    const modal = el('addInventoryModal');
    if (modal) modal.style.display = 'none';
  }

  /* -------------------- render / stats -------------------- */
  function renderInventory() {
    const tbody = el('inventoryTableBody');
    if (!tbody) return;
    tbody.innerHTML = inventory.map((it, idx) => {
      const trayLabel = it.trayType === 'full' ? 'Full (30)' : it.trayType === 'partial' ? 'Partial' : 'Empty';
      const trayClass = `tray-type ${escapeHtml(it.trayType || '')}`;
      const trays = Math.floor(it.quantity / 30);
      return `
        <tr>
          <td class="supplier-info">
            <div class="supplier-name">${escapeHtml(it.supplierName)}</div>
            <div class="supplier-id">#${it.id}</div>
          </td>
          <td class="${trayClass}">${trayLabel}</td>
          <td class="quantity-info">
            <div class="quantity-number">${it.quantity}</div>
            <div class="quantity-trays">${trays} tray(s)</div>
          </td>
          <td class="date-info">${fmtDate(it.deliveryDate)}</td>
          <td class="action-buttons">
            <button class="btn btn-icon" data-action="view" data-index="${idx}">👁️</button>
            <button class="btn btn-icon" data-action="delete" data-index="${idx}">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function updateStats() {
    const totalEggsEl = el('totalEggs');
    const fullTraysEl = el('fullTrays');
    const partialTraysEl = el('partialTrays');
    const thisMonthEggsEl = el('thisMonthEggs');
    if (!totalEggsEl) return;

    const totalEggs = inventory.reduce((s, i) => s + (i.quantity || 0), 0);
    const fullTrays = inventory.filter(i => i.trayType === 'full').length;
    const partialTrays = inventory.filter(i => i.trayType === 'partial').length;
    const now = new Date();
    const thisMonthEggs = inventory
      .filter(i => {
        const d = new Date(i.deliveryDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, i) => s + (i.quantity || 0), 0);

    totalEggsEl.textContent = totalEggs;
    if (fullTraysEl) fullTraysEl.textContent = fullTrays;
    if (partialTraysEl) partialTraysEl.textContent = partialTrays;
    if (thisMonthEggsEl) thisMonthEggsEl.textContent = thisMonthEggs;
  }

  /* -------------------- actions -------------------- */
  function addInventoryFromForm(formEl) {
    // tolerant reads (works if expiryDate missing in your HTML)
    const supplierName = (el('supplierName')?.value || '').trim();
    const trayType = el('trayType')?.value || '';
    const quantity = parseInt(el('quantity')?.value || '0', 10) || 0;
    const price = parseFloat(el('price')?.value || '0') || 0;
    const deliveryDate = el('deliveryDate')?.value || '';
    const expiryDate = el('expiryDate') ? el('expiryDate').value : null;
    const notes = (el('inventoryNotes')?.value || '').trim();

    if (!supplierName || !trayType || !quantity || !price || !deliveryDate) {
      alert('Please fill in all required fields');
      return;
    }

    const newItem = {
      id: Date.now(),
      supplierName, trayType, quantity, price, deliveryDate, expiryDate, notes, createdAt: new Date().toISOString()
    };

    inventory.push(newItem);
    renderInventory();
    updateStats();
    closeAddInventoryModal();
    alert('Inventory added successfully!');
  }

  /* -------------------- event delegation -------------------- */
  document.addEventListener('click', function (ev) {
    const target = ev.target;

    // open modal
    if (target.closest && target.closest('#addInventoryBtn')) {
      ev.preventDefault();
      showAddInventoryModal();
      return;
    }

    // close modal via X or close button
    if (target.closest && (target.closest('#closeInventoryModalBtn') || target.closest('.close-btn'))) {
      ev.preventDefault();
      closeAddInventoryModal();
      return;
    }

    // cancel button
    if (target.closest && target.closest('#cancelInventoryBtn')) {
      ev.preventDefault();
      closeAddInventoryModal();
      return;
    }

    // actions inside table (view/delete)
    const actionBtn = target.closest && target.closest('[data-action]');
    if (actionBtn) {
      const action = actionBtn.dataset.action;
      const index = parseInt(actionBtn.dataset.index, 10);
      if (isNaN(index)) return;
      const item = inventory[index];
      if (!item) return;

      if (action === 'view') {
        alert(
          `Inventory Details:\n\nSupplier: ${item.supplierName}\nType: ${item.trayType}\nQty: ${item.quantity}\nDelivery: ${fmtDate(item.deliveryDate)}\nExpiry: ${item.expiryDate ? fmtDate(item.expiryDate) : 'N/A'}\nPrice: KSh ${item.price}\nNotes: ${item.notes || 'None'}`
        );
      } else if (action === 'delete') {
        if (confirm(`Delete inventory from ${item.supplierName}?`)) {
          inventory.splice(index, 1);
          renderInventory();
          updateStats();
        }
      }
    }
  });

  // catch submit from inventory form (works even if form is injected later)
  document.addEventListener('submit', function (ev) {
    const formEl = ev.target;
    if (!formEl || formEl.id !== 'inventoryForm') return;
    ev.preventDefault();
    addInventoryFromForm(formEl);
  });

  // close modal when clicking outside it
  window.addEventListener('click', function (ev) {
    const modal = el('addInventoryModal');
    if (modal && ev.target === modal) closeAddInventoryModal();
  });

  // initial render if elements already present
  document.addEventListener('DOMContentLoaded', function () {
    renderInventory();
    updateStats();
    console.log('Inventory module ready');
  });

})();
