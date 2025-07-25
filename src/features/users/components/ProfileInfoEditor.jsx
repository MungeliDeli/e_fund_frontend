import { useState, useEffect } from 'react';
import FormField from '../../../components/FormField';
import { profileInfoSchema } from '../services/userValidation';

function ProfileInfoEditor({ profile, onSave, loading }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    city: '',
    address: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile) {
        console.log(profile);
        
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        country: profile.country || '',
        city: profile.city || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const { error } = profileInfoSchema.validate(formData, { abortEarly: false });
    if (error) {
      const newErrors = {};
      error.details.forEach((detail) => {
        newErrors[detail.path[0]] = detail.message;
      });
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onSave(formData);
  };

  return (
    <div className="flex flex-col gap-4">
      <FormField
        label="First Name"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        error={errors.firstName}
      />
      <FormField
        label="Last Name"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        error={errors.lastName}
      />
      <FormField
        label="Country"
        name="country"
        value={formData.country}
        onChange={handleChange}
        error={errors.country}
      />
      <FormField
        label="City"
        name="city"
        value={formData.city}
        onChange={handleChange}
        error={errors.city}
      />
      <FormField
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
      />
      <div className="flex mt-2">
        <button
          className="px-4 py-1 rounded bg-[color:var(--color-primary)] text-white font-medium hover:bg-[color:var(--color-accent)] disabled:opacity-60"
          onClick={handleSave}
          disabled={loading}
          type="button"
        >
          {loading ? 'Uploading...' : 'Save'}
        </button>
       
      </div>
    </div>
  );
}

export default ProfileInfoEditor;
