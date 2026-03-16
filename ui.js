// ui.js
// Общие функции для интерфейса: рендер списка, статуса, тостов и т.д.

export function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;

  toast.classList.remove("toast-visible");
  void toast.offsetWidth;

  toast.classList.add("toast-visible");

  const timeoutMs = type === "error" ? 4000 : 2500;

  setTimeout(() => {
    toast.classList.remove("toast-visible");
  }, timeoutMs);
}

export const STATUS_LABELS = {
  NEW: "Новый",
  CONFIRMED: "Подтверждён",
  COMPLETED: "Завершён",
  CANCELLED: "Отменён"
};

export function getStatusClass(status) {
  switch (status) {
    case "NEW":
      return "status-new";
    case "CONFIRMED":
      return "status-confirmed";
    case "COMPLETED":
      return "status-completed";
    case "CANCELLED":
      return "status-cancelled";
    default:
      return "status-new";
  }
}

export function createStatusPill(status) {
  const pill = document.createElement("div");
  pill.className = `status-pill ${getStatusClass(status)}`;
  pill.setAttribute("aria-label", STATUS_LABELS[status] || status);

  const dot = document.createElement("span");
  dot.className = "status-pill-dot";

  const text = document.createElement("span");
  text.textContent = status;

  const tooltip = document.createElement("div");
  tooltip.className = "status-tooltip";
  tooltip.textContent = STATUS_LABELS[status] || status;

  pill.appendChild(dot);
  pill.appendChild(text);
  pill.appendChild(tooltip);

  return pill;
}

export function createBookingListItem(booking) {
  const item = document.createElement("div");
  item.className = "booking-item";

  const main = document.createElement("div");
  main.className = "booking-main";

  const title = document.createElement("div");
  title.className = "booking-title";
  title.textContent = `${booking.fullName} — ${booking.phone}`;

  const subtitle = document.createElement("div");
  subtitle.className = "booking-subtitle";
  subtitle.textContent = `${booking.date} • ${booking.timeSlot}`;

  main.appendChild(title);
  main.appendChild(subtitle);

  const statusPill = createStatusPill(booking.status);

  item.appendChild(main);
  item.appendChild(statusPill);

  item.addEventListener("click", () => {
    window.location.href = `details.html?id=${encodeURIComponent(booking.id)}`;
  });

  return item;
}

export function renderBookingList(allBookings, filterStatus) {
  const listContainer = document.getElementById("bookingList");
  const emptyState = document.getElementById("emptyState");
  const countEl = document.getElementById("bookingCount");

  if (!listContainer) return;

  listContainer.innerHTML = "";

  const filtered =
    filterStatus === "ALL"
      ? allBookings
      : allBookings.filter((b) => b.status === filterStatus);

  filtered.forEach((booking) => {
    const item = createBookingListItem(booking);
    listContainer.appendChild(item);
  });

  if (countEl) {
    countEl.textContent = `${filtered.length} шт.`;
  }

  if (emptyState) {
    emptyState.classList.toggle("hidden", filtered.length > 0);
  }
}

export function renderBookingDetails(booking) {
  const fullNameEl = document.getElementById("detailsFullName");
  const phoneEl = document.getElementById("detailsPhone");
  const subtitleEl = document.getElementById("detailsSubtitle");
  const statusContainer = document.getElementById("detailsStatusIndicator");
  const listEl = document.getElementById("detailsList");

  if (fullNameEl) fullNameEl.textContent = booking.fullName || "Без имени";
  if (phoneEl) phoneEl.textContent = booking.phone || "—";
  if (subtitleEl) {
    subtitleEl.textContent = `${booking.date || ""} • ${
      booking.timeSlot || ""
    }`;
  }

  if (statusContainer) {
    statusContainer.innerHTML = "";
    statusContainer.appendChild(createStatusPill(booking.status));
  }

  if (!listEl) return;
  listEl.innerHTML = "";

  const fieldMap = [
    ["Тип оборудования", "equipmentType"],
    ["Пол", "gender"],
    ["Возраст", "age"],
    ["Рост (см)", "heightCm"],
    ["Вес (кг)", "weightKg"],
    ["Размер обуви", "shoeSize"],
    ["Размер головного убора (см)", "hatSizeCm"],
    ["Дата", "date"],
    ["Временной слот", "timeSlot"],
    ["Статус", "status"]
  ];

  fieldMap.forEach(([label, key]) => {
    const dt = document.createElement("dt");
    dt.textContent = label;

    const dd = document.createElement("dd");
    if (key === "status") {
      dd.textContent = STATUS_LABELS[booking.status] || booking.status;
    } else {
      const value = booking[key];
      dd.textContent =
        value !== undefined && value !== null && value !== "" ? value : "—";
    }

    listEl.appendChild(dt);
    listEl.appendChild(dd);
  });
}

export function renderBookingActions(booking, onAction) {
  const actionsContainer = document.getElementById("detailsActions");
  if (!actionsContainer) return;

  actionsContainer.innerHTML = "";

  const status = booking.status;

  const addButton = (label, type, actionStatus) => {
    const btn = document.createElement("button");
    btn.className = `btn ${
      type === "danger" ? "btn-destructive" : "btn-primary"
    }`;
    btn.textContent = label;
    btn.addEventListener("click", () => onAction(actionStatus));
    actionsContainer.appendChild(btn);
  };

  if (status === "NEW") {
    addButton("Отмена", "danger", "CANCELLED");
    addButton("Выдача", "primary", "CONFIRMED");
  } else if (status === "CONFIRMED") {
    addButton("Забрать", "primary", "COMPLETED");
  }
}

