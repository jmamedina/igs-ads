import React from 'react';

interface ConfirmationDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <p className="mb-4">Are you sure you want to proceed?</p>
                <div className="flex justify-end">
                    <button className="mr-2 px-4 py-2 bg-gray-300 rounded" onClick={onCancel}>Cancel</button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog;