"use client";

import { useEffect, useState } from "react";
import { repo } from "@unilab/urpc";
import DemoContainer from "@/components/demo-container";
import { LEDEntity } from "@/lib/entities/led";
import { ACEntity } from "@/lib/entities/ac";
import { initUrpcClient } from "@/lib/urpc-client";
import ChatWidget from "@/components/chat-widget";

initUrpcClient();

export default function IoTPage() {
  const [leds, setLeds] = useState<LEDEntity[]>([]);
  const [acs, setAcs] = useState<ACEntity[]>([]);
  const [error, setError] = useState<string | null>(null);

  const initLEDs = async () => {
    const devices = await repo<LEDEntity>({
      entity: "led",
      source: "iot",
    }).findMany();
    if (devices.length > 0) {
      return devices;
    }
    return repo<LEDEntity>({
      entity: "led",
      source: "iot",
    }).createMany({
      data: [
        {
          id: "led-1",
          name: "Living Room Light",
          isOn: false,
          brightness: 100,
          location: "Living Room",
        },
        {
          id: "led-2",
          name: "Bedroom Light",
          isOn: false,
          brightness: 80,
          location: "Bedroom",
        },
        {
          id: "led-3",
          name: "Kitchen Light",
          isOn: false,
          brightness: 90,
          location: "Kitchen",
        },
      ],
    });
  };

  const initACs = async () => {
    const acs = await repo<ACEntity>({
      entity: "ac",
      source: "iot",
    }).findMany();
    if (acs.length > 0) {
      return acs;
    }
    return repo<ACEntity>({
      entity: "ac",
      source: "iot",
    }).createMany({
      data: [
        {
          id: "ac-1",
          name: "Living Room AC",
          isOn: false,
          temperature: 24,
          mode: "cool",
          fanSpeed: "medium",
          location: "Living Room",
        },
        {
          id: "ac-2",
          name: "Bedroom AC",
          isOn: false,
          temperature: 26,
          mode: "cool",
          fanSpeed: "low",
          location: "Bedroom",
        },
      ],
    });
  };

  const fetchLEDs = async () => {
    try {
      const devices = await repo<LEDEntity>({
        entity: "led",
        source: "iot",
      }).findMany();
      setLeds(devices);
      setError(null);
    } catch (err) {
      console.error("Error fetching LED devices:", err);
      setError("Failed to load LED devices");
    }
  };

  const fetchACs = async () => {
    try {
      const devices = await repo<ACEntity>({
        entity: "ac",
        source: "iot",
      }).findMany();
      setAcs(devices);
      setError(null);
    } catch (err) {
      console.error("Error fetching AC devices:", err);
      setError("Failed to load AC devices");
    }
  };

  const toggleLED = async (id: string, isOn: boolean) => {
    try {
      await repo({ entity: "led", source: "iot" }).update({
        where: { id },
        data: { isOn: !isOn },
      });
      setLeds(
        leds.map((led) => (led.id === id ? { ...led, isOn: !isOn } : led))
      );
    } catch (err) {
      console.error(`Error toggling LED ${id}:`, err);
      setError(`Failed to toggle LED ${id}`);
    }
  };

  const adjustBrightness = async (id: string, brightness: number) => {
    try {
      await repo({ entity: "led", source: "iot" }).update({
        where: { id },
        data: { brightness },
      });
      setLeds(
        leds.map((led) => (led.id === id ? { ...led, brightness } : led))
      );
    } catch (err) {
      console.error(`Error adjusting brightness for LED ${id}:`, err);
      setError(`Failed to adjust brightness for LED ${id}`);
    }
  };

  const toggleAC = async (id: string, isOn: boolean) => {
    try {
      await repo({ entity: "ac", source: "iot" }).update({
        where: { id },
        data: { isOn: !isOn },
      });
      setAcs(acs.map((ac) => (ac.id === id ? { ...ac, isOn: !isOn } : ac)));
    } catch (err) {
      console.error(`Error toggling AC ${id}:`, err);
      setError(`Failed to toggle AC ${id}`);
    }
  };

  const adjustTemperature = async (id: string, temperature: number) => {
    try {
      await repo({ entity: "ac", source: "iot" }).update({
        where: { id },
        data: { temperature },
      });
      setAcs(acs.map((ac) => (ac.id === id ? { ...ac, temperature } : ac)));
    } catch (err) {
      console.error(`Error adjusting temperature for AC ${id}:`, err);
      setError(`Failed to adjust temperature for AC ${id}`);
    }
  };

  const changeACMode = async (id: string, mode: string) => {
    try {
      await repo({ entity: "ac", source: "iot" }).update({
        where: { id },
        data: { mode },
      });
      setAcs(acs.map((ac) => (ac.id === id ? { ...ac, mode } : ac)));
    } catch (err) {
      console.error(`Error changing mode for AC ${id}:`, err);
      setError(`Failed to change mode for AC ${id}`);
    }
  };

  const changeACFanSpeed = async (id: string, fanSpeed: string) => {
    try {
      await repo({ entity: "ac", source: "iot" }).update({
        where: { id },
        data: { fanSpeed },
      });
      setAcs(acs.map((ac) => (ac.id === id ? { ...ac, fanSpeed } : ac)));
    } catch (err) {
      console.error(`Error changing fan speed for AC ${id}:`, err);
      setError(`Failed to change fan speed for AC ${id}`);
    }
  };

  useEffect(() => {
    Promise.all([
      initLEDs().then((ledDevices) => {
        setLeds(ledDevices);
      }),
      initACs().then((acDevices) => {
        setAcs(acDevices);
      }),
    ]);
  }, []);

  return (
    <>
      <DemoContainer title="IoT Device Demo">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-500 px-4 py-3 rounded mb-4 font-mono text-sm">
              ERROR: {error}
            </div>
          )}

          <div className="font-bold mb-4">Light Bulb</div>
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leds.map((led) => (
              <LightBulb
                key={led.id}
                led={led}
                onToggle={() => toggleLED(led.id, led.isOn)}
                onBrightnessChange={(value) => adjustBrightness(led.id, value)}
              />
            ))}
          </div>

          <div className="font-bold mb-4">Air Conditioner</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {acs.map((ac) => (
              <AirConditioner
                key={ac.id}
                ac={ac}
                onToggle={() => toggleAC(ac.id, ac.isOn)}
                onTemperatureChange={(value) => adjustTemperature(ac.id, value)}
                onModeChange={(mode) => changeACMode(ac.id, mode)}
                onFanSpeedChange={(speed) => changeACFanSpeed(ac.id, speed)}
              />
            ))}
          </div>
        </div>
      </DemoContainer>
      <ChatWidget
        entity="chat"
        source="mastra-client"
        quickCommands={[
          "Turn on all the lights that are turned off",
          "Turn on all LEDs",
          "Turn off all the lights that are turned on",
          "Turn on the led in the Living Room",
          "Turn off the led in the Living Room",
          "Adjust the brightness of the LED in the Living Room to 50",
          "Turn on the AC in the Living Room",
          "Set the temperature of the AC in the Living Room to 22",
          "Change the mode of the AC in the Living Room to heat",
        ]}
        onSuccess={() => {
          fetchLEDs();
          fetchACs();
        }}
      />
    </>
  );
}

