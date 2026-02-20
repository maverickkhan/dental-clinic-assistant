import React, { useState, useEffect } from 'react';
import { Patient, CreatePatientSchema } from '@dental-clinic/shared';
import { patientService } from '../../services/api/patient.service';
import { useToast } from '../../hooks/useToast';
import { Layout } from '../../components/layout/Layout';
import { PatientCard } from '../../components/patients/PatientCard';
import { PatientForm } from '../../components/patients/PatientForm';
import { ChatContainer } from '../../components/chat/ChatContainer';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [chatPatient, setChatPatient] = useState<Patient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showToast } = useToast();

  useEffect(() => {
    loadPatients();
  }, [page]);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const response = await patientService.getPatients(page, 10);
      setPatients(response.data);
      setTotalPages(response.pagination.total_pages);
    } catch (error: any) {
      showToast('error', 'Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPatient(null);
    setIsFormOpen(true);
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsFormOpen(true);
  };

  const handleDelete = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDeleteOpen(true);
  };

  const handleChat = (patient: Patient) => {
    setChatPatient(patient);
  };

  const handleFormSubmit = async (data: CreatePatientSchema) => {
    setIsSubmitting(true);

    try {
      if (selectedPatient) {
        await patientService.updatePatient(selectedPatient.id, data);
        showToast('success', 'Patient updated successfully');
      } else {
        await patientService.createPatient(data);
        showToast('success', 'Patient created successfully');
      }

      setIsFormOpen(false);
      loadPatients();
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedPatient) return;

    setIsSubmitting(true);

    try {
      await patientService.deletePatient(selectedPatient.id);
      showToast('success', 'Patient deleted successfully');
      setIsDeleteOpen(false);
      loadPatients();
    } catch (error: any) {
      showToast('error', 'Failed to delete patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">Manage your dental clinic patients</p>
        </div>

        <Button onClick={handleCreate}>
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Patient
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🦷</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first patient</p>
          <Button onClick={handleCreate}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Patient
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onChat={handleChat}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </Button>

              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>

              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedPatient ? 'Edit Patient' : 'Add New Patient'}
        maxWidth="lg"
      >
        <PatientForm
          patient={selectedPatient || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Patient"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{selectedPatient?.name}</strong>?
            This action cannot be undone and will also delete all chat history.
          </p>

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} isLoading={isSubmitting}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Chat Container */}
      {chatPatient && (
        <ChatContainer
          patient={chatPatient}
          onClose={() => setChatPatient(null)}
        />
      )}
    </Layout>
  );
};
