import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPatientSchema, CreatePatientSchema, Patient } from '@dental-clinic/shared';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface PatientFormProps {
  patient?: Patient;
  onSubmit: (data: CreatePatientSchema) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePatientSchema>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: patient
      ? {
          name: patient.name,
          email: patient.email || '',
          phone: patient.phone || '',
          date_of_birth: patient.date_of_birth || '',
          medical_notes: patient.medical_notes || '',
        }
      : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register('name')}
        type="text"
        label="Patient Name *"
        placeholder="John Doe"
        error={errors.name?.message}
      />

      <Input
        {...register('email')}
        type="email"
        label="Email"
        placeholder="john@example.com"
        error={errors.email?.message}
      />

      <Input
        {...register('phone')}
        type="tel"
        label="Phone"
        placeholder="(555) 123-4567"
        error={errors.phone?.message}
      />

      <Input
        {...register('date_of_birth')}
        type="date"
        label="Date of Birth"
        error={errors.date_of_birth?.message}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Medical Notes
        </label>
        <textarea
          {...register('medical_notes')}
          rows={4}
          className="input-field"
          placeholder="Any relevant medical history or notes..."
        />
        {errors.medical_notes && (
          <p className="mt-1 text-sm text-red-600">{errors.medical_notes.message}</p>
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {patient ? 'Update Patient' : 'Create Patient'}
        </Button>
      </div>
    </form>
  );
};
