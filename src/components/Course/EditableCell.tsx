// components/Course/EditableCell.tsx
import { useState, useRef, useEffect } from 'react';
import { LoadBalancerService } from '@/api';
import { toast } from 'react-hot-toast';

interface EditableCellProps {
  value: string | number;
  courseId: string;
  fieldKey: string;
  onUpdate: (newValue: any) => void;
  type?: 'text' | 'number' | 'select';
  options?: string[];
}

export function EditableCell({ 
  value, 
  courseId, 
  fieldKey, 
  onUpdate, 
  type = 'text',
  options = []
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleUpdate = async () => {
    const api = new LoadBalancerService();
    try {
      const response = await api.putPublic({
        endpoint: `/course/update?id=${courseId}`,
        reqBody: {
          key: fieldKey,
          value: editValue
        }
      });
      
      if (response) {
        onUpdate(editValue);
        toast.success(`Updated ${fieldKey} successfully`);
      }
    } catch (error) {
      toast.error(`Failed to update ${fieldKey}`);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    if (type === 'select') {
      return (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={editValue as string}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleUpdate}
          className="w-full p-1 border rounded"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleUpdate}
        onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
        className="w-full p-1 border rounded"
      />
    );
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-gray-100 p-1 rounded"
    >
      {value}
    </div>
  );
}