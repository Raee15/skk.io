(function () {
  const STORAGE_KEY = "sk_tulong_requests";

  const totalEl = document.getElementById("totalRequests");
  const pendingEl = document.getElementById("pendingRequests");
  const approvedEl = document.getElementById("approvedRequests");
  const rejectedEl = document.getElementById("rejectedRequests");
  const tbody = document.getElementById("requestsBody");
  const emptyState = document.getElementById("requestsEmpty");
  const searchInput = document.getElementById("reqSearch");
  const statusFilter = document.getElementById("reqStatusFilter");
  const toast = document.getElementById("toast");

  const STATUS_STYLES = {
    pending: { bg: "#fff7ed", color: "#c2410c" },
    approved: { bg: "#ecfdf5", color: "#047857" },
    rejected: { bg: "#fef2f2", color: "#b91c1c" }
  };

  function getRequests() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function saveRequests(requests) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  }

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value == null ? "" : String(value);
    return div.innerHTML;
  }

  function formatDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.style.opacity = "1";
    toast.style.pointerEvents = "auto";
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.style.opacity = "0";
      toast.style.pointerEvents = "none";
    }, 2200);
  }

  function updateStats(requests) {
    totalEl.textContent = requests.length;
    pendingEl.textContent = requests.filter(function (r) { return r.status === "pending"; }).length;
    approvedEl.textContent = requests.filter(function (r) { return r.status === "approved"; }).length;
    rejectedEl.textContent = requests.filter(function (r) { return r.status === "rejected"; }).length;
  }

  // This is the piece that closes the loop with the user side:
  // it updates the *same* localStorage array that requests.html
  // reads, so once the SK Secretary approves/rejects here, the
  // user sees the new status the next time they open "My Requests".
  function setStatus(id, status) {
    const requests = getRequests();
    const target = requests.find(function (r) { return r.id === id; });
    if (!target) return;
    target.status = status;
    target.updatedAt = new Date().toISOString();
    saveRequests(requests);
    showToast("Request marked as " + status + ".");
    render();
  }

  function statusPill(status) {
    const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
    return '<span style="display:inline-block;padding:4px 10px;border-radius:999px;font-size:0.78rem;font-weight:700;text-transform:capitalize;background:' +
      style.bg + ";color:" + style.color + ';">' + escapeHtml(status) + "</span>";
  }

  function actionButtons(r) {
    const approveDisabled = r.status === "approved" ? "disabled style=\"opacity:0.5;cursor:not-allowed;\"" : "";
    const rejectDisabled = r.status === "rejected" ? "disabled style=\"opacity:0.5;cursor:not-allowed;\"" : "";
    return (
      '<button type="button" class="btn-approve" data-id="' + escapeHtml(r.id) + '" ' + approveDisabled +
      ' style="margin-right:6px;padding:6px 12px;border:none;border-radius:6px;background:#047857;color:#fff;font-weight:600;cursor:pointer;">Approve</button>' +
      '<button type="button" class="btn-reject" data-id="' + escapeHtml(r.id) + '" ' + rejectDisabled +
      ' style="padding:6px 12px;border:none;border-radius:6px;background:#b91c1c;color:#fff;font-weight:600;cursor:pointer;">Reject</button>'
    );
  }

  function render() {
    const requests = getRequests();
    updateStats(requests);

    const query = (searchInput.value || "").trim().toLowerCase();
    const statusValue = statusFilter.value;

    const filtered = requests
      .slice()
      .sort(function (a, b) { return new Date(b.submittedAt) - new Date(a.submittedAt); })
      .filter(function (r) {
        const matchesQuery = !query ||
          (r.fullName || "").toLowerCase().indexOf(query) !== -1 ||
          (r.userEmail || "").toLowerCase().indexOf(query) !== -1;
        const matchesStatus = statusValue === "all" || r.status === statusValue;
        return matchesQuery && matchesStatus;
      });

    tbody.innerHTML = "";
    emptyState.style.display = filtered.length === 0 ? "block" : "none";

    filtered.forEach(function (r) {
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + escapeHtml(r.fullName) + "<br><small style=\"color:#8b909c;\">" + escapeHtml(r.userEmail) + "</small></td>" +
        "<td>" + escapeHtml(r.age) + "</td>" +
        "<td>" + escapeHtml(r.address) + "</td>" +
        "<td>" + escapeHtml(r.contact) + "</td>" +
        "<td>" + escapeHtml(r.assistanceType) + "</td>" +
        "<td style=\"max-width:220px;white-space:normal;\">" + escapeHtml(r.details) + "</td>" +
        "<td>" + formatDate(r.submittedAt) + "</td>" +
        "<td>" + statusPill(r.status) + "</td>" +
        "<td>" + actionButtons(r) + "</td>";
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".btn-approve").forEach(function (btn) {
      btn.addEventListener("click", function () { setStatus(btn.dataset.id, "approved"); });
    });
    tbody.querySelectorAll(".btn-reject").forEach(function (btn) {
      btn.addEventListener("click", function () { setStatus(btn.dataset.id, "rejected"); });
    });
  }

  searchInput.addEventListener("input", render);
  statusFilter.addEventListener("change", render);

  render();
})();