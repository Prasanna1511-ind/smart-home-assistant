(function () {
  "use strict";

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function statusClass(status) {
    const lower = String(status || "").toLowerCase();
    if (["on", "online", "secure", "locked", "home secure"].includes(lower)) return "status-on";
    if (["warning", "unlocked", "disarmed"].includes(lower)) return "status-warning";
    if (["alert", "off"].includes(lower)) return "status-off";
    return "status-info";
  }

  function formatStatus(status) {
    return String(status || "").replace(/_/g, " ").toUpperCase();
  }

  function createDeviceCard(device, compact) {
    const card = document.createElement("article");
    card.className = "device-card " + (device.status === "on" || device.status === "locked" ? "is-active" : "");
    card.dataset.deviceId = device.id;

    const isToggleChecked = device.type === "lock" ? device.status === "locked" : device.status === "on";
    const toggleLabel = device.type === "lock" ? "Toggle lock for " : "Toggle power for ";

    card.innerHTML =
      '<div class="device-card__top">' +
        '<span class="device-icon" aria-hidden="true">' + device.icon + "</span>" +
        '<span class="status-badge ' + statusClass(device.status) + '">' + formatStatus(device.status) + "</span>" +
      "</div>" +
      "<h3>" + device.name + "</h3>" +
      '<p class="muted">' + device.room + " - " + device.type.toUpperCase() + "</p>" +
      '<div class="device-control-row">' +
        '<span>' + (device.type === "lock" ? "Lock" : "Power") + "</span>" +
        '<label class="switch">' +
          '<input type="checkbox" data-toggle-device="' + device.id + '" aria-label="' + toggleLabel + device.name + '"' + (isToggleChecked ? " checked" : "") + ">" +
          '<span class="switch-slider"></span>' +
        "</label>" +
      "</div>";

    if (!compact && device.type === "light") {
      card.insertAdjacentHTML(
        "beforeend",
        '<label class="range-control">Brightness <span>' + device.brightness + '%</span>' +
          '<input type="range" min="1" max="100" value="' + device.brightness + '" data-brightness="' + device.id + '" aria-label="Brightness for ' + device.name + '">' +
        "</label>"
      );
    }

    if (!compact && device.type === "ac") {
      card.insertAdjacentHTML(
        "beforeend",
        '<label class="range-control">Temperature <span>' + device.temperature + '&deg;C</span>' +
          '<input type="range" min="16" max="30" value="' + device.temperature + '" data-temperature-control aria-label="AC temperature">' +
        "</label>"
      );
    }

    if (!compact) {
      card.insertAdjacentHTML(
        "beforeend",
        '<p class="device-meta">' + device.powerUsage + "W simulated usage</p>"
      );
    }

    return card;
  }

  function renderNotifications() {
    const lists = $all("[data-notification-list]");
    if (!lists.length) return;
    const notifications = window.SmartHome.getState().notifications;
    lists.forEach(function (list) {
      list.innerHTML = "";
      if (!notifications.length) {
        list.innerHTML = '<li class="empty-state">No notifications right now.</li>';
        return;
      }
      notifications.slice(0, Number(list.dataset.limit || 8)).forEach(function (item) {
        const li = document.createElement("li");
        li.className = "notification-item " + (item.type || "info");
        li.innerHTML = '<span class="notification-dot"></span><div><strong>' + item.message + '</strong><small>' + item.time + "</small></div>";
        list.appendChild(li);
      });
    });
  }

  function renderStats() {
    const stats = $("#dashboardStats");
    if (!stats) return;
    const state = window.SmartHome.getState();
    const energy = window.SmartHome.calculateEnergy();
    const items = [
      ["Connected Devices", state.devices.length],
      ["Devices ON", window.SmartHome.getControllableOnCount()],
      ["Home Temperature", state.homeTemperature + "\u00B0C"],
      ["Humidity", state.humidity + "%"],
      ["Today's Energy", energy.todayKwh + " kWh"]
    ];

    stats.innerHTML = items.map(function (item) {
      return '<article class="stat-card"><strong>' + item[1] + '</strong><span>' + item[0] + "</span></article>";
    }).join("");
  }

  function renderHomePreview() {
    const preview = $("#homeDevicePreview");
    if (!preview) return;
    preview.innerHTML = "";
    window.SmartHome.getDevices().slice(0, 6).forEach(function (device) {
      preview.appendChild(createDeviceCard(device, true));
    });
  }

  function renderRoomsPage(selectedRoom) {
    const roomGrid = $("#roomGrid");
    const roomDetail = $("#roomDetail");
    if (!roomGrid || !roomDetail) return;

    const devices = window.SmartHome.getDevices();
    const rooms = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Study Room", "Garden"];
    const activeRoom = selectedRoom || roomDetail.dataset.activeRoom || rooms[0];
    roomDetail.dataset.activeRoom = activeRoom;

    roomGrid.innerHTML = rooms.map(function (room) {
      const roomDevices = devices.filter(function (device) {
        return device.room === room;
      });
      const lights = roomDevices.filter(function (device) {
        return device.type === "light";
      });
      const lightStatus = lights.length
        ? lights.some(function (light) { return light.status === "on"; }) ? "ON" : "OFF"
        : "No lights";
      const profile = window.SmartHome.roomProfiles[room] || { temperature: 25, security: "Secure" };
      return '<button class="room-card ' + (activeRoom === room ? "is-selected" : "") + '" data-room="' + room + '">' +
        "<span>" + room + "</span>" +
        "<strong>" + roomDevices.length + " devices</strong>" +
        '<small>' + profile.temperature + '&deg;C - Lights ' + lightStatus + '</small>' +
        '<small>Security: ' + profile.security + '</small>' +
      "</button>";
    }).join("");

    const activeDevices = devices.filter(function (device) {
      return device.room === activeRoom;
    });
    roomDetail.innerHTML =
      '<div class="section-heading"><div><p class="eyebrow">Room detail</p><h2>' + activeRoom + '</h2></div><span class="status-badge status-on">Live view</span></div>' +
      '<div class="device-grid">' +
      (activeDevices.length
        ? activeDevices.map(function (device) {
            const wrapper = document.createElement("div");
            wrapper.appendChild(createDeviceCard(device, false));
            return wrapper.innerHTML;
          }).join("")
        : '<article class="panel"><p>No simulated devices assigned to this room yet.</p></article>') +
      "</div>";
  }

  function renderSecurityPage() {
    const summary = $("#securitySummary");
    const grid = $("#securityGrid");
    const log = $("#securityLog");
    if (!summary || !grid || !log) return;

    const lock = window.SmartHome.getDevice("smart_lock");
    const motion = window.SmartHome.getDevice("motion_sensor");
    const camera = window.SmartHome.getDevice("security_camera");
    const state = window.SmartHome.getState();
    const securityStatus = window.SmartHome.getSecurityStatus();

    summary.innerHTML =
      '<span class="status-ring ' + statusClass(securityStatus) + '"></span>' +
      '<div><p class="eyebrow">Security Status</p><h2>' + securityStatus + '</h2><p class="muted">' +
      (state.securityArmed ? "System armed and monitoring sensors." : "System disarmed for home activity.") +
      "</p></div>";

    const items = [
      ["Front Door", lock.status === "locked" ? "Secure" : "Warning"],
      ["Back Door", "Secure"],
      ["Window Sensors", "Secure"],
      ["Motion Sensors", motion.status === "secure" ? "Secure" : formatStatus(motion.status)],
      ["Smart Lock", lock.status === "locked" ? "Secure" : "Warning"],
      ["Security Camera", camera.status === "secure" ? "Secure" : formatStatus(camera.status)]
    ];

    grid.innerHTML = items.map(function (item) {
      return '<article class="security-card"><span class="security-icon"></span><div><h3>' + item[0] + '</h3><span class="status-badge ' + statusClass(item[1]) + '">' + item[1] + "</span></div></article>";
    }).join("");

    log.innerHTML = window.SmartHome.getState().notifications.slice(0, 8).map(function (item) {
      return "<li><strong>" + item.time + "</strong> - " + item.message + "</li>";
    }).join("");
  }

  function renderEnergyPage() {
    const stats = $("#energyStats");
    const chart = $("#energyChart");
    const breakdown = $("#energyBreakdown");
    if (!stats || !chart || !breakdown) return;
    const energy = window.SmartHome.calculateEnergy();

    stats.innerHTML = [
      ["Today's usage", energy.todayKwh + " kWh"],
      ["Weekly usage", energy.weeklyKwh + " kWh"],
      ["Estimated consumption", energy.estimatedMonthly + " kWh/mo"],
      ["Active load", energy.watts + " W"]
    ].map(function (item) {
      return '<article class="stat-card"><strong>' + item[1] + '</strong><span>' + item[0] + "</span></article>";
    }).join("");

    chart.innerHTML = energy.groups.map(function (group) {
      return '<div class="bar-row"><span>' + group.name + '</span><div class="bar-track"><span style="width:' + Math.max(group.percentage, 4) + '%"></span></div><strong>' + group.percentage + "%</strong></div>";
    }).join("");

    breakdown.innerHTML = energy.groups.map(function (group) {
      return '<li><span>' + group.name + '</span><strong>' + group.percentage + "%</strong><small>" + group.watts + " W</small></li>";
    }).join("");
  }

  function bindGlobalEvents() {
    const navToggle = $(".nav-toggle");
    const navLinks = $(".nav-links");
    if (navToggle && navLinks) {
      navToggle.addEventListener("click", function () {
        const isOpen = navLinks.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
      });
    }

    document.addEventListener("click", function (event) {
      const toggle = event.target.closest("[data-toggle-device]");
      if (toggle) {
        window.SmartHome.toggleDevice(toggle.dataset.toggleDevice);
        return;
      }

      const sceneButton = event.target.closest("[data-scene]");
      if (sceneButton) {
        window.SmartHome.runScene(sceneButton.dataset.scene);
        return;
      }

      const roomButton = event.target.closest("[data-room]");
      if (roomButton) {
        renderRoomsPage(roomButton.dataset.room);
        return;
      }

      const clear = event.target.closest("[data-clear-notifications]");
      if (clear) {
        window.SmartHome.clearNotifications();
        return;
      }

      const arm = event.target.closest("[data-toggle-security]");
      if (arm) {
        const current = window.SmartHome.getState().securityArmed;
        window.SmartHome.setSecurityArmed(!current);
      }
    });

    document.addEventListener("input", function (event) {
      const brightness = event.target.closest("[data-brightness]");
      if (brightness) {
        const label = brightness.closest(".range-control").querySelector("span");
        if (label) label.textContent = brightness.value + "%";
      }

      const temperature = event.target.closest("[data-temperature-control]");
      if (temperature) {
        const label = temperature.closest(".range-control").querySelector("span");
        if (label) label.innerHTML = temperature.value + "&deg;C";
      }
    });

    document.addEventListener("change", function (event) {
      const brightness = event.target.closest("[data-brightness]");
      if (brightness) {
        window.SmartHome.setBrightness(brightness.dataset.brightness, brightness.value);
      }

      const temperature = event.target.closest("[data-temperature-control]");
      if (temperature) {
        window.SmartHome.setTemperature(temperature.value);
      }
    });

    window.addEventListener("smart-home-updated", function () {
      renderNotifications();
      renderStats();
      renderHomePreview();
      renderRoomsPage();
      renderSecurityPage();
      renderEnergyPage();
    });
  }

  function markActiveLinks() {
    const page = location.pathname.split("/").pop() || "index.html";
    $all("a[href]").forEach(function (link) {
      const href = link.getAttribute("href");
      if (href === page || (page === "" && href === "index.html")) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindGlobalEvents();
    markActiveLinks();
    renderNotifications();
    renderStats();
    renderHomePreview();
    renderRoomsPage();
    renderSecurityPage();
    renderEnergyPage();
  });

  window.SmartHomeUI = {
    createDeviceCard: createDeviceCard,
    renderNotifications: renderNotifications,
    renderStats: renderStats,
    renderRoomsPage: renderRoomsPage,
    renderSecurityPage: renderSecurityPage,
    renderEnergyPage: renderEnergyPage,
    statusClass: statusClass,
    formatStatus: formatStatus
  };
})();
