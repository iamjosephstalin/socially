import React, { useState, useEffect } from 'react';
import { Automation } from '../types';
import { XIcon, SpinnerIcon } from './icons/Icons';

interface AutomationComposerProps {
  automationToEdit?: Automation | null;
  onSave: (automation: Automation) => Promise<void>;
  onClose: () => void;
}

const AutomationComposer: React.FC<AutomationComposerProps> = ({ automationToEdit, onSave, onClose }) => {
  const [topic, setTopic] = useState('Productivity Tip');
  const [customTopic, setCustomTopic] = useState('');
  const [frequency, setFrequency] = useState('Weekdays');
  const [time, setTime] = useState('09:00');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (automationToEdit) {
      // Check if the topic is in the predefined list
      const suggestionTopics = ['Productivity Tip', 'Industry News', 'Company Update', 'Personal Reflection'];
      if (suggestionTopics.includes(automationToEdit.topic)) {
        setTopic(automationToEdit.topic);
        setCustomTopic('');
      } else {
        // It's a custom topic
        setTopic('custom');
        setCustomTopic(automationToEdit.topic);
      }
      setFrequency(automationToEdit.frequency);
      setTime(automationToEdit.time);
    }
  }, [automationToEdit]);

  const handleSave = async () => {
    // Validate custom topic if selected
    if (topic === 'custom' && !customTopic.trim()) {
      alert('Please enter a custom topic or select a predefined topic.');
      return;
    }

    setIsSaving(true);
    await new Promise(res => setTimeout(res, 1000)); // Simulate API call
    
    // Use custom topic if selected, otherwise use the selected predefined topic
    const finalTopic = topic === 'custom' ? customTopic.trim() : topic;
    
    const newAutomation: Automation = {
      id: automationToEdit?.id || `auto-${Date.now()}`,
      topic: finalTopic,
      frequency,
      time,
      status: automationToEdit?.status || 'active',
    };
    await onSave(newAutomation);
    setIsSaving(false);
  };

  const suggestionTopics = ['Productivity Tip', 'Industry News', 'Company Update', 'Personal Reflection'];
  const frequencies = ['Daily', 'Weekdays', 'Weekly', 'Bi-weekly'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-surface rounded-xl shadow-lg w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-border-color flex justify-between items-center">
          <h2 className="text-lg font-bold text-text-primary">{automationToEdit ? 'Edit Automation' : 'New Automation'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-accent">
            <XIcon className="h-5 w-5 text-text-secondary" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-text-primary mb-1">Content Topic</label>
            <select
              id="topic"
              value={topic}
              onChange={e => {
                setTopic(e.target.value);
                if (e.target.value !== 'custom') {
                  setCustomTopic('');
                }
              }}
              className="w-full bg-surface border border-border-color rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {suggestionTopics.map(t => <option key={t} value={t}>{t}</option>)}
              <option value="custom">Custom Topic</option>
            </select>
            {topic === 'custom' && (
              <div className="mt-2">
                <input
                  type="text"
                  id="customTopic"
                  value={customTopic}
                  onChange={e => setCustomTopic(e.target.value)}
                  placeholder="Enter your custom topic (e.g., 'Future of Remote Work', 'AI in Healthcare')"
                  className="w-full bg-surface-accent border border-border-color rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <p className="text-xs text-text-secondary mt-1">Enter a specific topic for AI-generated content.</p>
              </div>
            )}
            {topic !== 'custom' && (
              <p className="text-xs text-text-secondary mt-1">The AI will generate posts based on this topic.</p>
            )}
          </div>
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-text-primary mb-1">Frequency</label>
            <select
              id="frequency"
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              className="w-full bg-surface border border-border-color rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            >
                {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-text-primary mb-1">Time to Post</label>
            <input
              type="time"
              id="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full bg-surface border border-border-color rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
        <div className="p-5 bg-surface-accent rounded-b-xl flex justify-end items-center space-x-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-primary bg-surface rounded-lg border border-border-color hover:bg-surface-accent/80 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors w-44 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
            {isSaving ? <SpinnerIcon className="h-5 w-5" /> : (automationToEdit ? 'Save Changes' : 'Create Automation')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutomationComposer;