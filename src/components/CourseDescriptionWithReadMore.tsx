import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CourseDescriptionWithReadMoreProps {
  description: string;
  className?: string;
}

const CourseDescriptionWithReadMore: React.FC<CourseDescriptionWithReadMoreProps> = ({
  description,
  className = "text-gray-600 text-sm mb-3 text-left"
}) => {
  // Check if description is longer than approximately 2 lines (roughly 120 characters)
  const isLongDescription = description.length > 120;
  const truncatedDescription = isLongDescription 
    ? description.substring(0, 120) + "..."
    : description;

  if (!isLongDescription) {
    return (
      <p className={className}>
        {description}
      </p>
    );
  }

  return (
    <div className={className}>
      <span>{truncatedDescription.replace(/\.\.\.$/, "")}</span>
      <Popover>
        <PopoverTrigger asChild>
          <button 
            className="text-primary hover:text-primary/80 underline ml-1 text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            Read more
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Course Description</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {description}
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CourseDescriptionWithReadMore;