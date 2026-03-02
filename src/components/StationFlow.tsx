"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PinPad } from "@/components/PinPad";
import { ClockInView } from "@/components/ClockInView";
import { CheckCircle2, UserCircle2 } from "lucide-react";
import { NeumorphicButton } from "@/components/NeumorphicButton";

const STATIONS_DATA: Record<string, string[]> = {
  "1": ["Lucas", "Marcos", "Ana", "Sofía"],
  "2": ["Juan", "Pedro", "María", "Lucía"],
  "3": ["Carlos", "Andrés", "Laura", "Marta"],
  "4": ["Jorge", "Diego", "Carmen", "Elena"],
  "5": ["Miguel", "José", "Rosa", "Teresa"],
  "6": ["Fernando", "Luis", "Isabel", "Beatriz"],
  "vip": ["Admin", "Gerente VIP", "Supervisor", "Cajero VIP"],
};

type AppState = "SELECT_EMPLOYEE" | "AUTH_PIN" | "AUTHENTICATED" | "SUCCESS";

interface StationFlowProps {
  stationId: string;
}

export function StationFlow({ stationId }: StationFlowProps) {
  const employees = STATIONS_DATA[stationId];

  const [machineState, setMachineState] = useState<AppState>("SELECT_EMPLOYEE");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [pinError, setPinError] = useState(false);

  // Invalid Station screen
  if (!employees) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-6 w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white tracking-widest mb-2">
            ERROR 404
          </h1>
          <p className="text-gray-500 text-sm">Estación inválida o no encontrada</p>
        </div>
        
        <div className="p-8 rounded-2xl bg-[var(--color-background)]" style={{ boxShadow: "var(--shadow-neu-pressed)" }}>
            <p className="text-gray-400 mb-6 text-sm">
                La estación "{stationId}" no está registrada en el sistema. Por favor, escanee un código QR válido.
            </p>
            <NeumorphicButton 
                onClick={() => window.location.href = '/s/1'} 
                className="w-full py-4 px-6 text-sm"
            >
                Volver al inicio (Caja 1)
            </NeumorphicButton>
        </div>
      </div>
    );
  }

  const handleEmployeeSelect = (name: string) => {
    setSelectedEmployee(name);
    setMachineState("AUTH_PIN");
  };

  const handlePinComplete = (pin: string) => {
    if (pin === "1234") {
      setMachineState("AUTHENTICATED");
    } else {
      setPinError(true);
    }
  };

  const handleClockIn = () => {
    console.log(`[CLOCK IN] Employee: ${selectedEmployee} | Station: ${stationId} | Time: ${new Date().toISOString()}`);
    setMachineState("SUCCESS");
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (machineState === "SUCCESS") {
      timeout = setTimeout(() => {
        setMachineState("SELECT_EMPLOYEE");
        setSelectedEmployee(null);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [machineState]);

  return (
    <div className="w-full flex justify-center">
      <AnimatePresence mode="wait">
        {machineState === "SELECT_EMPLOYEE" && (
          <motion.div
            key="select_employee"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm flex flex-col items-center"
          >
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-white tracking-widest mb-2">
                CAJA {stationId.toUpperCase()}
              </h1>
              <p className="text-gray-500 text-sm">Seleccione su nombre</p>
            </div>

            <div className="flex flex-col gap-4 w-full">
              {employees.map((emp) => (
                <NeumorphicButton
                  key={emp}
                  onClick={() => handleEmployeeSelect(emp)}
                  className="w-full py-4 text-lg flex items-center justify-center gap-3"
                >
                  <UserCircle2 size={24} className="text-[var(--color-accent)]" />
                  {emp}
                </NeumorphicButton>
              ))}
            </div>
          </motion.div>
        )}

        {machineState === "AUTH_PIN" && (
          <motion.div
            key="auth_pin"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm"
          >
            <div className="text-center mb-10">
              <h1 className="text-2xl font-bold text-[var(--color-accent)] tracking-widest mb-2">
                {selectedEmployee}
              </h1>
              <p className="text-gray-500 text-sm">Ingrese su PIN (1234)</p>
            </div>

            <PinPad
              onComplete={handlePinComplete}
              isError={pinError}
              onErrorReset={() => setPinError(false)}
            />

            <div className="mt-12 flex justify-center">
              <NeumorphicButton onClick={() => setMachineState("SELECT_EMPLOYEE")} className="px-6 py-2 text-sm text-gray-400">
                Volver
              </NeumorphicButton>
            </div>
          </motion.div>
        )}

        {machineState === "AUTHENTICATED" && selectedEmployee && (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <ClockInView
              employeeName={selectedEmployee}
              onClockIn={handleClockIn}
              onCancel={() => {
                setMachineState("SELECT_EMPLOYEE");
                setSelectedEmployee(null);
              }}
            />
          </motion.div>
        )}

        {machineState === "SUCCESS" && selectedEmployee && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex flex-col items-center justify-center text-center gap-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-32 h-32 rounded-full bg-[#121212] flex items-center justify-center mb-4"
              style={{ boxShadow: "var(--shadow-neu-flat)" }}
            >
              <CheckCircle2 size={64} className="text-[var(--color-accent)]" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white tracking-wide">¡Fichaje Exitoso!</h2>
            <p className="text-gray-400">Gracias, {selectedEmployee}.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
