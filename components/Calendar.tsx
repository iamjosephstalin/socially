import React, { useState } from 'react';
import { Post, PostStatus } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './icons/Icons';

interface CalendarProps {
  posts: Post[];
  onEdit: (post: Post) => void;
  onView: (post: Post) => void;
  onAddPostOnDate: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ posts, onEdit, onView, onAddPostOnDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDayOfWeek = startOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

  const daysInMonth = [];
  for (let i = 1; i <= endOfMonth.getDate(); i++) {
    daysInMonth.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getDate() === d2.getDate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Content Calendar</h2>
        <div className="flex items-center justify-between sm:justify-end space-x-4">
            <h3 className="text-lg sm:text-xl font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
            <div className="flex items-center">
                <button onClick={handlePrevMonth} className="p-2 rounded-md hover:bg-surface-accent"><ChevronLeftIcon className="h-5 w-5" /></button>
                <button onClick={handleNextMonth} className="p-2 rounded-md hover:bg-surface-accent"><ChevronRightIcon className="h-5 w-5" /></button>
            </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-subtle p-2 sm:p-4 overflow-hidden">
        <div className="grid grid-cols-7 text-center font-semibold text-sm text-text-secondary mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day} className="py-2">{day}</div>)}
        </div>
        <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-1 min-w-[35rem] sm:min-w-full">
              {Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`empty-${i}`} className="border border-transparent rounded-md min-h-[7rem] sm:min-h-[8rem]"></div>)}
              {daysInMonth.map(day => {
                const postsForDay = posts.filter(post => isSameDay(post.scheduledAt, day));
                const isToday = isSameDay(day, new Date());
                const isPast = day < new Date() && !isToday;
                
                const handleDayClick = () => {
                    if (!isPast) {
                        onAddPostOnDate(day);
                    }
                };
                
                return (
                  <div key={day.toString()} className={`border border-border-color rounded-md min-h-[7rem] sm:min-h-[8rem] p-1.5 overflow-y-auto transition-colors ${isToday ? 'bg-primary-accent' : ''} ${isPast ? 'bg-gray-50' : 'cursor-pointer hover:bg-surface-accent'}`} onClick={handleDayClick}>
                    <div className={`text-xs font-semibold text-right pr-1 ${isToday ? 'text-primary' : 'text-text-secondary'} ${isPast ? 'opacity-50': ''}`}>{day.getDate()}</div>
                     <div className="space-y-1 mt-1">
                      {postsForDay.map(post => {
                        const getDotColor = () => {
                            switch (post.status) {
                                case PostStatus.POSTED: return 'bg-green-500';
                                case PostStatus.SCHEDULED: return 'bg-amber-500';
                                case PostStatus.DRAFT: return 'bg-gray-500';
                                case PostStatus.ERROR: return 'bg-red-500';
                                default: return 'bg-gray-400';
                            }
                        }
                        
                        const handlePostClick = (e: React.MouseEvent) => {
                           e.stopPropagation(); 
                           if(post.status === PostStatus.POSTED) {
                             onView(post)
                           } else {
                             onEdit(post)
                           }
                        }

                        return (
                            <div key={post.id} onClick={handlePostClick} className="text-xs p-1 bg-surface rounded-md cursor-pointer hover:ring-1 hover:ring-primary truncate">
                               <div className="flex items-center">
                                 <span className={`h-1.5 w-1.5 rounded-full mr-1.5 flex-shrink-0 ${getDotColor()}`}></span>
                                 <span className="truncate">{post.content}</span>
                               </div>
                            </div>
                        );
                      })}
                     </div>
                  </div>
                );
              })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;