'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Trash2, Save, AlertCircle } from 'lucide-react';
import { Vehicle, UpdateVehicleData } from '@/types/vehicle.types';

interface EditVehicleFormProps {
  vehicle: Vehicle;
  onSubmit: (vehicleData: UpdateVehicleData, images: File[]) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

// Helper function to parse images from string or array
const parseImages = (images: string | string[] | null | undefined): string[] => {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export default function EditVehicleForm({ 
  vehicle, 
  onSubmit, 
  onCancel, 
  loading 
}: EditVehicleFormProps) {
  const [formData, setFormData] = useState<UpdateVehicleData>({
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    licensePlate: vehicle.licensePlate,
    vin: vehicle.vin || '',
    vehicleType: vehicle.type,
    capacity: vehicle.capacity,
    hasWheelchairAccess: vehicle.hasWheelchairAccess,
    hasOxygenSupport: vehicle.hasOxygenSupport,
    insuranceExpiry: vehicle.insuranceExpiry.split('T')[0],
    registrationExpiry: vehicle.registrationExpiry.split('T')[0],
    liabilityInsuranceExpiry: vehicle.liabilityInsuranceExpiry?.split('T')[0] || vehicle.insuranceExpiry.split('T')[0],
    status: vehicle.status,
  });

  const [existingImages, setExistingImages] = useState<string[]>(parseImages(vehicle.images));
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Generate preview URLs for new images
  useEffect(() => {
    const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);

    return () => {
      newPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [newImages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Check total images count
    const totalImages = existingImages.length - imagesToRemove.length + newImages.length + files.length;
    if (totalImages > 5) {
      setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }));
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, images: 'Only image files are allowed' }));
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, images: 'File size must be less than 5MB' }));
        return false;
      }
      return true;
    });

    setNewImages(prev => [...prev, ...validFiles]);
    setErrors(prev => ({ ...prev, images: '' }));
  };

  const removeExistingImage = (imageUrl: string) => {
    setImagesToRemove(prev => [...prev, imageUrl]);
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    const updatedPreviews = [...previewUrls];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    setPreviewUrls(updatedPreviews);
  };

  const restoreImage = (imageUrl: string) => {
    setImagesToRemove(prev => prev.filter(url => url !== imageUrl));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.make?.trim()) newErrors.make = 'Make is required';
    if (!formData.model?.trim()) newErrors.model = 'Model is required';
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Valid year is required';
    }
    if (!formData.color?.trim()) newErrors.color = 'Color is required';
    if (!formData.licensePlate?.trim()) newErrors.licensePlate = 'License plate is required';
    if (!formData.vehicleType?.trim()) newErrors.vehicleType = 'Vehicle type is required';
    if (!formData.capacity || formData.capacity < 1) newErrors.capacity = 'Valid capacity is required';
    
    // Date validations
    if (formData.insuranceExpiry && new Date(formData.insuranceExpiry) < new Date()) {
      newErrors.insuranceExpiry = 'Insurance expiry must be in the future';
    }
    if (formData.registrationExpiry && new Date(formData.registrationExpiry) < new Date()) {
      newErrors.registrationExpiry = 'Registration expiry must be in the future';
    }
    if (formData.liabilityInsuranceExpiry && new Date(formData.liabilityInsuranceExpiry) < new Date()) {
      newErrors.liabilityInsuranceExpiry = 'Liability insurance expiry must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  try {
    // Map field names from frontend to backend
    const backendData: UpdateVehicleData = {
      make: formData.make,
      model: formData.model,
      year: formData.year,
      color: formData.color,
      licensePlate: formData.licensePlate,
      vin: formData.vin,
      vehicleType: formData.vehicleType, // Use vehicleType for backend
      capacity: formData.capacity,
      hasWheelchairAccess: formData.hasWheelchairAccess,
      hasOxygenSupport: formData.hasOxygenSupport,
      insuranceExpiry: formData.insuranceExpiry,
      registrationExpiry: formData.registrationExpiry,
      liabilityInsuranceExpiry: formData.liabilityInsuranceExpiry,
      status: formData.status,
      // Send existing images (excluding removed ones)
      images: existingImages.filter(img => !imagesToRemove.includes(img)),
    };

    console.log('📤 Submitting update data:', backendData);
    console.log('📤 New images count:', newImages.length);

    await onSubmit(backendData, newImages);
  } catch (error) {
    console.error('Error submitting form:', error);
    // Show user-friendly error message
    setErrors(prev => ({
      ...prev,
      submit: error instanceof Error ? error.message : 'Failed to update vehicle'
    }));
  }
};

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
    >
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Vehicle</h2>
            <p className="text-gray-600 mt-1">
              Update vehicle information for {vehicle.make} {vehicle.model}
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Make <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="make"
                value={formData.make || ''}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.make ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Toyota"
              />
              {errors.make && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.make}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="model"
                value={formData.model || ''}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.model ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Camry"
              />
              {errors.model && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.model}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year <span className="text-red-500">*</span>
              </label>
              <select
                name="year"
                value={formData.year || ''}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.year ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Year</option>
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {errors.year && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.year}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="color"
                value={formData.color || ''}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.color ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Red"
              />
              {errors.color && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.color}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Plate <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate || ''}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.licensePlate ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., ABC123"
              />
              {errors.licensePlate && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.licensePlate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VIN (Optional)
              </label>
              <input
                type="text"
                name="vin"
                value={formData.vin || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Vehicle Identification Number"
              />
            </div>
          </div>

          {/* Vehicle Type and Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type <span className="text-red-500">*</span>
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType || ''}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.vehicleType ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Type</option>
                <option value="SEDAN">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="VAN">Van</option>
                <option value="MINIVAN">Minivan</option>
                <option value="BUS">Bus</option>
                <option value="AMBULANCE">Ambulance</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.vehicleType && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.vehicleType}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passenger Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity || ''}
                onChange={handleInputChange}
                min="1"
                max="50"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.capacity ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., 4"
              />
              {errors.capacity && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.capacity}
                </p>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasWheelchairAccess"
                  name="hasWheelchairAccess"
                  checked={formData.hasWheelchairAccess || false}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="hasWheelchairAccess" className="ml-2 text-gray-700">
                  Wheelchair Accessible
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasOxygenSupport"
                  name="hasOxygenSupport"
                  checked={formData.hasOxygenSupport || false}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="hasOxygenSupport" className="ml-2 text-gray-700">
                  Oxygen Support
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status || 'AVAILABLE'}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="AVAILABLE">Available</option>
                <option value="IN_USE">In Use</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
          </div>

          {/* Expiry Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Expiry <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="insuranceExpiry"
                value={formData.insuranceExpiry || ''}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.insuranceExpiry ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.insuranceExpiry && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.insuranceExpiry}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Expiry <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="registrationExpiry"
                value={formData.registrationExpiry || ''}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.registrationExpiry ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.registrationExpiry && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.registrationExpiry}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Liability Insurance Expiry
              </label>
              <input
                type="date"
                name="liabilityInsuranceExpiry"
                value={formData.liabilityInsuranceExpiry || ''}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.liabilityInsuranceExpiry ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.liabilityInsuranceExpiry && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.liabilityInsuranceExpiry}
                </p>
              )}
            </div>
          </div>

          {/* Images Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vehicle Images
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Upload up to 5 images (Max 5MB each)
                </p>
              </div>
              
              <label className="cursor-pointer px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-medium transition-colors flex items-center">
                <Camera className="w-4 h-4 mr-2" />
                Add Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={existingImages.length - imagesToRemove.length + newImages.length >= 5}
                />
              </label>
            </div>

            {errors.images && (
              <p className="mb-4 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" /> {errors.images}
              </p>
            )}

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Current Images</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {existingImages.map((imageUrl, index) => {
                    const isRemoved = imagesToRemove.includes(imageUrl);
                    return (
                      <div 
                        key={index} 
                        className={`relative group rounded-xl overflow-hidden border-2 ${
                          isRemoved ? 'border-red-300 opacity-50' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={imageUrl}
                          alt={`Vehicle ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                          {isRemoved ? (
                            <button
                              type="button"
                              onClick={() => restoreImage(imageUrl)}
                              className="opacity-0 group-hover:opacity-100 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => removeExistingImage(imageUrl)}
                              className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {isRemoved && (
                          <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                            Removed
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* New Images Preview */}
            {newImages.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">New Images</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {previewUrls.map((previewUrl, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border-2 border-blue-200">
                      <img
                        src={previewUrl}
                        alt={`New image ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        New
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}