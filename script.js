/**
 * Chuẩn hóa chuỗi tiếng Việt: Bỏ dấu tiếng Việt và đưa về chữ thường
 * Giúp tìm kiếm không phân biệt hoa/thường và bỏ dấu vẫn tìm được
 */
function removeVietnameseTones(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim();
}

/**
 * Helper: Tạo chuỗi ngày định dạng dd/mm/yyyy dựa vào số ngày cộng thêm so với hôm nay
 */
function getFutureDateDisplay(daysToAdd = 1) {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// 5 công việc mẫu khởi tạo ban đầu (Hạn hoàn thành định dạng dd/mm/yyyy và đều > ngày hiện tại)
let tasks = [
  {
    id: 1,
    name: "Làm bài tập thực hành Web - Mini Task Manager",
    dueDate: getFutureDateDisplay(2),
    priority: "Cao",
    completed: false
  },
  {
    id: 2,
    name: "Học cú pháp JavaScript cơ bản và xử lý DOM",
    dueDate: getFutureDateDisplay(3),
    priority: "Cao",
    completed: true
  },
  {
    id: 3,
    name: "Nghiên cứu CSS Grid, Flexbox và Responsive",
    dueDate: getFutureDateDisplay(5),
    priority: "Trung bình",
    completed: false
  },
  {
    id: 4,
    name: "Soạn đề cương chuẩn bị ôn tập thi học phần",
    dueDate: getFutureDateDisplay(7),
    priority: "Trung bình",
    completed: false
  },
  {
    id: 5,
    name: "Dọn dẹp thư mục máy tính và sao lưu dự án",
    dueDate: getFutureDateDisplay(10),
    priority: "Thấp",
    completed: false
  }
];

// Lấy các phần tử DOM
const taskForm = document.getElementById("task-form");
const taskNameInput = document.getElementById("task-name");
const taskDueDateInput = document.getElementById("task-due-date");
const nativeDatePicker = document.getElementById("native-date-picker");
const taskPrioritySelect = document.getElementById("task-priority");

const nameError = document.getElementById("name-error");
const dueDateError = document.getElementById("due-date-error");
const priorityError = document.getElementById("priority-error");

// Thống kê
const statTotalCount = document.getElementById("stat-total-count");
const statPendingCount = document.getElementById("stat-pending-count");
const statCompletedCount = document.getElementById("stat-completed-count");

// Bộ lọc & Tìm kiếm & Sắp xếp
const searchInput = document.getElementById("search-input");
const filterStatus = document.getElementById("filter-status");
const sortTasks = document.getElementById("sort-tasks");

// Danh sách
const taskListElement = document.getElementById("task-list");
const taskCountElement = document.getElementById("task-count");
const emptyStateElement = document.getElementById("empty-state");

/**
 * Cập nhật số liệu thống kê công việc
 */
function updateStatistics() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  statTotalCount.textContent = total;
  statPendingCount.textContent = pending;
  statCompletedCount.textContent = completed;
}

/**
 * Hàm phân tích chuỗi dd/mm/yy hoặc dd/mm/yyyy thành đối tượng Date
 * Trả về { isValid: boolean, dateObj: Date, standardFormatted: string, errorMsg?: string }
 */
