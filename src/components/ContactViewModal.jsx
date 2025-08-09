import React from "react";
import EntityViewModal from "./EntityViewModal";
import { SecondaryButton, PrimaryButton } from "./Buttons";

function ContactViewModal({ isOpen, onClose, contact, onEdit, onDelete }) {
  if (!isOpen || !contact) return null;

  return (
    <EntityViewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Contact Details"
      footer={
        <>
          <SecondaryButton onClick={onEdit}>Edit</SecondaryButton>
          <PrimaryButton onClick={onDelete}>Delete</PrimaryButton>
        </>
      }
    >
      <div>
        <span className="font-medium">Name: </span>
        <span>{contact.name}</span>
      </div>
      <div>
        <span className="font-medium">Email: </span>
        <span>{contact.email}</span>
      </div>
      <div>
        <span className="font-medium">Description: </span>
        {contact.description ? (
          <span>{contact.description}</span>
        ) : (
          <span className="italic text-[color:var(--color-secondary-text)]">
            No description
          </span>
        )}
      </div>
      <div>
        <span className="font-medium">Emails Opened: </span>
        <span>{contact.emails_opened ?? 0}</span>
      </div>
    </EntityViewModal>
  );
}

export default ContactViewModal;
