(function () {
  "use strict";

  function addMessage(message, sender) {
    const chat = document.querySelector("#chatMessages");
    if (!chat) return;
    const bubble = document.createElement("div");
    const paragraph = document.createElement("p");
    bubble.className = "chat-message " + sender;
    paragraph.textContent = message;
    bubble.appendChild(paragraph);
    chat.appendChild(bubble);
    chat.scrollTop = chat.scrollHeight;
  }

  function handleCommand(command) {
    addMessage(command, "user");
    const response = window.SmartHome.processAssistantCommand(command);
    window.setTimeout(function () {
      addMessage(response, "assistant");
    }, 180);
  }

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#assistantForm");
    const input = document.querySelector("#assistantInput");
    if (!form || !input) return;

    addMessage("Hello. I am Home AI Assistant, a rule-based simulation for this static project. Try controlling a light, AC, door lock, scene, security, or energy usage.", "assistant");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const command = input.value.trim();
      if (!command) return;
      input.value = "";
      handleCommand(command);
    });

    document.querySelectorAll("[data-command]").forEach(function (button) {
      button.addEventListener("click", function () {
        input.value = button.dataset.command;
        input.focus();
        handleCommand(button.dataset.command);
        input.value = "";
      });
    });
  });
})();