function parseAndValidateDate(dateStr) {
  if (!dateStr || !dateStr.trim()) {
    return { isValid: false, errorMsg: "Vui lòng nhập hạn hoàn thành!" };
  }

  const parts = dateStr.trim().split("/");
  if (parts.length !== 3) {
    return { isValid: false, errorMsg: "Định dạng hạn phải là dd/mm/yy hoặc dd/mm/yyyy!" };
  }

  let day = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return { isValid: false, errorMsg: "Ngày tháng phải là các con số hợp lệ!" };
  }

  // Xử lý năm dạng 2 chữ số (yy -> yyyy)
  if (parts[2].length === 2) {
    year += 2000;
  }

  if (month < 1 || month > 12) {
    return { isValid: false, errorMsg: "Tháng phải từ 1 đến 12!" };
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return { isValid: false, errorMsg: `Tháng ${month} chỉ có tối đa ${daysInMonth} ngày!` };
  }

  const selectedDate = new Date(year, month - 1, day);
  selectedDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Ràng buộc: Hạn hoàn thành phải > ngày hiện tại
  if (selectedDate <= today) {
    return { isValid: false, errorMsg: "Hạn hoàn thành phải lớn hơn ngày hiện tại!" };
  }

  const standardFormatted = `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
  return { isValid: true, dateObj: selectedDate, standardFormatted };
}

/**
 * Lấy class CSS theo độ ưu tiên
 */
function getPriorityClass(priority) {
  switch (priority) {
    case "Cao":
      return "priority-cao";
    case "Trung bình":
      return "priority-trung-binh";
    case "Thấp":
      return "priority-thap";
    default:
      return "";
  }
}

function getBadgePriorityClass(priority) {
  switch (priority) {
    case "Cao":
      return "badge-cao";
    case "Trung bình":
      return "badge-trung-binh";
    case "Thấp":
      return "badge-thap";
    default:
      return "";
  }
}

/**
 * Chuyển chuỗi dd/mm/yyyy sang timestamp để so sánh sắp xếp
 */
function toTimestamp(dateStr) {
  if (!dateStr) return 0;
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
  }
  return 0;
}

/**
 * Sắp xếp danh sách
 */
function sortTaskList(list, sortType) {
  return list.sort((a, b) => {
    if (sortType === "due-asc") {
      return toTimestamp(a.dueDate) - toTimestamp(b.dueDate);
    } else if (sortType === "due-desc") {
      return toTimestamp(b.dueDate) - toTimestamp(a.dueDate);
    } else if (sortType === "newest") {
      return b.id - a.id;
    }
    return 0;
  });
}

/**
 * Hiển thị (render) danh sách công việc
 */
function renderTasks() {
  updateStatistics();

  const searchRaw = searchInput.value;
  const searchNormalized = removeVietnameseTones(searchRaw);
  const statusFilterValue = filterStatus.value;
  const sortTypeValue = sortTasks.value;

  // Lọc dữ liệu kết hợp
  let filteredTasks = tasks.filter((task) => {
    // 1. Tìm kiếm: Gõ có dấu hoặc bỏ dấu đều tìm được
    const taskNameNormalized = removeVietnameseTones(task.name);
    const matchName = taskNameNormalized.includes(searchNormalized);

    // 2. Lọc trạng thái
    let matchStatus = true;
    if (statusFilterValue === "pending") {
      matchStatus = !task.completed;
    } else if (statusFilterValue === "completed") {
      matchStatus = task.completed;
    }

    return matchName && matchStatus;
  });

  // 3. Sắp xếp theo hạn hoàn thành
  filteredTasks = sortTaskList(filteredTasks, sortTypeValue);

  // Cập nhật số lượng
  taskCountElement.textContent = `${filteredTasks.length} / ${tasks.length} công việc`;
  taskListElement.innerHTML = "";

  if (filteredTasks.length === 0) {
    emptyStateElement.style.display = "block";
  } else {
    emptyStateElement.style.display = "none";

    filteredTasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = `task-item ${getPriorityClass(task.priority)} ${task.completed ? "completed" : ""}`;

      li.innerHTML = `
        <div class="task-left">
          <input 
            type="checkbox" 
            class="task-checkbox" 
            title="Đánh dấu hoàn thành"
            ${task.completed ? "checked" : ""}
            data-id="${task.id}"
          >
          <div class="task-details">
            <span class="task-title">${escapeHTML(task.name)}</span>
            <div class="task-meta">
              <span class="badge ${getBadgePriorityClass(task.priority)}">${task.priority}</span>
              <span class="badge-due">📅 Hạn: ${task.dueDate}</span>
              <span class="badge-status ${task.completed ? "completed" : "pending"}">
                ${task.completed ? "✓ Đã xong" : "⏳ Chưa xong"}
              </span>
            </div>
          </div>
        </div>
        <button class="btn-delete" data-id="${task.id}">Xóa</button>
      `;

      taskListElement.appendChild(li);
    });
  }
}

/**
 * Tránh lỗi XSS
 */
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

/**
 * Tự động thêm dấu "/" khi người dùng gõ ngày dd/mm/yy vào ô input
 */
taskDueDateInput.addEventListener("input", function (e) {
  let val = taskDueDateInput.value.replace(/[^\d/]/g, ""); // Chỉ cho phép số và dấu /
  
  // Tự động chèn dấu / sau ngày và tháng
  if (val.length === 2 && !val.includes("/")) {
    val = val + "/";
  } else if (val.length === 5 && val.split("/").length === 2) {
    val = val + "/";
  }
  taskDueDateInput.value = val;

  // Xóa báo lỗi
  dueDateError.textContent = "";
  taskDueDateInput.classList.remove("input-error");
});

/**
 * Đồng bộ khi người dùng click chọn từ lịch biểu tượng cạnh bên
 */
if (nativeDatePicker) {
  // Đặt min cho native datepicker từ ngày mai
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const dd = String(tomorrow.getDate()).padStart(2, "0");
  nativeDatePicker.min = `${yyyy}-${mm}-${dd}`;

  nativeDatePicker.addEventListener("change", function () {
    if (nativeDatePicker.value) {
      const [year, month, day] = nativeDatePicker.value.split("-");
      taskDueDateInput.value = `${day}/${month}/${year}`;
      dueDateError.textContent = "";
      taskDueDateInput.classList.remove("input-error");
    }
  });
}

/**
 * Xử lý thêm công việc từ Form
 */
taskForm.addEventListener("submit", function (e) {
  e.preventDefault();

  let isValid = true;
  const nameValue = taskNameInput.value.trim();
  const dueDateRaw = taskDueDateInput.value.trim();
  const priorityValue = taskPrioritySelect.value;

  // 1. Kiểm tra Tên công việc (bắt buộc)
  if (!nameValue) {
    nameError.textContent = "Vui lòng nhập tên công việc!";
    taskNameInput.classList.add("input-error");
    isValid = false;
  } else {
    nameError.textContent = "";
    taskNameInput.classList.remove("input-error");
  }

  // 2. Kiểm tra Hạn hoàn thành (bắt buộc, định dạng dd/mm/yy hoặc dd/mm/yyyy và > ngày hiện tại)
  const dateCheck = parseAndValidateDate(dueDateRaw);
  if (!dateCheck.isValid) {
    dueDateError.textContent = dateCheck.errorMsg;
    taskDueDateInput.classList.add("input-error");
    isValid = false;
  } else {
    dueDateError.textContent = "";
    taskDueDateInput.classList.remove("input-error");
  }

  // 3. Kiểm tra Mức ưu tiên (bắt buộc phải chọn)
  if (!priorityValue) {
    priorityError.textContent = "Vui lòng chọn mức ưu tiên!";
    taskPrioritySelect.classList.add("input-error");
    isValid = false;
  } else {
    priorityError.textContent = "";
    taskPrioritySelect.classList.remove("input-error");
  }

  if (!isValid) return;

  // Tạo công việc mới hợp lệ
  const newTask = {
    id: Date.now(),
    name: nameValue,
    dueDate: dateCheck.standardFormatted, // Lưu dạng chuẩn dd/mm/yyyy
    priority: priorityValue,
    completed: false
  };

  tasks.unshift(newTask);

  // Cập nhật giao diện
  renderTasks();

  // Reset form về trạng thái ban đầu
  taskForm.reset();
  taskPrioritySelect.value = "";
  taskNameInput.focus();
});

// Xóa lỗi khi người dùng bắt đầu nhập / chọn lại
taskNameInput.addEventListener("input", function () {
  if (taskNameInput.value.trim() !== "") {
    nameError.textContent = "";
    taskNameInput.classList.remove("input-error");
  }
});

taskPrioritySelect.addEventListener("change", function () {
  if (taskPrioritySelect.value !== "") {
    priorityError.textContent = "";
    taskPrioritySelect.classList.remove("input-error");
  }
});

/**
 * Event Delegation: Đánh dấu hoàn thành & Xóa
 */
taskListElement.addEventListener("click", function (e) {
  const target = e.target;

  if (target.classList.contains("task-checkbox")) {
    const taskId = Number(target.getAttribute("data-id"));
    toggleTaskComplete(taskId);
  }

  if (target.classList.contains("btn-delete")) {
    const taskId = Number(target.getAttribute("data-id"));
    deleteTask(taskId);
  }
});

function toggleTaskComplete(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    renderTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  renderTasks();
}

// Lắng nghe sự kiện tìm kiếm, lọc và sắp xếp
searchInput.addEventListener("input", renderTasks);
filterStatus.addEventListener("change", renderTasks);
sortTasks.addEventListener("change", renderTasks);

// Khởi chạy khi tải trang
document.addEventListener("DOMContentLoaded", renderTasks);
