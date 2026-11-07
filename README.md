# Smart Home Assistant

Tagline: "Your Home. Your Voice. Your Smart Life."

## Problem Statement

Traditional homes require users to manually control many separate devices such as lights, fans, AC, TV, door locks, sensors, and security systems. As the number of devices increases, it becomes inconvenient to monitor everything from different switches, remotes, and control points. Users also lack a simple way to automate daily routines or understand energy usage.

## Proposed AI Solution

Smart Home Assistant demonstrates a centralized smart-home dashboard where users can monitor home status, control simulated devices, run automation scenes, view notifications, and interact with a conversational assistant. The assistant accepts natural-language-like commands and updates the smart-home interface using JavaScript rules.

This project is a static simulation. It does not use a real AI model, backend server, database, cloud API, authentication system, real IoT device, or hardware connection.

## AI Types / Concepts

- Conversational AI: The assistant uses a chat interface so users can type commands in a natural style.
- Natural Language Processing concept: The JavaScript checks keywords such as action, room, device, and scene name to understand simple commands.
- Rule-based AI: Responses are generated from predefined rules, not from a trained AI model.
- Automation: Scene buttons such as Morning Mode, Movie Mode, Sleep Mode, Away Mode, and Security Mode change multiple simulated device states at once.
- Recommendation concept: The energy page can support future suggestions such as reducing AC usage or turning off idle devices.
- IoT concept: Devices, sensors, locks, appliances, and energy usage are represented as connected objects in JavaScript.

## Features

- Home landing page with hero, feature overview, device preview, assistant section, security section, energy section, CTA, and footer.
- Dashboard page with live statistics, home status, device cards, toggles, brightness sliders, AC temperature control, scenes, and notifications.
- Rooms page with room cards and detailed room device views.
- Security page with secure, warning, and alert indicators plus simulated activity logs.
- Energy page with today's usage, weekly usage, estimated monthly consumption, and CSS-based device-wise charts.
- Automation page with enable/disable switches and run buttons for common smart-home scenes.
- AI Assistant page with rule-based command matching and realistic responses.
- Notification system with local clearing.
- localStorage persistence for device states, active scenes, notifications, automation settings, and preferences.
- Responsive layout for desktop, laptop, tablet, and mobile.
- Basic accessibility with semantic HTML, labels, focus states, buttons, and responsive controls.

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Google Fonts
- localStorage

## How to Run

Open `index.html` in a browser. No installation, server, backend, database, or build step is required.

Recommended starting file:

```text
smart-home-assistant/index.html
```

## Example AI Assistant Commands

```text
Turn on the living room light
Turn off the bedroom light
Turn on the AC
Set AC temperature to 24
Lock the front door
What's the temperature?
Turn on movie mode
Show my energy usage
Is my home secure?
```

## Simulated IoT Functionality

All devices are JavaScript objects with fields such as `id`, `name`, `room`, `type`, `status`, `icon`, `powerUsage`, `brightness`, and `temperature`. When a user toggles a device, moves a slider, runs a scene, or sends an assistant command, JavaScript updates those objects and re-renders the interface.

No real hardware is controlled.

## localStorage

The app stores the simulated smart-home state in browser localStorage using the key `smartHomeAssistantStateV1`. This allows device states, automation settings, scene selection, notifications, and preferences to remain available after the page is refreshed.

## Future Enhancements

- Real IoT devices
- ESP32 integration
- MQTT communication
- Real AI model
- Voice recognition
- Computer vision
- Mobile application
- Cloud integration
- Real-time sensor monitoring
- Energy prediction
- Smart security alerts

## Project Rules

- No backend
- No database
- No real IoT hardware
- No external APIs
- No real authentication
- No payment system

Everything is simulated using HTML, CSS, JavaScript, and localStorage.
