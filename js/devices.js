/* Shared simulated IoT state for the static Smart Home Assistant project. */
(function () {
  "use strict";

  const STORAGE_KEY = "smartHomeAssistantStateV1";

  const defaultDevices = [
    {
      id: "living_room_light",
      name: "Living Room Light",
      room: "Living Room",
      type: "light",
      status: "on",
      icon: "L",
      powerUsage: 18,
      brightness: 78
    },
    {
      id: "bedroom_light",
      name: "Bedroom Light",
      room: "Bedroom",
      type: "light",
      status: "off",
      icon: "L",
      powerUsage: 12,
      brightness: 55
    },
    {
      id: "kitchen_light",
      name: "Kitchen Light",
      room: "Kitchen",
      type: "light",
      status: "on",
      icon: "L",
      powerUsage: 16,
      brightness: 85
    },
    {
      id: "main_fan",
      name: "Fan",
      room: "Living Room",
      type: "fan",
      status: "on",
      icon: "F",
      powerUsage: 55,
      speed: 2
    },
    {
      id: "study_fan",
      name: "Study Fan",
      room: "Study Room",
      type: "fan",
      status: "off",
      icon: "F",
      powerUsage: 48,
      speed: 1
    },
    {
      id: "air_conditioner",
      name: "Air Conditioner",
      room: "Bedroom",
      type: "ac",
      status: "on",
      icon: "AC",
      powerUsage: 1200,
      temperature: 24
    },
    {
      id: "television",
      name: "Television",
      room: "Living Room",
      type: "tv",
      status: "off",
      icon: "TV",
      powerUsage: 95
    },
    {
      id: "smart_lock",
      name: "Smart Door Lock",
      room: "Entrance",
      type: "lock",
      status: "locked",
      icon: "LK",
      powerUsage: 3
    },
    {
      id: "smart_speaker",
      name: "Smart Speaker",
      room: "Living Room",
      type: "speaker",
      status: "on",
      icon: "AI",
      powerUsage: 10
    },
    {
      id: "refrigerator",
      name: "Refrigerator",
      room: "Kitchen",
      type: "appliance",
      status: "on",
      icon: "RF",
      powerUsage: 180
    },
    {
      id: "temperature_sensor",
      name: "Temperature Sensor",
      room: "Hallway",
      type: "sensor",
      status: "online",
      icon: "TS",
      powerUsage: 2,
      temperature: 25
    },
    {
      id: "humidity_sensor",
      name: "Humidity Sensor",
      room: "Bathroom",
      type: "sensor",
      status: "online",
      icon: "HS",
      powerUsage: 2,
      humidity: 62
    },
    {
      id: "motion_sensor",
      name: "Motion Sensor",
      room: "Garden",
      type: "sensor",
      status: "secure",
      icon: "MS",
      powerUsage: 4
    },
    {
      id: "security_camera",
      name: "Security Camera",
      room: "Garden",
      type: "camera",
      status: "secure",
      icon: "CM",
      powerUsage: 12
    }
  ];

  const roomProfiles = {
    "Living Room": { temperature: 25, security: "Secure" },
    Bedroom: { temperature: 24, security: "Secure" },
    Kitchen: { temperature: 26, security: "Secure" },
    Bathroom: { temperature: 25, security: "Secure" },
    "Study Room": { temperature: 24, security: "Secure" },
    Garden: { temperature: 28, security: "Warning" },
    Entrance: { temperature: 25, security: "Secure" },
    Hallway: { temperature: 25, security: "Secure" }
  };

  const sceneLabels = {
    morning: "Morning Mode",
    movie: "Movie Mode",
    sleep: "Sleep Mode",
    away: "Away Mode",
    security: "Security Mode"
  };

  const automationDefaults = {
    morning: true,
    movie: true,
    sleep: true,
    away: false,
    security: true
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createInitialNotifications() {
    return [
      {
        id: Date.now() - 4,
        message: "Security system armed",
        type: "secure",
        time: "08:20 AM"
      },
      {
        id: Date.now() - 3,
        message: "Back door opened",
        type: "warning",
        time: "09:45 AM"
      },
      {
        id: Date.now() - 2,
        message: "Living room motion detected",
        type: "warning",
        time: "10:15 AM"
      },
      {
        id: Date.now() - 1,
        message: "Front door locked",
        type: "secure",
        time: "10:32 AM"
      }
    ];
  }

  function createDefaultState() {
    return {
      devices: clone(defaultDevices),
      notifications: createInitialNotifications(),
      activeScene: "",
      securityArmed: true,
      homeOnline: true,
      homeTemperature: 25,
      humidity: 62,
      automations: Object.assign({}, automationDefaults),
      preferences: {
        compactCards: false
      }
    };
  }

  function readState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const base = createDefaultState();
      if (!saved || typeof saved !== "object") {
        return base;
      }

      const savedById = {};
      (saved.devices || []).forEach(function (device) {
        savedById[device.id] = device;
      });

      return {
        devices: defaultDevices.map(function (device) {
          return Object.assign({}, device, savedById[device.id] || {});
        }),
        notifications: Array.isArray(saved.notifications)
          ? saved.notifications.slice(0, 30)
          : base.notifications,
        activeScene: saved.activeScene || "",
        securityArmed:
          typeof saved.securityArmed === "boolean"
            ? saved.securityArmed
            : base.securityArmed,
        homeOnline:
          typeof saved.homeOnline === "boolean" ? saved.homeOnline : base.homeOnline,
        homeTemperature: Number(saved.homeTemperature) || base.homeTemperature,
        humidity: Number(saved.humidity) || base.humidity,
        automations: Object.assign({}, automationDefaults, saved.automations || {}),
        preferences: Object.assign({}, base.preferences, saved.preferences || {})
      };
    } catch (error) {
      return createDefaultState();
    }
  }

  let state = readState();

  function saveState(shouldBroadcast) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (shouldBroadcast !== false) {
      window.dispatchEvent(new CustomEvent("smart-home-updated", { detail: getState() }));
    }
  }

  function getState() {
    return clone(state);
  }

  function getDevices() {
    return state.devices;
  }

  function getDevice(id) {
    return state.devices.find(function (device) {
      return device.id === id;
    });
  }

  function currentTime() {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function addNotification(message, type) {
    const notification = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      message: message,
      type: type || "info",
      time: currentTime()
    };
    state.notifications.unshift(notification);
    state.notifications = state.notifications.slice(0, 30);
    saveState();
    return notification;
  }

  function clearNotifications() {
    state.notifications = [];
    saveState();
  }

  function updateDevice(id, patch, notificationMessage) {
    const device = getDevice(id);
    if (!device) {
      return null;
    }
    Object.assign(device, patch);
    if (id === "temperature_sensor" && patch.temperature) {
      state.homeTemperature = Number(patch.temperature);
    }
    if (id === "humidity_sensor" && patch.humidity) {
      state.humidity = Number(patch.humidity);
    }
    if (notificationMessage) {
      addNotification(notificationMessage, notificationTypeFromDevice(device));
    } else {
      saveState();
    }
    return device;
  }

  function notificationTypeFromDevice(device) {
    if (device.type === "lock" || device.type === "camera" || device.type === "sensor") {
      return "secure";
    }
    return device.status === "on" ? "success" : "info";
  }

  function toggleDevice(id) {
    const device = getDevice(id);
    if (!device) {
      return null;
    }

    if (device.type === "lock") {
      const nextStatus = device.status === "locked" ? "unlocked" : "locked";
      return updateDevice(
        id,
        { status: nextStatus },
        device.name + " " + nextStatus
      );
    }

    const nextStatus = device.status === "on" ? "off" : "on";
    return updateDevice(
      id,
      { status: nextStatus },
      device.name + " turned " + nextStatus.toUpperCase()
    );
  }

  function setDeviceStatus(id, status, notify) {
    const device = getDevice(id);
    if (!device) {
      return null;
    }
    const normalized = String(status).toLowerCase();
    return updateDevice(
      id,
      { status: normalized },
      notify === false
        ? ""
        : device.name + " set to " + normalized.toUpperCase()
    );
  }

  function setBrightness(id, brightness) {
    const level = Math.max(1, Math.min(100, Number(brightness)));
    const device = getDevice(id);
    if (!device || device.type !== "light") {
      return null;
    }
    return updateDevice(
      id,
      { brightness: level, status: "on" },
      device.name + " brightness changed to " + level + "%"
    );
  }

  function setTemperature(value) {
    const temperature = Math.max(16, Math.min(30, Number(value)));
    const device = getDevice("air_conditioner");
    if (!device) {
      return null;
    }
    return updateDevice(
      "air_conditioner",
      { temperature: temperature, status: "on" },
      "AC temperature changed to " + temperature + "\u00B0C"
    );
  }

  function setSecurityArmed(isArmed, notify) {
    state.securityArmed = Boolean(isArmed);
    if (notify !== false) {
      addNotification(
        state.securityArmed ? "Security system armed" : "Security system disarmed",
        state.securityArmed ? "secure" : "warning"
      );
    } else {
      saveState();
    }
  }

  function getDevicesOnCount() {
    return state.devices.filter(function (device) {
      return ["on", "online", "secure", "locked"].includes(device.status);
    }).length;
  }

  function getControllableOnCount() {
    return state.devices.filter(function (device) {
      return device.status === "on";
    }).length;
  }

  function calculateEnergy() {
    const activeDevices = state.devices.filter(function (device) {
      return ["on", "online", "secure", "locked"].includes(device.status);
    });
    const watts = activeDevices.reduce(function (total, device) {
      const brightnessFactor =
        device.type === "light" ? (Number(device.brightness) || 100) / 100 : 1;
      return total + Number(device.powerUsage || 0) * brightnessFactor;
    }, 0);
    const todayKwh = Math.max(0.7, (watts * 8) / 1000);
    const weeklyKwh = todayKwh * 6.7;
    const estimatedMonthly = todayKwh * 30;

    const groups = {
      "Air Conditioner": 0,
      Lights: 0,
      Refrigerator: 0,
      TV: 0,
      Fan: 0,
      Other: 0
    };

    activeDevices.forEach(function (device) {
      let key = "Other";
      if (device.type === "ac") key = "Air Conditioner";
      if (device.type === "light") key = "Lights";
      if (device.id === "refrigerator") key = "Refrigerator";
      if (device.type === "tv") key = "TV";
      if (device.type === "fan") key = "Fan";
      groups[key] += Number(device.powerUsage || 0);
    });

    const totalGroupWatts =
      Object.keys(groups).reduce(function (total, key) {
        return total + groups[key];
      }, 0) || 1;

    return {
      watts: Math.round(watts),
      todayKwh: Number(todayKwh.toFixed(1)),
      weeklyKwh: Number(weeklyKwh.toFixed(1)),
      estimatedMonthly: Number(estimatedMonthly.toFixed(1)),
      groups: Object.keys(groups).map(function (name) {
        return {
          name: name,
          percentage: Math.round((groups[name] / totalGroupWatts) * 100),
          watts: Math.round(groups[name])
        };
      })
    };
  }

  function runScene(scene) {
    const sceneKey = String(scene || "").toLowerCase();
    const updates = [];

    if (sceneKey === "morning") {
      updates.push(["bedroom_light", { status: "on", brightness: 85 }]);
      updates.push(["kitchen_light", { status: "on", brightness: 90 }]);
      updates.push(["smart_speaker", { status: "on" }]);
      updates.push(["air_conditioner", { status: "off" }]);
      state.securityArmed = false;
    }

    if (sceneKey === "movie") {
      updates.push(["living_room_light", { status: "on", brightness: 25 }]);
      updates.push(["bedroom_light", { status: "off" }]);
      updates.push(["kitchen_light", { status: "off" }]);
      updates.push(["television", { status: "on" }]);
      updates.push(["air_conditioner", { status: "on", temperature: 23 }]);
    }

    if (sceneKey === "sleep") {
      ["living_room_light", "bedroom_light", "kitchen_light", "television", "main_fan", "study_fan"].forEach(function (id) {
        updates.push([id, { status: "off" }]);
      });
      updates.push(["air_conditioner", { status: "on", temperature: 24 }]);
      updates.push(["smart_lock", { status: "locked" }]);
      state.securityArmed = true;
    }

    if (sceneKey === "away") {
      ["living_room_light", "bedroom_light", "kitchen_light", "television", "main_fan", "study_fan", "air_conditioner", "smart_speaker"].forEach(function (id) {
        updates.push([id, { status: "off" }]);
      });
      updates.push(["smart_lock", { status: "locked" }]);
      updates.push(["motion_sensor", { status: "secure" }]);
      updates.push(["security_camera", { status: "secure" }]);
      state.securityArmed = true;
    }

    if (sceneKey === "security") {
      updates.push(["smart_lock", { status: "locked" }]);
      updates.push(["motion_sensor", { status: "secure" }]);
      updates.push(["security_camera", { status: "secure" }]);
      state.securityArmed = true;
    }

    if (!updates.length) {
      return false;
    }

    updates.forEach(function (update) {
      const device = getDevice(update[0]);
      if (device) {
        Object.assign(device, update[1]);
      }
    });

    state.activeScene = sceneKey;
    addNotification(sceneLabels[sceneKey] + " activated successfully.", "success");
    return true;
  }

  function setAutomationEnabled(scene, enabled) {
    state.automations[scene] = Boolean(enabled);
    addNotification(
      sceneLabels[scene] + (enabled ? " enabled" : " disabled"),
      enabled ? "success" : "info"
    );
  }

  function getSecurityStatus() {
    const lock = getDevice("smart_lock");
    const motion = getDevice("motion_sensor");
    const camera = getDevice("security_camera");
    const hasAlert = [motion, camera].some(function (device) {
      return device && device.status === "alert";
    });
    const hasWarning = [motion, camera].some(function (device) {
      return device && device.status === "warning";
    });

    if (hasAlert || (lock && lock.status === "unlocked" && state.securityArmed)) {
      return "Alert";
    }
    if (hasWarning || (lock && lock.status === "unlocked")) {
      return "Warning";
    }
    return state.securityArmed ? "Home Secure" : "Disarmed";
  }

  function findTargetDevice(text) {
    const lower = text.toLowerCase();
    if (lower.includes("living") && lower.includes("light")) return "living_room_light";
    if (lower.includes("bedroom") && lower.includes("light")) return "bedroom_light";
    if (lower.includes("kitchen") && lower.includes("light")) return "kitchen_light";
    if (lower.includes("ac") || lower.includes("air conditioner")) return "air_conditioner";
    if (lower.includes("television") || lower.includes("tv")) return "television";
    if (lower.includes("study") && lower.includes("fan")) return "study_fan";
    if (lower.includes("fan")) return "main_fan";
    if (lower.includes("speaker")) return "smart_speaker";
    if (lower.includes("door") || lower.includes("lock")) return "smart_lock";
    return "";
  }

  function processAssistantCommand(command) {
    const text = String(command || "").trim();
    const lower = text.toLowerCase();
    if (!lower) {
      return "Please type a smart-home command.";
    }

    const tempMatch = lower.match(/(?:set|change).*(?:ac|air conditioner|temperature).*?(\d{2})/);
    if (tempMatch) {
      const device = setTemperature(tempMatch[1]);
      return "Done. The AC temperature is now " + device.temperature + "\u00B0C.";
    }

    if (lower.includes("energy")) {
      const energy = calculateEnergy();
      return "Today's energy usage is " + energy.todayKwh + " kWh. The current active load is about " + energy.watts + " watts.";
    }

    if (lower.includes("humidity")) {
      return "The current home humidity is " + state.humidity + "%.";
    }

    if (lower.includes("temperature") || lower.includes("how hot") || lower.includes("how cold")) {
      return "The current home temperature is " + state.homeTemperature + "\u00B0C.";
    }

    if (lower.includes("secure") || lower.includes("security")) {
      return getSecurityStatus() === "Home Secure"
        ? "Yes. Your home is secure and the security system is armed."
        : "Security status is " + getSecurityStatus() + ". Please review the security dashboard.";
    }

    if (lower.includes("movie mode") || lower.includes("movie scene")) {
      runScene("movie");
      return "Movie Mode activated. Lights are dimmed, TV is ON, and AC is set to 23\u00B0C.";
    }

    if (lower.includes("sleep mode")) {
      runScene("sleep");
      return "Sleep Mode activated. Lights and TV are OFF, doors are locked, and security is armed.";
    }

    if (lower.includes("morning mode") || lower.includes("good morning")) {
      runScene("morning");
      return "Good Morning mode activated. Bedroom and kitchen lights are ON, and the security alarm is disarmed.";
    }

    if (lower.includes("away mode")) {
      runScene("away");
      return "Away Mode activated. Devices are off, doors are locked, and security is armed.";
    }

    if (lower.includes("security mode")) {
      runScene("security");
      return "Security Mode activated. The smart lock, sensors, and camera are secured.";
    }

    if (lower.includes("lock") && lower.includes("door")) {
      updateDevice("smart_lock", { status: "locked" }, "Front door locked");
      return "Done. The front door is now locked.";
    }

    if (lower.includes("unlock") && lower.includes("door")) {
      updateDevice("smart_lock", { status: "unlocked" }, "Front door unlocked");
      return "Done. The front door is now unlocked.";
    }

    if (lower.includes("turn on") || lower.includes("switch on")) {
      const deviceId = findTargetDevice(lower);
      const device = getDevice(deviceId);
      if (device && device.type === "lock") {
        updateDevice(deviceId, { status: "locked" }, device.name + " locked");
        return "Done. The " + device.name.toLowerCase() + " is now locked.";
      }
      if (device) {
        setDeviceStatus(deviceId, "on");
        return "Sure. " + device.name + " is now ON.";
      }
    }

    if (lower.includes("turn off") || lower.includes("switch off")) {
      const deviceId = findTargetDevice(lower);
      const device = getDevice(deviceId);
      if (device) {
        setDeviceStatus(deviceId, "off");
        return "Done. " + device.name + " is now OFF.";
      }
    }

    if (lower.includes("help") || lower.includes("commands")) {
      return "Try commands like: turn on living room light, set AC temperature to 24, lock the front door, turn on movie mode, or show my energy usage.";
    }

    return "I understood this as a smart-home request, but I do not have a matching rule yet. Try a command from the examples.";
  }

  window.SmartHome = {
    sceneLabels: sceneLabels,
    roomProfiles: roomProfiles,
    getState: getState,
    getDevices: getDevices,
    getDevice: getDevice,
    updateDevice: updateDevice,
    toggleDevice: toggleDevice,
    setDeviceStatus: setDeviceStatus,
    setBrightness: setBrightness,
    setTemperature: setTemperature,
    setSecurityArmed: setSecurityArmed,
    addNotification: addNotification,
    clearNotifications: clearNotifications,
    calculateEnergy: calculateEnergy,
    getDevicesOnCount: getDevicesOnCount,
    getControllableOnCount: getControllableOnCount,
    runScene: runScene,
    setAutomationEnabled: setAutomationEnabled,
    getSecurityStatus: getSecurityStatus,
    processAssistantCommand: processAssistantCommand
  };
})();
