"use client";
import { IconAlertCircle, IconAlertTriangle, IconX } from '@/components/Icons';

import React, { useEffect } from "react";
import "./ConfirmationModal.scss";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="confirmation-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-desc"
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-header-left">
              <div className={`modal-icon-badge ${variant}`} aria-hidden="true">
                {variant === "primary" ? (
                  <IconAlertCircle width="20" height="20" />
                ) : (
                  <IconAlertTriangle width="20" height="20" />
                )}
              </div>
              <h2 id="confirmation-modal-title" className="modal-title">
                {title}
              </h2>
            </div>
            <button
              type="button"
              className="close"
              onClick={onClose}
              disabled={isLoading}
              aria-label="Close dialog"
            >
              <IconX />
            </button>
          </div>

          <div className="modal-body">
            <p id="confirmation-modal-desc">{message}</p>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`confirm ${variant}`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="confirm-btn-content">
                  <span className="confirm-spinner" />
                  <span>{confirmText}</span>
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
