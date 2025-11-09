import React, { useState } from 'react';
import { Automation } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, SparklesIcon } from './icons/Icons';
import AutomationComposer from './AutomationComposer';
import ConfirmationDialog from './ConfirmationDialog';

interface AutomateProps {
  automations: Automation[];
  setAutomations: React.Dispatch<React.SetStateAction<Automation[]>>;
}

const Automate: React.FC<AutomateProps> = ({ automations, setAutomations }) => {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [automationToEdit, setAutomationToEdit] = useState<Automation | null>(null);
  const [automationToDelete, setAutomationToDelete] = useState<Automation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveAutomation = async (automation: Automation) => {
    const existingIndex = automations.findIndex(a => a.id === automation.id);
    if (existingIndex > -1) {
      setAutomations(automations.map(a => a.id === automation.id ? automation : a));
    } else {
      setAutomations([...automations, automation]);
    }
    setIsComposerOpen(false);
    setAutomationToEdit(null);
  };

  const handleDelete = async () => {
    if (automationToDelete) {
      setIsDeleting(true);
      await new Promise(res => setTimeout(res, 750));
      setAutomations(automations.filter(a => a.id !== automationToDelete.id));
      setIsDeleting(false);
      setAutomationToDelete(null);
    }
  };
  
  const handleToggleStatus = (id: string) => {
      setAutomations(automations.map(a => a.id === id ? {...a, status: a.status === 'active' ? 'paused' : 'active'} : a));
  };
  
  const handleEdit = (automation: Automation) => {
      setAutomationToEdit(automation);
      setIsComposerOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Content Automation</h2>
          <p className="text-text-secondary mt-1">Set your content creation on autopilot.</p>
        </div>
        <button onClick={() => { setAutomationToEdit(null); setIsComposerOpen(true); }} className="flex items-center justify-center px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm">
          <PlusIcon className="w-5 h-5 mr-2" />
          New Automation
        </button>
      </div>

      <div className="bg-surface rounded-xl shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-accent text-xs text-text-secondary uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3">Topic</th>
                <th scope="col" className="px-6 py-3">Frequency</th>
                <th scope="col" className="px-6 py-3">Time</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {automations.map(auto => (
                <tr key={auto.id} className="border-b border-border-color hover:bg-surface-accent">
                  <td className="px-6 py-4 font-medium text-text-primary">{auto.topic}</td>
                  <td className="px-6 py-4 text-text-secondary">{auto.frequency}</td>
                  <td className="px-6 py-4 text-text-secondary">{auto.time}</td>
                  <td className="px-6 py-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={auto.status === 'active'} onChange={() => handleToggleStatus(auto.id)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      <span className="ml-3 text-sm font-medium text-text-secondary">{auto.status === 'active' ? 'Active' : 'Paused'}</span>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-4">
                        <button onClick={() => handleEdit(auto)} className="text-primary hover:underline font-medium"><PencilIcon className="w-5 h-5" /></button>
                        <button onClick={() => setAutomationToDelete(auto)} className="text-red-600 hover:underline font-medium"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {automations.length === 0 && (
          <div className="text-center py-20 bg-surface rounded-xl border-2 border-dashed border-border-color">
            <SparklesIcon className="mx-auto h-12 w-12 text-text-secondary" />
            <h3 className="mt-4 text-lg font-semibold text-text-primary">No automations created yet</h3>
            <p className="mt-1 text-sm text-text-secondary">Click 'New Automation' to get started and save time.</p>
        </div>
      )}

      {isComposerOpen && (
        <AutomationComposer
          automationToEdit={automationToEdit}
          onSave={handleSaveAutomation}
          onClose={() => setIsComposerOpen(false)}
        />
      )}
      
      {automationToDelete && (
          <ConfirmationDialog
            title="Delete Automation"
            message={`Are you sure you want to delete the "${automationToDelete.topic}" automation?`}
            onConfirm={handleDelete}
            onCancel={() => setAutomationToDelete(null)}
            confirmText="Delete"
            isConfirming={isDeleting}
           />
      )}
    </div>
  );
};

export default Automate;