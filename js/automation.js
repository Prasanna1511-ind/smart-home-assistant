(function () {
  "use strict";

  const automations = [
    {
      key: "morning",
      name: "Good Morning",
      description: "Prepares the home for the day.",
      actions: ["Turn ON bedroom light", "Open curtains", "Turn OFF security alarm", "Start coffee maker"]
    },
    {
      key: "movie",
      name: "Movie Mode",
      description: "Creates a comfortable cinema setup.",
      actions: ["Turn OFF main lights", "Turn ON TV", "Turn ON AC", "Dim lights"]
    },
    {
      key: "sleep",
      name: "Sleep Mode",
      description: "Secures the home for night.",
      actions: ["Turn OFF lights", "Lock doors", "Turn OFF TV", "Set AC temperature"]
    },
    {
      key: "away",
      name: "Away Mode",
      description: "Reduces power usage while nobody is home.",
      actions: ["Turn OFF appliances", "Lock doors", "Arm security", "Monitor motion sensors"]
    },
    {
      key: "security",
      name: "Security Mode",
      description: "Prioritizes locks, sensors, and camera monitoring.",
      actions: ["Lock front door", "Arm motion sensors", "Enable camera", "Send status notification"]
    }
  ];

  function renderAutomations() {
    const list = document.querySelector("#automationList");
    if (!list) return;
    const state = window.SmartHome.getState();

    list.innerHTML = automations.map(function (automation) {
      const enabled = Boolean(state.automations[automation.key]);
      return '<article class="automation-card">' +
        '<div class="automation-card__head">' +
          '<div><p class="eyebrow">Automation</p><h3>' + automation.name + '</h3></div>' +
          '<label class="switch"><input type="checkbox" data-automation-toggle="' + automation.key + '" aria-label="Enable ' + automation.name + '"' + (enabled ? " checked" : "") + '><span class="switch-slider"></span></label>' +
        '</div>' +
        '<p class="muted">' + automation.description + '</p>' +
        '<ul class="action-list">' + automation.actions.map(function (action) { return "<li>" + action + "</li>"; }).join("") + '</ul>' +
        '<div class="automation-card__footer"><span class="status-badge ' + (enabled ? "status-on" : "status-warning") + '">' + (enabled ? "Enabled" : "Disabled") + '</span><button class="btn btn-primary" data-scene="' + automation.key + '">Run</button></div>' +
      '</article>';
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderAutomations();
    document.addEventListener("change", function (event) {
      const toggle = event.target.closest("[data-automation-toggle]");
      if (!toggle) return;
      window.SmartHome.setAutomationEnabled(toggle.dataset.automationToggle, toggle.checked);
    });
  });

  window.addEventListener("smart-home-updated", renderAutomations);
})();