interface LightBulbProps {
  led: LEDEntity;
  onToggle: () => void;
  onBrightnessChange: (value: number) => void;
}

function LightBulb({ led, onToggle, onBrightnessChange }: LightBulbProps) {
  const bulbStyle = {
    backgroundColor: led.isOn ? "#fff" : "#333",
    opacity: led.isOn ? led.brightness / 100 : 0.2,
    boxShadow: led.isOn
      ? `0 0 ${led.brightness / 2}px ${led.brightness / 4}px #fff`
      : "none",
  };

  return (
    <div className="bg-gray-800 border-2 border-gray-700 rounded-none p-4 flex flex-col relative font-mono">
      <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
        <div className="text-xs text-gray-400">ID: {led.id}</div>
        <div className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full mr-1 ${
              led.isOn ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-xs text-gray-400">
            {led.isOn ? "ACTIVE" : "STANDBY"}
          </span>
        </div>
      </div>

      <div className="flex mb-4">
        <div className="w-1/2 pr-2">
          <div className="text-green-500 text-sm mb-1">{led.name}</div>
          <div className="text-xs text-gray-500 mb-3">{led.location}</div>
          <div className="relative mb-3 border border-gray-600 p-2 bg-gray-900 rounded-sm">
            <div
              className="w-12 h-12 rounded-full mx-auto transition-all duration-300"
              style={bulbStyle}
            ></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-700"></div>
            <div className="absolute top-1/2 left-0 w-2 h-0.5 bg-gray-600"></div>
            <div className="absolute top-1/2 right-0 w-2 h-0.5 bg-gray-600"></div>
          </div>
        </div>

        <div className="w-1/2 pl-2 border-l border-gray-700">
          <div className="mb-3">
            <div className="text-xs text-gray-400 mb-1">POWER</div>
            <button
              onClick={onToggle}
              className="relative w-12 h-6 rounded-none bg-gray-900 border border-gray-600 flex items-center px-1 cursor-pointer"
            >
              <div
                className={`w-4 h-4 absolute transition-all duration-300 ${
                  led.isOn ? "translate-x-6 bg-green-500" : "bg-red-500"
                }`}
              ></div>
            </button>
          </div>

          <div className="mb-3">
            <div className="text-xs text-gray-400 mb-1">
              PWM: {led.brightness.toString().padStart(3, "0")}
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={led.brightness}
              onChange={(e) => onBrightnessChange(Number(e.target.value))}
              className="w-full h-1 bg-gray-700 appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:rounded-none cursor-pointer"
              disabled={!led.isOn}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 flex justify-between border-t border-gray-700 pt-2">
        <span>V:{led.brightness / 100}</span>
        <span className="animate-pulse">●</span>
        <span>{new Date().toISOString().slice(11, 19)}</span>
      </div>
    </div>
  );
}

interface AirConditionerProps {
  ac: ACEntity;
  onToggle: () => void;
  onTemperatureChange: (value: number) => void;
  onModeChange: (mode: string) => void;
  onFanSpeedChange: (speed: string) => void;
}

function AirConditioner({
  ac,
  onToggle,
  onTemperatureChange,
  onModeChange,
  onFanSpeedChange,
}: AirConditionerProps) {
  const getModeColor = (mode: string) => {
    switch (mode) {
      case "cool":
        return "text-blue-500";
      case "heat":
        return "text-red-500";
      case "fan":
        return "text-green-500";
      case "auto":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const getFanSpeedIndicator = (speed: string) => {
    switch (speed) {
      case "low":
        return "●○○";
      case "medium":
        return "●●○";
      case "high":
        return "●●●";
      case "auto":
        return "◐◑◒";
      default:
        return "○○○";
    }
  };

  return (
    <div className="bg-gray-800 border-2 border-gray-700 rounded-none p-4 flex flex-col relative font-mono">
      <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
        <div className="text-xs text-gray-400">ID: {ac.id}</div>
        <div className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full mr-1 ${
              ac.isOn ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-xs text-gray-400">
            {ac.isOn ? "ACTIVE" : "STANDBY"}
          </span>
        </div>
      </div>

      <div className="flex mb-4">
        <div className="w-1/2 pr-2">
          <div className="text-blue-500 text-sm mb-1">{ac.name}</div>
          <div className="text-xs text-gray-500 mb-3">{ac.location}</div>

          {/* AC Unit Visual */}
          <div className="relative mb-3 border border-gray-600 p-3 bg-gray-900 rounded-sm">
            <div className="flex flex-col items-center">
              {/* AC Body */}
              <div
                className={`w-16 h-8 rounded-sm border-2 transition-all duration-300 ${
                  ac.isOn
                    ? "border-blue-400 bg-blue-900/30"
                    : "border-gray-600 bg-gray-800"
                }`}
              >
                {/* Vents */}
                <div className="flex justify-center items-center h-full">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-0.5 h-4 ${
                          ac.isOn ? "bg-blue-400" : "bg-gray-600"
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Temperature Display */}
              <div
                className={`mt-2 text-lg font-bold ${
                  ac.isOn ? "text-blue-400" : "text-gray-600"
                }`}
              >
                {ac.temperature}°C
              </div>
            </div>
          </div>
        </div>

        <div className="w-1/2 pl-2 border-l border-gray-700">
          <div className="mb-3">
            <div className="text-xs text-gray-400 mb-1">POWER</div>
            <button
              onClick={onToggle}
              className="relative w-12 h-6 rounded-none bg-gray-900 border border-gray-600 flex items-center px-1 cursor-pointer"
            >
              <div
                className={`w-4 h-4 absolute transition-all duration-300 ${
                  ac.isOn ? "translate-x-6 bg-green-500" : "bg-red-500"
                }`}
              ></div>
            </button>
          </div>

          <div className="mb-3">
            <div className="text-xs text-gray-400 mb-1">
              TEMP: {ac.temperature}°C
            </div>
            <input
              type="range"
              min="16"
              max="30"
              value={ac.temperature}
              onChange={(e) => onTemperatureChange(Number(e.target.value))}
              className="w-full h-1 bg-gray-700 appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-none cursor-pointer"
              disabled={!ac.isOn}
            />
          </div>

          <div className="mb-2">
            <div className="text-xs text-gray-400 mb-1">MODE</div>
            <select
              value={ac.mode}
              onChange={(e) => onModeChange(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 text-white text-xs p-1 rounded-none"
              disabled={!ac.isOn}
            >
              <option value="cool">COOL</option>
              <option value="heat">HEAT</option>
              <option value="fan">FAN</option>
              <option value="auto">AUTO</option>
            </select>
          </div>

          <div className="mb-2">
            <div className="text-xs text-gray-400 mb-1">FAN SPEED</div>
            <select
              value={ac.fanSpeed}
              onChange={(e) => onFanSpeedChange(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 text-white text-xs p-1 rounded-none"
              disabled={!ac.isOn}
            >
              <option value="low">LOW</option>
              <option value="medium">MEDIUM</option>
              <option value="high">HIGH</option>
              <option value="auto">AUTO</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 flex justify-between border-t border-gray-700 pt-2">
        <span className={getModeColor(ac.mode)}>{ac.mode.toUpperCase()}</span>
        <span className="text-gray-400">
          {getFanSpeedIndicator(ac.fanSpeed)}
        </span>
        <span>{new Date().toISOString().slice(11, 19)}</span>
      </div>
    </div>
  );
}
