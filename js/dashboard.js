(function () {
  "use strict";

  function renderDashboardDevices() {
    const grid = document.querySelector("#deviceGrid");
    if (!grid || !window.SmartHomeUI) return;
    grid.innerHTML = "";

    window.SmartHome.getDevices()
      .filter(function (device) {
        return ["light", "fan", "ac", "tv", "lock", "speaker"].includes(device.type);
      })
      .forEach(function (device) {
        grid.appendChild(window.SmartHomeUI.createDeviceCard(device, false));
      });
  }

  function renderHomeStatus() {
    const panel = document.querySelector("#homeStatusPanel");
    if (!panel) return;
    const state = window.SmartHome.getState();
    const energy = window.SmartHome.calculateEnergy();
    panel.innerHTML =
      '<article><span>Home status</span><strong class="ok">Online</strong></article>' +
      '<article><span>Security status</span><strong>' + window.SmartHome.getSecurityStatus() + "</strong></article>" +
      '<article><span>Temperature</span><strong>' + state.homeTemperature + '&deg;C</strong></article>' +
      '<article><span>Humidity</span><strong>' + state.humidity + "%</strong></article>" +
      '<article><span>Energy consumption</span><strong>' + energy.todayKwh + " kWh</strong></article>";
  }

  function renderDashboard() {
    renderDashboardDevices();
    renderHomeStatus();
    window.SmartHomeUI.renderStats();
    window.SmartHomeUI.renderNotifications();
  }

  document.addEventListener("DOMContentLoaded", renderDashboard);
  window.addEventListener("smart-home-updated", renderDashboard);
})();
