'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../UI/Modal';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { siteSchema, type SiteFormData } from '@/lib/validations/schemas';

export interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: SiteFormData) => void | Promise<void>;
}

/**
 * AddSiteModal component for adding new sites to monitor
 * Uses react-hook-form with Zod validation
 */
export function AddSiteModal({ isOpen, onClose, onSubmit }: AddSiteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
  });

  const handleFormSubmit = async (data: SiteFormData) => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Site"
      description="Enter the details for the site you want to monitor"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Site Name Field */}
        <Input
          {...register('name')}
          label="Site Name"
          type="text"
          placeholder="My Awesome Site"
          error={errors.name?.message}
          disabled={isSubmitting}
          autoComplete="off"
        />

        {/* Site URL Field */}
        <Input
          {...register('url')}
          label="Site URL"
          type="url"
          placeholder="https://example.com"
          error={errors.url?.message}
          disabled={isSubmitting}
          autoComplete="url"
        />

        {/* Form Actions */}
        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            Add Site
          </Button>
        </div>
      </form>
    </Modal>
  );
}
