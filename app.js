// app.js
// Точка входа. Определяет, какую страницу инициализировать, и содержит бизнес-логику.

import {
  fetchAllBookings,
  fetchBookingById,
  updateBookingStatus
} from "./firebase.js";

import {
  showToast,
  renderBookingList,
  renderBookingDetails,
  renderBookingActions
} from "./ui.js";

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Вспомогательная функция: получить числовое значение даты/времени
// для сортировки (более свежие заявки выше).
function getBookingDateValue(booking) {
  if (!booking || !booking.date) return 0;

  const date = new Date(booking.date);
  if (Number.isNaN(date.getTime())) return 0;

  let minutesOffset = 0;

  if (booking.timeSlot && typeof booking.timeSlot === "string") {
    // Ожидается формат типа "10:00–11:00" или "10:00-11:00"
    const match = booking.timeSlot.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        minutesOffset = hours * 60 + minutes;
      }
    }
  }

  return date.getTime() + minutesOffset * 60 * 1000;
}

async function initListPage() {
  let allBookings = [];
  let currentFilter = "ALL";
  let sortDirection = "desc"; // desc = новые сверху, asc = старые сверху

  const tabButtons = document.querySelectorAll(".tab-button");
  const sortButton = document.querySelector(".sort-indicator");

  const applySort = () => {
    allBookings.sort((a, b) => {
      const av = getBookingDateValue(a);
      const bv = getBookingDateValue(b);
      return sortDirection === "desc" ? bv - av : av - bv;
    });
  };

  const applyFilter = (status) => {
    currentFilter = status;
    tabButtons.forEach((btn) => {
      btn.classList.toggle("tab-active", btn.dataset.status === status);
    });
    applySort();
    renderBookingList(allBookings, currentFilter);
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const status = btn.dataset.status || "ALL";
      applyFilter(status);
    });
  });

  if (sortButton) {
    const labelEl = sortButton.querySelector(".sort-indicator-label");
    sortButton.addEventListener("click", () => {
      // Переключаем направление сортировки
      sortDirection = sortDirection === "desc" ? "asc" : "desc";

      // Обновляем надпись
      if (labelEl) {
        labelEl.textContent =
          sortDirection === "desc" ? "Новые сверху" : "Старые сверху";
      }

      applySort();
      renderBookingList(allBookings, currentFilter);
    });
  }

  try {
    allBookings = await fetchAllBookings();

    // Изначально сортируем по убыванию даты (новые сверху)
    applySort();

    renderBookingList(allBookings, currentFilter);
  } catch (error) {
    console.error("Ошибка при загрузке заявок:", error);
    showToast(
      "Не удалось загрузить список заявок. Проверьте соединение и настройки Firebase.",
      "error"
    );
  }
}

async function initDetailsPage() {
  const backButton = document.getElementById("backButton");
  if (backButton) {
    backButton.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  const id = getQueryParam("id");
  if (!id) {
    showToast("Не указан идентификатор заявки в адресной строке.", "error");
    return;
  }

  let currentBooking = null;

  const loadBooking = async () => {
    try {
      const booking = await fetchBookingById(id);
      if (!booking) {
        showToast(
          "Заявка не найдена. Проверьте, что документ существует.",
          "error"
        );
        return;
      }
      currentBooking = booking;
      renderBookingDetails(booking);
      renderBookingActions(booking, handleStatusChange);
    } catch (error) {
      console.error("Ошибка при загрузке заявки:", error);
      showToast(
        "Не удалось загрузить данные заявки. Проверьте соединение и настройки Firebase.",
        "error"
      );
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!currentBooking) return;

    const previousStatus = currentBooking.status;
    currentBooking.status = newStatus;
    renderBookingDetails(currentBooking);
    renderBookingActions(currentBooking, handleStatusChange);

    try {
      await updateBookingStatus(currentBooking.id, newStatus);
      showToast("Статус заявки успешно обновлён.");
      renderBookingActions(currentBooking, handleStatusChange);
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error);
      currentBooking.status = previousStatus;
      renderBookingDetails(currentBooking);
      renderBookingActions(currentBooking, handleStatusChange);
      showToast("Не удалось обновить статус. Попробуйте ещё раз.", "error");
    }
  };

  await loadBooking();
}

document.addEventListener("DOMContentLoaded", () => {
  const pageType = document.body.dataset.page;

  if (pageType === "list") {
    initListPage();
  } else if (pageType === "details") {
    initDetailsPage();
  } else {
    console.warn(
      "Неизвестный тип страницы. Убедитесь, что body имеет атрибут data-page."
    );
  }
});

