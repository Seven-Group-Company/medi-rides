'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Car, 
  Upload, 
  X, 
  CheckCircle,
  User,
  Calendar,
  Users,
  FerrisWheelIcon,
  Heart
} from 'lucide-react';
import { CreateVehicleData } from '@/types/vehicle.types';

interface AddVehicleFormProps {
  onSubmit: (data: CreateVehicleData, images: File[]) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const vehicleTypes = [
  { value: 'SEDAN', label: 'Sedan' },
  { value: 'SUV', label: 'SUV' },
  { value: 'VAN', label: 'Van' },
  { value: 'WHEELCHAIR_VAN', label: 'Wheelchair Van' },
  { value: 'STRETCHER_VAN', label: 'Stretcher Van' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

export default function AddVehicleForm({ onSubmit, onCancel, loading }: AddVehicleFormProps) {
const [formData, setFormData] = useState<CreateVehicleData>({
  make: '',
  model: '',
  year: currentYear,
  color: '',
  licensePlate: '',
  vin: '',
  type: 'SEDAN', // Change from vehicleType to type
  capacity: 4,
  hasWheelchairAccess: false,
  hasOxygenSupport: false,
  insuranceExpiry: '',
  registrationExpiry: '',
  liabilityInsuranceExpiry: '',
  driverId: undefined,
});

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length + images.length > 5) {
      setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }));
      return;
    }

    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, images: 'Please select only image files' }));
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, images: 'Images must be less than 5MB' }));
        return false;
      }
      return true;
    });

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setImages(prev => [...prev, ...validFiles]);
    setErrors(prev => ({ ...prev, images: '' }));
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.make.trim()) newErrors.make = 'Make is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.color.trim()) newErrors.color = 'Color is required';
    if (!formData.licensePlate.trim()) newErrors.licensePlate = 'License plate is required';
    if (!formData.insuranceExpiry) newErrors.insuranceExpiry = 'Insurance expiry is required';
    if (!formData.registrationExpiry) newErrors.registrationExpiry = 'Registration expiry is required';
    if (!formData.liabilityInsuranceExpiry) newErrors.liabilityInsuranceExpiry = 'Liability insurance expiry is required';

    // Date validation
    const today = new Date();
    if (formData.insuranceExpiry && new Date(formData.insuranceExpiry) <= today) {
      newErrors.insuranceExpiry = 'Insurance must not be expired';
    }
    if (formData.registrationExpiry && new Date(formData.registrationExpiry) <= today) {
      newErrors.registrationExpiry = 'Registration must not be expired';
    }
    if (!formData.liabilityInsuranceExpiry) {
  newErrors.liabilityInsuranceExpiry = 'Liability insurance expiry is required';
}
    if (formData.liabilityInsuranceExpiry && new Date(formData.liabilityInsuranceExpiry) <= today) {
  newErrors.liabilityInsuranceExpiry = 'Liability insurance must not be expired';
}

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    // Convert dates to YYYY-MM-DD format (not ISO string)
    const submitData = {
      ...formData,
      // Send as YYYY-MM-DD (not ISO string)
      insuranceExpiry: formData.insuranceExpiry || '',
      registrationExpiry: formData.registrationExpiry || '',
      liabilityInsuranceExpiry: formData.liabilityInsuranceExpiry || '',
      // Ensure numbers are properly converted
      year: parseInt(formData.year.toString()),
      capacity: parseInt(formData.capacity.toString()),
    };

    console.log('📤 Final submit data:', submitData);
    
    await onSubmit(submitData, images);
  } catch (error) {
    console.error('❌ Form submission error:', error);
  }
};

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl border border-gray-200 p-6"
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Car className="w-6 h-6 mr-2" />
        Add New Vehicle
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Vehicle Images (Max 5)
          </label>
          <div className="space-y-4">
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Vehicle preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                images.length >= 5 
                  ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
              onClick={() => images.length < 5 && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                multiple
                className="hidden"
                disabled={images.length >= 5}
              />
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {images.length >= 5 
                  ? 'Maximum 5 images reached' 
                  : 'Click to upload images (max 5)'
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB each</p>
            </div>
          </div>
          {errors.images && (
            <p className="mt-1 text-sm text-red-600">{errors.images}</p>
          )}
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Make *
            </label>
            <input
              type="text"
              value={formData.make}
              onChange={(e) => handleInputChange('make', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.make ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Toyota"
            />
            {errors.make && (
              <p className="mt-1 text-sm text-red-600">{errors.make}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model *
            </label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.model ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Camry"
            />
            {errors.model && (
              <p className="mt-1 text-sm text-red-600">{errors.model}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={formData.year}
              onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color *
            </label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.color ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Blue"
            />
            {errors.color && (
              <p className="mt-1 text-sm text-red-600">{errors.color}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License Plate *
            </label>
            <input
              type="text"
              value={formData.licensePlate}
              onChange={(e) => handleInputChange('licensePlate', e.target.value.toUpperCase())}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.licensePlate ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., ABC123"
            />
            {errors.licensePlate && (
              <p className="mt-1 text-sm text-red-600">{errors.licensePlate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              VIN (Optional)
            </label>
            <input
              type="text"
              value={formData.vin}
              onChange={(e) => handleInputChange('vin', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Vehicle Identification Number"
            />
          </div>
        </div>

        {/* Vehicle Type and Capacity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Type *
            </label>
<select
  value={formData.type} // Change from formData.vehicleType
  onChange={(e) => handleInputChange('type', e.target.value)} // Change from 'vehicleType' to 'type'
  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
>
  {vehicleTypes.map(type => (
    <option key={type.value} value={type.value}>
      {type.label}
    </option>
  ))}
</select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Passenger Capacity
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
              min={1}
              max={20}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Special Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Special Features
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
              <FerrisWheelIcon className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Wheelchair Accessible</p>
                <p className="text-xs text-gray-500">Vehicle has wheelchair ramp/lift</p>
              </div>
              <input
                type="checkbox"
                checked={formData.hasWheelchairAccess}
                onChange={(e) => handleInputChange('hasWheelchairAccess', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
              <Heart className="w-5 h-5 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Oxygen Support</p>
                <p className="text-xs text-gray-500">Vehicle equipped for oxygen tanks</p>
              </div>
              <input
                type="checkbox"
                checked={formData.hasOxygenSupport}
                onChange={(e) => handleInputChange('hasOxygenSupport', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Insurance & Registration */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Insurance & Registration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Insurance Expiry *
              </label>
              <input
                type="date"
                value={formData.insuranceExpiry}
                onChange={(e) => handleInputChange('insuranceExpiry', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.insuranceExpiry ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.insuranceExpiry && (
                <p className="mt-1 text-sm text-red-600">{errors.insuranceExpiry}</p>
              )}
            </div>

              <div>
    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
      <Calendar className="w-4 h-4 mr-1" />
      Liability Insurance Expiry *
    </label>
    <input
      type="date"
      value={formData.liabilityInsuranceExpiry}
      onChange={(e) => handleInputChange('liabilityInsuranceExpiry', e.target.value)}
      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
        errors.liabilityInsuranceExpiry ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    {errors.liabilityInsuranceExpiry && (
      <p className="mt-1 text-sm text-red-600">{errors.liabilityInsuranceExpiry}</p>
    )}
  </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Registration Expiry *
              </label>
              <input
                type="date"
                value={formData.registrationExpiry}
                onChange={(e) => handleInputChange('registrationExpiry', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.registrationExpiry ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.registrationExpiry && (
                <p className="mt-1 text-sm text-red-600">{errors.registrationExpiry}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 rounded-xl font-medium transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 rounded-xl font-medium transition-colors duration-200 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Vehicle
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}