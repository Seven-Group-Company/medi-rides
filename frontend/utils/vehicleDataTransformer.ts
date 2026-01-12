import { CreateVehicleData } from "@/types/vehicle.types";

export const transformVehicleDataForBackend = (data: CreateVehicleData) => {
  return {
    make: data.make.trim(),
    model: data.model.trim(),
    year: parseInt(data.year.toString()),
    color: data.color.trim(),
    licensePlate: data.licensePlate.trim().toUpperCase(),
    vin: data.vin?.trim() || undefined,
    vehicleType: data.type,
    capacity: parseInt(data.capacity.toString()),
    hasWheelchairAccess: Boolean(data.hasWheelchairAccess),
    hasOxygenSupport: Boolean(data.hasOxygenSupport),
    insuranceExpiry: new Date(data.insuranceExpiry).toISOString(),
    registrationExpiry: new Date(data.registrationExpiry).toISOString(),
  };
};