import { FC } from 'react';
import { Patient } from '@dental-clinic/shared';
import { formatDate } from '@dental-clinic/shared';
import {
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface PatientCardProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onChat: (patient: Patient) => void;
}

export const PatientCard: FC<PatientCardProps> = ({
  patient,
  onEdit,
  onDelete,
  onChat,
}) => {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
          <p className="text-sm text-gray-500">
            Added {formatDate(patient.created_at)}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {patient.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <EnvelopeIcon className="w-4 h-4" />
            {patient.email}
          </div>
        )}

        {patient.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <PhoneIcon className="w-4 h-4" />
            {patient.phone}
          </div>
        )}

        {patient.date_of_birth && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4" />
            {formatDate(patient.date_of_birth)}
          </div>
        )}
      </div>

      {patient.medical_notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 line-clamp-2">{patient.medical_notes}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onChat(patient)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors"
        >
          <ChatBubbleLeftRightIcon className="w-4 h-4" />
          Chat
        </button>

        <button
          onClick={() => onEdit(patient)}
          className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <PencilIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(patient)}
          className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
