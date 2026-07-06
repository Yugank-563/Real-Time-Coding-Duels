import { useState } from 'react';
import { X } from 'lucide-react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';

const EditProfileModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [username, setUsername] = useState(initialData.username || '');
  const [name,     setName]     = useState(initialData.name     || '');
  const [bio,      setBio]      = useState(initialData.bio      || '');
  const [country,  setCountry]  = useState(initialData.country  || '');
  const [saving, setSaving]     = useState(false);

  if (!isOpen) return null;

  const handleSaveClick = async () => {
    const hasChanges =
      username !== (initialData.username || '') ||
      name !== (initialData.name || '') ||
      bio !== (initialData.bio || '') ||
      country !== (initialData.country || '');

    if (!hasChanges) {
      onClose();
      return;
    }

    setSaving(true);
    const res = await onSave({ username, name, bio, country });
    setSaving(false);
    if (res?.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-[4px] flex items-center justify-center z-[1000]">
      <div className="card w-[85%] max-w-[380px] max-h-[88vh] flex flex-col p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center pb-3 border-b border-[var(--bg-overlay)] mb-3">
          <h3 className="m-0 text-[0.95rem] font-bold text-[var(--text-primary)]">Edit Profile</h3>
          <button type="button" onClick={onClose}
                  className="bg-transparent border-none cursor-pointer text-[var(--text-muted)] p-0 flex hover:text-[var(--text-primary)] transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-3">
          <Input label="Username" value={username}
                 onChange={e => setUsername(e.target.value)} placeholder="Enter username" />
          <Input label="Name" value={name}
                 onChange={e => setName(e.target.value)} placeholder="Enter your name" />
          <Textarea label="Bio" value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Tell us about yourself…" maxLength={250} 
                    headerRight={<span className="text-[0.7rem] text-[var(--text-muted)] font-mono">{bio?.length || 0}/250</span>}
          />
          <Input label="Country" value={country}
                 onChange={e => setCountry(e.target.value)} placeholder="e.g. India, USA" />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[var(--bg-overlay)] mt-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={saving} onClick={handleSaveClick}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
