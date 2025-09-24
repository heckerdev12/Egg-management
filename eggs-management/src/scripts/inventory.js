// inventory.js - robust, uses delegation so it works even if HTML is injected later
(function () {
  const inventory = [];

  /* -------------------- helpers -------------------- */
  function el(id) { return document.getElementById(id); }
  function fmtDate(d) { if (!d) return ''; const dt = new Date(d); return dt.toLocaleDateString('en-GB'); }
  function escapeHtml(s){ return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  /* -------------------- Toast Notification -------------------- */
  function showToast(message, type = 'success') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Show animation
    setTimeout(() => toast.classList.add('toast-show'), 200);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 900);
    }, 6000);
  }

  /* -------------------- View Details Modal -------------------- */
  function showViewModal(item) {
    // Remove existing view modal if any
    const existingModal = document.querySelector('#viewInventoryModal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'viewInventoryModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">
            <span>👁️</span>
            Inventory Details
          </h3>
          <button class="close-btn" data-action="close-view-modal">✖</button>
        </div>
        <div class="inventory-form">
          <div class="form-group">
            <label>Supplier Name</label>
            <div class="form-display">${escapeHtml(item.supplierName)}</div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Trays</label>
              <div class="form-display">${escapeHtml(item.trays)}</div>
            </div>
            <div class="form-group">
              <label>Quantity (pieces)</label>
              <div class="form-display">${escapeHtml(item.quantity)}</div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Delivery Date</label>
              <div class="form-display">${fmtDate(item.deliveryDate)}</div>
            </div>
            <div class="form-group">
              <label>Added On</label>
              <div class="form-display">${fmtDate(item.createdAt)}</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
  }

  function closeViewModal() {
    const modal = document.querySelector('#viewInventoryModal');
    if (modal) {
      modal.style.display = 'none';
      setTimeout(() => modal.remove(), 300);
    }
  }

  /* -------------------- Delete Confirmation Modal -------------------- */
  function showDeleteModal(item, index) {
    // Remove existing delete modal if any
    const existingModal = document.querySelector('#deleteInventoryModal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'deleteInventoryModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content modal-small">
        <div class="modal-header">
          <h3 class="modal-title">
            <span>🗑️</span>
            Delete Inventory
          </h3>
          <button class="close-btn" data-action="close-delete-modal">✖</button>
        </div>
        <div class="inventory-form">
          <div class="delete-confirmation">
            <p>Are you sure you want to delete this inventory record?</p>
            <div class="delete-item-info">
              <strong>Supplier:</strong> ${escapeHtml(item.supplierName)}<br>
              <strong>Trays:</strong> ${escapeHtml(item.trays)} Trays<br>
              <strong>Quantity:</strong> ${escapeHtml(item.quantity)} pieces<br>
              <strong>Delivery Date:</strong> ${fmtDate(item.deliveryDate)}
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-danger" data-action="confirm-delete" data-index="${index}">Delete</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
  }

  function closeDeleteModal() {
    const modal = document.querySelector('#deleteInventoryModal');
    if (modal) {
      modal.style.display = 'none';
      setTimeout(() => modal.remove(), 300);
    }
  }

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
      const trayClass = `tray-type ${escapeHtml(it.trays || '')}`;
      return `
        <tr>
          <td class="supplier-info">
            <div class="supplier-name">${escapeHtml(it.supplierName)}</div>
          </td>
          <td class="${trayClass}">${it.trays}</td>
          <td class="quantity-info">
            <div class="quantity-number">${it.quantity}</div>
          </td>
          <td class="date-info">${fmtDate(it.deliveryDate)}</td>
          <td class="action-buttons">
            <button class="btn btn-icon action-btn view-btn" data-action="view" data-index="${idx}">👁️</button>
            <button class="btn btn-icon action-btn delete-btn" data-action="delete" data-index="${idx}">🗑️</button>
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
    const fullTrays = inventory.filter(i => i.trays === 'full').length;
    const partialTrays = inventory.filter(i => i.trays === 'partial').length;
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
    // tolerant reads (works if missing in your HTML)
    const supplierName = (el('supplierName')?.value || '').trim();
    const trays = parseInt(el('trays')?.value || '0', 10) || 0;
    const quantity = parseInt(el('pieces')?.value || '0', 10) || 0;
    const deliveryDate = el('deliveryDate')?.value || '';

    if (!supplierName || !trays || !quantity || !deliveryDate) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const newItem = {
      id: Date.now(),
      supplierName, trays, quantity, deliveryDate, createdAt: new Date().toISOString()
    };

    inventory.push(newItem);
    renderInventory();
    updateStats();
    closeAddInventoryModal();
    showToast('Inventory added successfully!', 'success');
  }

  function deleteInventoryItem(index) {
    if (isNaN(index) || !inventory[index]) return;
    
    inventory.splice(index, 1);
    renderInventory();
    updateStats();
    closeDeleteModal();
    showToast('Inventory deleted successfully!', 'success');
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
      const viewModal = document.querySelector('#viewInventoryModal');
      const deleteModal = document.querySelector('#deleteInventoryModal');
      
      if (viewModal && viewModal.contains(target)) {
        closeViewModal();
      } else if (deleteModal && deleteModal.contains(target)) {
        closeDeleteModal();
      } else {
        closeAddInventoryModal();
      }
      return;
    }

    // cancel button
    if (target.closest && target.closest('#cancelInventoryBtn')) {
      ev.preventDefault();
      closeAddInventoryModal();
      return;
    }

    // View modal actions - REMOVE THIS SECTION
    // Delete modal actions - REMOVE THIS SECTION

    if (target.closest && target.closest('[data-action="confirm-delete"]')) {
      const index = parseInt(target.closest('[data-action="confirm-delete"]').dataset.index, 10);
      deleteInventoryItem(index);
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
        showViewModal(item);
      } else if (action === 'delete') {
        showDeleteModal(item, index);
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
    const addModal = el('addInventoryModal');
    const viewModal = document.querySelector('#viewInventoryModal');
    const deleteModal = document.querySelector('#deleteInventoryModal');
    
    if (addModal && ev.target === addModal) closeAddInventoryModal();
    if (viewModal && ev.target === viewModal) closeViewModal();
    if (deleteModal && ev.target === deleteModal) closeDeleteModal();
  });

  // initial render if elements already present
  document.addEventListener('DOMContentLoaded', function () {
    renderInventory();
    updateStats();
    console.log('Inventory module ready');
  });

})();