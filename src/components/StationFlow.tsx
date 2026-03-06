"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PinPad } from "@/components/PinPad";
import { ClockInView } from "@/components/ClockInView";
import { CheckCircle2, UserCircle2, LockIcon, AlertTriangle } from "lucide-react";
import { NeumorphicButton } from "@/components/NeumorphicButton";
import { punchCashier } from "@/app/actions/punch";

type AppState = "SELECT_EMPLOYEE" | "AUTH_PIN" | "AUTHENTICATED" | "SUCCESS" | "LOCKED";

interface Employee {
  id: string;
  name: string;
}

interface StationFlowProps {
  stationId: string;
  employees: Employee[];
}

export function StationFlow({ stationId, employees }: StationFlowProps) {
  const [machineState, setMachineState] = useState<AppState>("SELECT_EMPLOYEE");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [pinError, setPinError] = useState(false);

  // Rate Limit state
  const [lockSeconds, setLockSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // Invalid Station / No employees screen
  if (!employees || employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-6 w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#FF3B30] tracking-widest mb-2 flex items-center justify-center gap-3">
            <AlertTriangle size={32} /> ERROR 404
          </h1>
          <p className="text-gray-500 text-sm">Estación inválida o vacía</p>
        </div>

        <div className="p-8 rounded-2xl bg-[var(--color-background)]" style={{ boxShadow: "var(--shadow-neu-pressed)" }}>
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">
            La estación "{stationId}" no está registrada en el sistema o no tiene cajeros asignados. Por favor, escanee un código QR válido.
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

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setMachineState("AUTH_PIN");
    setErrorMessage("");
  };

  const handlePinComplete = async (pin: string) => {
    if (!selectedEmployee) return;

    // Call server action to check PIN and rate limits
    const response = await punchCashier({
      stationId,
      cashierId: selectedEmployee.id,
      pin,
      deviceInfo: navigator.userAgent // Pasamos deviceInfo opcional
    });

    if (response.ok) {
      setMachineState("SUCCESS");
    } else {
      if (response.error === 'LOCKED' && 'unlockSeconds' in response) {
        setLockSeconds(response.unlockSeconds);
        setErrorMessage("Demasiados intentos incorrectos.");
        setMachineState("LOCKED");
      } else if (response.error === 'INVALID_PIN') {
        setErrorMessage("PIN incorrecto.");
        setPinError(true);
      } else {
        setErrorMessage("Error de servidor.");
        setPinError(true);
      }
    }
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

  // Manejo visual de la cuenta regresiva para el Rate Limit (LOCK)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (machineState === "LOCKED" && lockSeconds > 0) {
      interval = setInterval(() => {
        setLockSeconds(prev => {
          if (prev <= 1) {
            // Volvemos a seleccionar empleado cuando el timer expira
            setMachineState("SELECT_EMPLOYEE");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [machineState, lockSeconds]);

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
                  key={emp.id}
                  onClick={() => handleEmployeeSelect(emp)}
                  className="w-full py-4 text-lg flex items-center gap-4 px-6"
                >
                  <UserCircle2 size={24} className="text-[var(--color-accent)]" />
                  <span className="flex-1 text-left">{emp.name}</span>
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
                {selectedEmployee?.name}
              </h1>
              <p className={`text-sm tracking-wide ${errorMessage ? 'text-[#FF3B30]' : 'text-gray-500'}`}>
                {errorMessage || "Ingrese su PIN asignado"}
              </p>
            </div>

            <PinPad
              onComplete={handlePinComplete}
              isError={pinError}
              onErrorReset={() => {
                setPinError(false);
                setErrorMessage(""); // Limpiamos mensaje al reintentar input
              }}
            />

            <div className="mt-12 flex justify-center">
              <NeumorphicButton onClick={() => setMachineState("SELECT_EMPLOYEE")} className="px-6 py-2 text-sm text-gray-400">
                Volver
              </NeumorphicButton>
            </div>
          </motion.div>
        )}

        {machineState === "LOCKED" && selectedEmployee && (
          <motion.div
            key="locked"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm flex flex-col items-center justify-center text-center gap-8"
          >
            <motion.div
              animate={{ rotate: [-5, 5, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
              className="w-24 h-24 rounded-full bg-[#121212] flex items-center justify-center shadow-[var(--shadow-neu-flat)]"
            >
              <LockIcon size={40} className="text-[#FF3B30]" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-widest mb-2">
                BLOQUEADO
              </h1>
              <p className="text-[#FF3B30] text-sm mb-4">{errorMessage}</p>

              <div className="text-6xl font-black text-[var(--color-accent)] font-mono drop-shadow-[var(--drop-shadow-glow)]">
                0:{lockSeconds.toString().padStart(2, '0')}
              </div>
            </div>

            <NeumorphicButton onClick={() => setMachineState("SELECT_EMPLOYEE")} className="mt-8 px-6 py-3 text-sm text-gray-400 opacity-50">
              Cambiar Cajero
            </NeumorphicButton>
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
            <p className="text-gray-400">Gracias, {selectedEmployee.name}.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
